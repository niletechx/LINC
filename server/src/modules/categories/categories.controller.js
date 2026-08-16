const categoriesService = require('./categories.service');
const { success } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const getAll = asyncHandler(async (req, res) => {
  const categories = await categoriesService.getAllCategories();
  return success(res, categories);
});

const getById = asyncHandler(async (req, res) => {
  const category = await categoriesService.getCategoryById(req.params.id);
  return success(res, category);
});

// Admin only — seed default categories
const seed = asyncHandler(async (req, res) => {
  const result = await categoriesService.seedCategories();
  return success(res, result);
});

module.exports = { getAll, getById, seed };
