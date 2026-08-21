const express = require('express');
const router = express.Router();
const bookingController = require('./booking.controller');
const authMiddleware = require('../../middleware/auth.middleware');

router.use(authMiddleware);
router.get('/', bookingController.listBookings);
router.get('/:id', bookingController.getById);
router.post('/', bookingController.createBooking);
router.put('/:id', bookingController.updateBooking);

// Provider marks a booking as complete (starts 72h escrow window if applicable)
router.post('/:id/complete', bookingController.markComplete);

module.exports = router;
