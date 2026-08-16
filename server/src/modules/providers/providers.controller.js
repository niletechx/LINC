const providersService = require('./providers.service');
const { success } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const getMe = asyncHandler(async (req, res) => {
  const profile = await providersService.getMyProfile(req.user.id);
  return success(res, profile);
});

const createMe = asyncHandler(async (req, res) => {
  const profile = await providersService.createProviderProfile(req.user.id, req.body);
  return success(res, profile, 'Provider profile created successfully', 201);
});

const updateMe = asyncHandler(async (req, res) => {
  const profile = await providersService.updateProviderProfile(req.user.id, req.body);
  return success(res, profile, 'Provider profile updated successfully');
});

const getById = asyncHandler(async (req, res) => {
  const profile = await providersService.getProviderProfile(req.params.id);
  return success(res, profile);
});

const listProviders = asyncHandler(async (req, res) => {
  const filters = {
    city: req.query.city,
    minRate: req.query.minRate,
    maxRate: req.query.maxRate,
    limit: req.query.limit,
  };
  const data = await providersService.listProviders(filters);
  return success(res, data);
});

module.exports = {
  getMe,
  createMe,
  updateMe,
  getById,
  listProviders,
};
