const express = require('express');
const router = express.Router();
const reviewsController = require('./reviews.controller');
const authMiddleware = require('../../middleware/auth.middleware');

router.get('/:entityType/:entityId', reviewsController.listReviews);
router.use(authMiddleware);
router.get('/me', reviewsController.listMyReviews);
router.post('/', reviewsController.createReview);
router.put('/:id', reviewsController.updateReview);

module.exports = router;
