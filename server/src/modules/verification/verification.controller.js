const verificationService = require('./verification.service');
const { success } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const listMyRequests = asyncHandler(async (req, res) => {
  const requests = await verificationService.listMyRequests(req.user.id);
  return success(res, requests);
});

const getById = asyncHandler(async (req, res) => {
  const request = await verificationService.getRequest(req.user.id, req.params.id);
  return success(res, request);
});

const createRequest = asyncHandler(async (req, res) => {
  const request = await verificationService.createRequest(req.user.id, req.body);
  return success(res, request, 'Verification request submitted successfully', 201);
});

const reviewRequest = asyncHandler(async (req, res) => {
  const request = await verificationService.reviewRequest(req.user.id, req.params.id, req.body);
  return success(res, request, 'Verification request reviewed successfully');
});

module.exports = { listMyRequests, getById, createRequest, reviewRequest };
