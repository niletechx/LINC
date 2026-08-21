const express = require('express');
const router = express.Router();
const bookingController = require('./booking.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { optionalAuth } = require('../../middleware/auth.middleware');

router.get('/', optionalAuth, bookingController.listBookings);
router.get('/:id', optionalAuth, bookingController.getById);
router.post('/', authMiddleware, bookingController.createBooking);
router.put('/:id', authMiddleware, bookingController.updateBooking);

// Provider marks a booking as complete (starts 72h escrow window if applicable)
router.post('/:id/complete', authMiddleware, bookingController.markComplete);

module.exports = router;
