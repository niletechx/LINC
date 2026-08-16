const express = require('express');
const router = express.Router();
const bookingController = require('./booking.controller');
const authMiddleware = require('../../middleware/auth.middleware');

router.use(authMiddleware);
router.get('/', bookingController.listBookings);
router.get('/:id', bookingController.getById);
router.post('/', bookingController.createBooking);
router.put('/:id', bookingController.updateBooking);

module.exports = router;
