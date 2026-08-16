const chapaClient = require('./chapa.client');
const escrowRepo = require('./escrow.repository');
const bookingRepo = require('../booking/booking.repository');
const supabase = require('../../config/supabase');
const logger = require('../../utils/logger');

const AUTO_RELEASE_HOURS = 72;
const MAX_USER_DISPUTES_PER_MONTH = 3;

/**
 * Initiate escrow for a booking.
 * Creates escrow_transaction record, calls Chapa, returns checkout URL.
 */
async function initiate({ bookingId, userId, userEmail, userFirstName, userLastName, userPhone }) {
  // Validate booking belongs to user and is in correct state
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) {
    const e = new Error('Booking not found');
    e.statusCode = 404;
    throw e;
  }
  if (booking.requester_id !== userId) {
    const e = new Error('Forbidden');
    e.statusCode = 403;
    throw e;
  }
  if (!['pending', 'confirmed'].includes(booking.status)) {
    const e = new Error('Booking must be pending or confirmed to initiate escrow');
    e.statusCode = 400;
    throw e;
  }

  // Check no existing active escrow for this booking
  const existing = await escrowRepo.findByBookingId(bookingId);
  if (existing && !['cancelled', 'refunded'].includes(existing.status)) {
    const e = new Error('An active escrow already exists for this booking');
    e.statusCode = 409;
    throw e;
  }

  const amount = booking.agreed_price;
  const currency = booking.currency || 'ETB';
  const { platformFee, providerAmount } = chapaClient.calculateAmounts(amount);
  const txRef = chapaClient.generateTxRef(bookingId);

  // Initialize Chapa payment
  const chapaData = await chapaClient.initializePayment({
    amount,
    currency,
    email: userEmail,
    firstName: userFirstName,
    lastName: userLastName,
    phone: userPhone,
    txRef,
    bookingId,
    serviceDescription: `LINC booking #${bookingId}`,
  });

  // Create escrow record
  const escrow = await escrowRepo.create({
    booking_id: bookingId,
    requester_id: userId,
    provider_entity_type: booking.entity_type,
    provider_entity_id: booking.entity_id,
    amount,
    platform_fee: platformFee,
    provider_amount: providerAmount,
    currency,
    status: 'awaiting_payment',
    chapa_tx_ref: txRef,
    chapa_checkout_url: chapaData.checkout_url,
  });

  // Update booking status
  await bookingRepo.updateBooking(bookingId, { status: 'awaiting_payment' });

  return { escrowId: escrow.id, checkoutUrl: chapaData.checkout_url, txRef };
}

/**
 * Handle Chapa webhook — verifies payment and marks funds as held.
 * IMPORTANT: Always re-verify via API; never trust raw webhook body alone.
 */
async function handleWebhook({ txRef }) {
  const escrow = await escrowRepo.findByTxRef(txRef);
  if (!escrow) {
    logger.warn(`Webhook: escrow not found for tx_ref ${txRef}`);
    return;
  }
  if (escrow.status === 'funds_held') {
    logger.info(`Webhook: already processed ${txRef}`);
    return;
  }

  // Verify with Chapa API
  const chapaVerification = await chapaClient.verifyPayment(txRef);
  if (chapaVerification.status !== 'success') {
    logger.warn(`Webhook: Chapa payment not successful for ${txRef}: ${chapaVerification.status}`);
    return;
  }

  // Update escrow: mark funds as held
  await escrowRepo.update(escrow.id, {
    status: 'funds_held',
    chapa_reference: chapaVerification.reference,
  });

  // Update booking
  await bookingRepo.updateBooking(escrow.booking_id, { status: 'paid_escrow' });

  logger.info(`Escrow funds held: ${escrow.id} | booking: ${escrow.booking_id}`);
}

/**
 * Provider marks service as complete.
 * Starts the 72-hour auto-release countdown.
 */
async function markServiceComplete({ bookingId, providerUserId }) {
  const escrow = await escrowRepo.findByBookingId(bookingId);
  if (!escrow) {
    const e = new Error('No escrow found for this booking');
    e.statusCode = 404;
    throw e;
  }
  if (escrow.status !== 'funds_held') {
    const e = new Error('Funds must be held before marking complete');
    e.statusCode = 400;
    throw e;
  }

  // Verify the caller is the provider for this booking
  const booking = await bookingRepo.findById(bookingId);
  const isProvider = await _isProviderForBooking(providerUserId, booking);
  if (!isProvider) {
    const e = new Error('Forbidden — only the provider can mark this complete');
    e.statusCode = 403;
    throw e;
  }

  const autoReleaseAt = new Date(Date.now() + AUTO_RELEASE_HOURS * 3600 * 1000);

  await escrowRepo.update(escrow.id, {
    status: 'pending_confirmation',
    auto_release_at: autoReleaseAt.toISOString(),
  });

  await bookingRepo.updateBooking(bookingId, { status: 'pending_confirmation' });

  logger.info(`Service marked complete. Escrow ${escrow.id} auto-releases at ${autoReleaseAt.toISOString()}`);
  return { autoReleaseAt };
}

/**
 * Requester confirms they received the service.
 * Releases funds to provider immediately.
 */
async function confirmDelivery({ escrowId, userId }) {
  const escrow = await escrowRepo.findById(escrowId);
  if (!escrow) {
    const e = new Error('Escrow not found');
    e.statusCode = 404;
    throw e;
  }
  if (escrow.requester_id !== userId) {
    const e = new Error('Forbidden');
    e.statusCode = 403;
    throw e;
  }
  if (escrow.status !== 'pending_confirmation') {
    const e = new Error(`Cannot confirm — escrow status is: ${escrow.status}`);
    e.statusCode = 400;
    throw e;
  }

  await _releaseFunds(escrow);
  return { message: 'Service confirmed. Funds released to provider.' };
}

/**
 * Requester disputes the delivery.
 * Freezes the escrow and opens a dispute record.
 */
async function raiseDispute({ escrowId, userId, reason, evidenceUrls = [] }) {
  const escrow = await escrowRepo.findById(escrowId);
  if (!escrow) {
    const e = new Error('Escrow not found');
    e.statusCode = 404;
    throw e;
  }
  if (escrow.requester_id !== userId) {
    const e = new Error('Forbidden');
    e.statusCode = 403;
    throw e;
  }
  if (!['pending_confirmation', 'funds_held'].includes(escrow.status)) {
    const e = new Error(`Cannot dispute — escrow status is: ${escrow.status}`);
    e.statusCode = 400;
    throw e;
  }

  // Anti-abuse: limit disputes per user per month
  const monthAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  const { count } = await supabase
    .from('escrow_disputes')
    .select('id', { count: 'exact', head: true })
    .eq('raised_by', userId)
    .gte('created_at', monthAgo);

  if ((count || 0) >= MAX_USER_DISPUTES_PER_MONTH) {
    const e = new Error('Dispute limit reached for this month. Contact support.');
    e.statusCode = 429;
    throw e;
  }

  // Mark escrow as disputed
  await escrowRepo.update(escrow.id, { status: 'disputed' });
  await bookingRepo.updateBooking(escrow.booking_id, { status: 'disputed' });

  // Create dispute record
  const dispute = await escrowRepo.createDispute({
    escrow_id: escrow.id,
    raised_by: userId,
    reason,
    evidence_urls: evidenceUrls,
    status: 'open',
  });

  logger.info(`Dispute raised: ${dispute.id} on escrow ${escrow.id}`);
  return dispute;
}

/**
 * Admin resolves a dispute.
 * resolution: 'refund' → money back to user | 'release' → money to provider
 */
async function resolveDispute({ disputeId, adminId, resolution, adminNote }) {
  const dispute = await escrowRepo.findDisputeById(disputeId);
  if (!dispute) {
    const e = new Error('Dispute not found');
    e.statusCode = 404;
    throw e;
  }
  if (dispute.status === 'resolved_refund' || dispute.status === 'resolved_release') {
    const e = new Error('Dispute already resolved');
    e.statusCode = 409;
    throw e;
  }

  const escrow = dispute.escrow_transactions;

  if (resolution === 'refund') {
    await escrowRepo.update(escrow.id, { status: 'refunded', refunded_at: new Date().toISOString() });
    await bookingRepo.updateBooking(escrow.booking_id, { status: 'refunded' });
    logger.info(`Dispute ${disputeId} resolved: REFUND to user ${escrow.requester_id}`);
  } else if (resolution === 'release') {
    await _releaseFunds(escrow);
  }

  await escrowRepo.updateDispute(disputeId, {
    status: resolution === 'refund' ? 'resolved_refund' : 'resolved_release',
    admin_note: adminNote,
    resolved_by: adminId,
    resolved_at: new Date().toISOString(),
  });

  return { resolution };
}

/**
 * Internal: releases funds to provider.
 */
async function _releaseFunds(escrow) {
  await escrowRepo.update(escrow.id, {
    status: 'released',
    released_at: new Date().toISOString(),
  });
  await bookingRepo.updateBooking(escrow.booking_id, { status: 'completed' });
  logger.info(`Escrow ${escrow.id} released. Provider ${escrow.provider_entity_type}:${escrow.provider_entity_id} receives ${escrow.provider_amount} ${escrow.currency}`);
}

/**
 * Internal: Check if a user is the provider for a booking.
 */
async function _isProviderForBooking(userId, booking) {
  if (booking.entity_type === 'provider') {
    const { data } = await supabase
      .from('provider_profiles')
      .select('id')
      .eq('id', booking.entity_id)
      .eq('user_id', userId)
      .single();
    return !!data;
  } else if (booking.entity_type === 'business') {
    const { data } = await supabase
      .from('business_members')
      .select('id')
      .eq('business_id', booking.entity_id)
      .eq('user_id', userId)
      .in('role', ['owner', 'manager'])
      .single();
    return !!data;
  } else if (booking.entity_type === 'organization') {
    const { data } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', booking.entity_id)
      .eq('user_id', userId)
      .in('role', ['owner', 'manager'])
      .single();
    return !!data;
  }
  return false;
}

module.exports = {
  initiate,
  handleWebhook,
  markServiceComplete,
  confirmDelivery,
  raiseDispute,
  resolveDispute,
  _releaseFunds,
};
