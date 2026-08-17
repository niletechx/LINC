const bookingRepo = require('./booking.repository');
const servicesRepo = require('../services/services.repository');
const supabase = require('../../config/supabase');

const BOOKING_FIELDS = [
  'service_id', 'entity_type', 'entity_id', 'scheduled_at',
  'duration_hours', 'agreed_price', 'currency', 'notes', 'status',
];

function normalizeBookingInput(payload = {}) {
  const filtered = {};
  BOOKING_FIELDS.forEach((field) => {
    if (payload[field] !== undefined) filtered[field] = payload[field];
  });
  return filtered;
}

async function listBookings(userId) {
  return bookingRepo.listBookings(userId);
}

async function getBookingById(userId, id) {
  const record = await bookingRepo.findById(id);
  if (!record) { const err = new Error('Booking not found'); err.statusCode = 404; throw err; }
  if (record.requester_id !== userId) { const err = new Error('Forbidden'); err.statusCode = 403; throw err; }
  return record;
}

async function createBooking(userId, payload = {}) {
  const data = normalizeBookingInput(payload);
  
  let service = null;
  if (data.service_id && data.service_id.length === 36) {
    service = await servicesRepo.findById(data.service_id);
  }
  if (!service && data.entity_id && data.entity_id.length === 36) {
    const { data: svcList } = await supabase
      .from('services')
      .select('*')
      .eq('provider_id', data.entity_id)
      .limit(1);
    if (svcList && svcList.length > 0) service = svcList[0];
  }

  const entityType = data.entity_type || (service?.provider_id ? 'provider' : service?.business_id ? 'business' : 'organization');
  const entityId = data.entity_id || service?.provider_id || service?.business_id || service?.organization_id;

  return bookingRepo.createBooking({
    requester_id: userId,
    service_id: service ? service.id : null,
    entity_type: entityType,
    entity_id: entityId,
    scheduled_at: data.scheduled_at,
    duration_hours: data.duration_hours || 1,
    agreed_price: data.agreed_price ?? (service ? service.price_amount : 350),
    currency: data.currency || (service ? service.currency : 'ETB'),
    notes: data.notes,
    status: data.status || 'pending',
  });
}

async function updateBooking(userId, id, payload = {}) {
  const existing = await bookingRepo.findById(id);
  if (!existing) { const err = new Error('Booking not found'); err.statusCode = 404; throw err; }
  if (existing.requester_id !== userId) {
    const err = new Error('You can only update your own bookings'); err.statusCode = 403; throw err;
  }
  const data = normalizeBookingInput(payload);
  if (Object.keys(data).length === 0) {
    const err = new Error('No valid fields to update'); err.statusCode = 400; throw err;
  }
  return bookingRepo.updateBooking(id, data);
}

/**
 * Provider marks a booking as complete.
 * Triggers the 72-hour escrow confirmation window.
 * Delegates the actual escrow state change to escrow.service to avoid circular deps.
 */
async function markComplete(bookingId, providerUserId) {
  const booking = await bookingRepo.findById(bookingId);
  if (!booking) { const err = new Error('Booking not found'); err.statusCode = 404; throw err; }

  const allowedStatuses = ['confirmed', 'in_progress', 'paid_escrow'];
  if (!allowedStatuses.includes(booking.status)) {
    const err = new Error(`Cannot mark complete — booking status is: ${booking.status}`);
    err.statusCode = 400; throw err;
  }

  // Escrow path: delegate to escrow.service (lazy require to avoid circular deps)
  const { findByBookingId } = require('../payments/escrow.repository');
  const escrow = await findByBookingId(bookingId);

  if (escrow && escrow.status === 'funds_held') {
    // Escrow booking — delegate to escrow service
    const escrowService = require('../payments/escrow.service');
    return escrowService.markServiceComplete({ bookingId, providerUserId });
  }

  // Non-escrow booking — just update the status
  const isProvider = await _isProviderForBooking(providerUserId, booking);
  if (!isProvider) {
    const err = new Error('Forbidden — only the assigned provider can mark this complete');
    err.statusCode = 403; throw err;
  }

  return bookingRepo.updateBooking(bookingId, { status: 'completed' });
}

async function _isProviderForBooking(userId, booking) {
  if (booking.entity_type === 'provider') {
    const { data } = await supabase.from('provider_profiles').select('id')
      .eq('id', booking.entity_id).eq('user_id', userId).single();
    return !!data;
  } else if (booking.entity_type === 'business') {
    const { data } = await supabase.from('business_members').select('id')
      .eq('business_id', booking.entity_id).eq('user_id', userId).in('role', ['owner', 'manager']).single();
    return !!data;
  } else if (booking.entity_type === 'organization') {
    const { data } = await supabase.from('organization_members').select('id')
      .eq('organization_id', booking.entity_id).eq('user_id', userId).in('role', ['owner', 'manager']).single();
    return !!data;
  }
  return false;
}

module.exports = { listBookings, getBookingById, createBooking, updateBooking, markComplete };
