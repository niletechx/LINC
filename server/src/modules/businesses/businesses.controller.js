const businessesService = require('./businesses.service');
const { success } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const listBusinesses = asyncHandler(async (req, res) => {
  const filters = { q: req.query.q, city: req.query.city, limit: req.query.limit };
  const data = await businessesService.listBusinesses(filters);
  return success(res, data);
});

const getById = asyncHandler(async (req, res) => {
  const business = await businessesService.getBusinessById(req.params.id);
  return success(res, business);
});

const getMe = asyncHandler(async (req, res) => {
  const business = await businessesService.getMyBusiness(req.user.id);
  return success(res, business);
});

const createMe = asyncHandler(async (req, res) => {
  const business = await businessesService.createBusiness(req.user.id, req.body);
  return success(res, business, 'Business profile created successfully', 201);
});

const updateMe = asyncHandler(async (req, res) => {
  const business = await businessesService.updateBusiness(req.user.id, req.body);
  return success(res, business, 'Business profile updated successfully');
});

module.exports = { listBusinesses, getById, getMe, createMe, updateMe };
