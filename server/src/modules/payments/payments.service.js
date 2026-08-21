const escrowRepo = require('./escrow.repository');
const bookingRepo = require('../booking/booking.repository');
const chapaClient = require('./chapa.client');
const logger = require('../../utils/logger');

async function listUserEscrows(userId) {
  return escrowRepo.findByUser(userId);
}

async function getEscrowById(userId, escrowId) {
  const escrow = await escrowRepo.findById(escrowId);
  if (!escrow) {
    const err = new Error('Escrow record not found');
    err.statusCode = 404;
    throw err;
  }

  if (escrow.requester_id !== userId) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  return escrow;
}

async function initiateEscrow({ bookingId, requesterId, email, firstName, lastName, phone }) {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }

  if (booking.requester_id !== requesterId) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  const existing = await escrowRepo.findByBookingId(bookingId);
  if (existing && !['cancelled', 'refunded'].includes(existing.status)) {
    const err = new Error('An active escrow already exists for this booking');
    err.statusCode = 409;
    throw err;
  }

  const amount = Number(booking.agreed_price || 0);
  if (!amount || amount <= 0) {
    const err = new Error('Booking amount must be greater than zero');
    err.statusCode = 400;
    throw err;
  }

  const { platformFee, providerAmount } = chapaClient.calculateAmounts(amount);
  const txRef = chapaClient.generateTxRef(bookingId);

  const chapaData = await chapaClient.initializePayment({
    amount,
    currency: booking.currency || 'ETB',
    email,
    firstName,
    lastName,
    phone,
    txRef,
    bookingId,
    serviceDescription: `LINC booking #${bookingId}`,
  });

  const escrow = await escrowRepo.create({
    booking_id: bookingId,
    requester_id: requesterId,
    provider_entity_type: booking.entity_type || 'provider',
    provider_entity_id: booking.entity_id,
    amount,
    platform_fee: platformFee,
    provider_amount: providerAmount,
    currency: booking.currency || 'ETB',
    status: 'awaiting_payment',
    chapa_tx_ref: txRef,
    chapa_checkout_url: chapaData.checkout_url,
    chapa_reference: null,
  });

  await bookingRepo.updateBooking(bookingId, { status: 'awaiting_payment' });

  return {
    id: escrow.id,
    booking_id: bookingId,
    checkout_url: chapaData.checkout_url,
    tx_ref: txRef,
    status: escrow.status,
    amount,
    platform_fee: platformFee,
    provider_amount: providerAmount,
  };
}

async function handleChapaWebhook({ tx_ref }) {
  const escrow = await escrowRepo.findByTxRef(tx_ref);
  if (!escrow) {
    logger.warn(`Chapa webhook received for unknown tx_ref: ${tx_ref}`);
    return { ok: true, skipped: true };
  }

  const verification = await chapaClient.verifyPayment(tx_ref);
  if (!verification || verification.status !== 'success') {
    logger.warn(`Chapa verification failed for ${tx_ref}: ${verification?.status || 'unknown status'}`);
    return { ok: false, status: 'not_successful' };
  }

  await escrowRepo.update(escrow.id, {
    status: 'funds_held',
    chapa_reference: verification.reference,
    auto_release_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
  });

  await bookingRepo.updateBooking(escrow.booking_id, { status: 'paid_escrow' });

  return { ok: true, status: 'funds_held' };
}

async function raiseDispute({ escrowId, raisedBy, reason, evidenceUrls = [] }) {
  const escrow = await escrowRepo.findById(escrowId);
  if (!escrow) {
    const err = new Error('Escrow record not found');
    err.statusCode = 404;
    throw err;
  }

  if (escrow.requester_id !== raisedBy && escrow.provider_entity_id !== raisedBy) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  if (!['funds_held', 'pending_confirmation'].includes(escrow.status)) {
    const err = new Error('Dispute can only be raised while funds are held');
    err.statusCode = 400;
    throw err;
  }

  const dispute = await escrowRepo.createDispute({
    escrow_id: escrowId,
    raised_by: raisedBy,
    reason,
    evidence_urls: evidenceUrls,
    status: 'open',
  });

  await escrowRepo.update(escrowId, { status: 'disputed' });
  await bookingRepo.updateBooking(escrow.booking_id, { status: 'disputed' });

  return dispute;
}

module.exports = {
  listUserEscrows,
  getEscrowById,
  initiateEscrow,
  handleChapaWebhook,
  raiseDispute,
};
