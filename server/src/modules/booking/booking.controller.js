const bookingService = require('./booking.service');
const { success, error } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const listBookings = asyncHandler(async (req, res) => {
  const result = await bookingService.listBookings(req.user.id);
  return success(res, result);
});

const getById = asyncHandler(async (req, res) => {
  const result = await bookingService.getBookingById(req.user.id, req.params.id);
  return success(res, result);
});

const createBooking = asyncHandler(async (req, res) => {
  const result = await bookingService.createBooking(req.user.id, req.body);
  return success(res, result, 'Booking created', 201);
});

const updateBooking = asyncHandler(async (req, res) => {
  const result = await bookingService.updateBooking(req.user.id, req.params.id, req.body);
  return success(res, result);
});

const markComplete = asyncHandler(async (req, res) => {
  const result = await bookingService.markComplete(req.params.id, req.user.id);
  return success(res, result, 'Booking marked as complete. 72-hour confirmation window started.');
});

module.exports = { listBookings, getById, createBooking, updateBooking, markComplete };
