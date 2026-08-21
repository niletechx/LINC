const reportsService = require('./reports.service');
const { success } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const listReports = asyncHandler(async (req, res) => {
  const reports = await reportsService.listReports();
  return success(res, reports);
});

const getById = asyncHandler(async (req, res) => {
  const report = await reportsService.getReport(req.params.id);
  return success(res, report);
});

const createReport = asyncHandler(async (req, res) => {
  const report = await reportsService.createReport(req.user.id, req.body);
  return success(res, report, 'Report submitted successfully', 201);
});

const reviewReport = asyncHandler(async (req, res) => {
  const report = await reportsService.reviewReport(req.user.id, req.params.id, req.body);
  return success(res, report, 'Report reviewed successfully');
});

module.exports = { listReports, getById, createReport, reviewReport };
