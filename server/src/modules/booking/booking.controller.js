const bookingService = require('./booking.service');
const { success } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const listBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.listBookings(req.user.id);
  return success(res, bookings);
});

const getById = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingById(req.user.id, req.params.id);
  return success(res, booking);
});

const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.user.id, req.body);
  return success(res, booking, 'Booking created successfully', 201);
});

const updateBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.updateBooking(req.user.id, req.params.id, req.body);
  return success(res, booking, 'Booking updated successfully');
});

module.exports = { listBookings, getById, createBooking, updateBooking };
