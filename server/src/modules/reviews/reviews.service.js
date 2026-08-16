const reviewsRepo = require('./reviews.repository');
const bookingRepo = require('../booking/booking.repository');

const REVIEW_FIELDS = ['booking_id', 'entity_type', 'entity_id', 'rating', 'comment', 'is_visible'];

function normalizeReviewInput(payload = {}) {
  const filtered = {};
  REVIEW_FIELDS.forEach((field) => {
    if (payload[field] !== undefined) filtered[field] = payload[field];
  });
  return filtered;
}

async function listReviews(entityType, entityId) {
  return reviewsRepo.listByEntity(entityType, entityId);
}

async function listMyReviews(userId) {
  return reviewsRepo.listByReviewer(userId);
}

async function createReview(reviewerId, payload = {}) {
  const data = normalizeReviewInput(payload);

  if (!data.booking_id || !data.entity_type || !data.entity_id || !data.rating) {
    const err = new Error('booking_id, entity_type, entity_id, and rating are required');
    err.statusCode = 400;
    throw err;
  }

  if (!['provider', 'business', 'organization'].includes(data.entity_type)) {
    const err = new Error('Invalid entity_type');
    err.statusCode = 400;
    throw err;
  }

  if (Number(data.rating) < 1 || Number(data.rating) > 5) {
    const err = new Error('rating must be between 1 and 5');
    err.statusCode = 400;
    throw err;
  }

  const booking = await bookingRepo.findById(data.booking_id);
  if (!booking) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }

  if (booking.requester_id !== reviewerId) {
    const err = new Error('You can only review your own bookings');
    err.statusCode = 403;
    throw err;
  }

  const existing = await reviewsRepo.findByBookingId(data.booking_id);
  if (existing) {
    const err = new Error('A review for this booking already exists');
    err.statusCode = 409;
    throw err;
  }

  return reviewsRepo.createReview({ reviewer_id: reviewerId, ...data, is_visible: data.is_visible ?? true });
}

async function updateReview(reviewerId, reviewId, payload = {}) {
  const existing = await reviewsRepo.findById(reviewId);
  if (!existing) {
    const err = new Error('Review not found');
    err.statusCode = 404;
    throw err;
  }

  if (existing.reviewer_id !== reviewerId) {
    const err = new Error('You can only update your own review');
    err.statusCode = 403;
    throw err;
  }

  const data = normalizeReviewInput(payload);
  if (Object.keys(data).length === 0) {
    const err = new Error('No valid fields to update');
    err.statusCode = 400;
    throw err;
  }

  return reviewsRepo.updateReview(reviewId, data);
}

module.exports = { listReviews, listMyReviews, createReview, updateReview };
