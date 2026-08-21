const organizationsService = require('./organizations.service');
const { success } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const listOrganizations = asyncHandler(async (req, res) => {
  const filters = { q: req.query.q, city: req.query.city, limit: req.query.limit };
  const data = await organizationsService.listOrganizations(filters);
  return success(res, data);
});

const getById = asyncHandler(async (req, res) => {
  const org = await organizationsService.getOrganizationById(req.params.id);
  return success(res, org);
});

const getMe = asyncHandler(async (req, res) => {
  const org = await organizationsService.getMyOrganization(req.user.id);
  return success(res, org);
});

const createMe = asyncHandler(async (req, res) => {
  const org = await organizationsService.createOrganization(req.user.id, req.body);
  return success(res, org, 'Organization profile created successfully', 201);
});

const updateMe = asyncHandler(async (req, res) => {
  const org = await organizationsService.updateOrganization(req.user.id, req.body);
  return success(res, org, 'Organization profile updated successfully');
});

module.exports = { listOrganizations, getById, getMe, createMe, updateMe };
