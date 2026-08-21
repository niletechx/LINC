const reviewsService = require('./reviews.service');
const { success } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const listReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewsService.listReviews(req.params.entityType, req.params.entityId);
  return success(res, reviews);
});

const listMyReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewsService.listMyReviews(req.user.id);
  return success(res, reviews);
});

const createReview = asyncHandler(async (req, res) => {
  const review = await reviewsService.createReview(req.user.id, req.body);
  return success(res, review, 'Review submitted successfully', 201);
});

const updateReview = asyncHandler(async (req, res) => {
  const review = await reviewsService.updateReview(req.user.id, req.params.id, req.body);
  return success(res, review, 'Review updated successfully');
});

module.exports = { listReviews, listMyReviews, createReview, updateReview };
