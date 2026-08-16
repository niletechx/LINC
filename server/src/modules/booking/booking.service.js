const bookingRepo = require('./booking.repository');
const servicesRepo = require('../services/services.repository');

const BOOKING_FIELDS = [
  'service_id',
  'entity_type',
  'entity_id',
  'scheduled_at',
  'duration_hours',
  'agreed_price',
  'currency',
  'notes',
  'status',
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
  if (!record) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }

  if (record.requester_id !== userId) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  return record;
}

async function createBooking(userId, payload = {}) {
  const data = normalizeBookingInput(payload);
  if (!data.service_id) {
    const err = new Error('service_id is required');
    err.statusCode = 400;
    throw err;
  }

  const service = await servicesRepo.findById(data.service_id);
  if (!service) {
    const err = new Error('Service not found');
    err.statusCode = 404;
    throw err;
  }

  const entityType = service.provider_id ? 'provider' : service.business_id ? 'business' : 'organization';
  const entityId = service.provider_id || service.business_id || service.organization_id;

  return bookingRepo.createBooking({
    requester_id: userId,
    service_id: data.service_id,
    entity_type: data.entity_type || entityType,
    entity_id: data.entity_id || entityId,
    scheduled_at: data.scheduled_at,
    duration_hours: data.duration_hours,
    agreed_price: data.agreed_price ?? service.price_amount,
    currency: data.currency || service.currency || 'ETB',
    notes: data.notes,
    status: data.status || 'pending',
  });
}

async function updateBooking(userId, id, payload = {}) {
  const existing = await bookingRepo.findById(id);
  if (!existing) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }

  if (existing.requester_id !== userId) {
    const err = new Error('You can only update your own bookings');
    err.statusCode = 403;
    throw err;
  }

  const data = normalizeBookingInput(payload);
  if (Object.keys(data).length === 0) {
    const err = new Error('No valid fields to update');
    err.statusCode = 400;
    throw err;
  }

  return bookingRepo.updateBooking(id, data);
}

module.exports = { listBookings, getBookingById, createBooking, updateBooking };
