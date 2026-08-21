const adminService = require('./admin.service');
const { success } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const getOverview = asyncHandler(async (req, res) => {
  const overview = await adminService.getOverview();
  return success(res, overview);
});

const listUsers = asyncHandler(async (req, res) => {
  const filters = { is_admin: req.query.is_admin, limit: req.query.limit };
  const users = await adminService.listUsers(filters);
  return success(res, users);
});

const listReports = asyncHandler(async (req, res) => {
  const reports = await adminService.listReports();
  return success(res, reports);
});

const listVerificationRequests = asyncHandler(async (req, res) => {
  const requests = await adminService.listVerificationRequests();
  return success(res, requests);
});

module.exports = { getOverview, listUsers, listReports, listVerificationRequests };
