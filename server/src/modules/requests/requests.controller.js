const requestsService = require('./requests.service');
const { success } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const listRequests = asyncHandler(async (req, res) => {
  const filters = {
    user_id: req.query.user_id,
    status: req.query.status,
    limit: req.query.limit,
  };
  const requests = await requestsService.listRequests(filters);
  return success(res, requests);
});

const getById = asyncHandler(async (req, res) => {
  const record = await requestsService.getRequestById(req.params.id);
  return success(res, record);
});

const createRequest = asyncHandler(async (req, res) => {
  const record = await requestsService.createRequest(req.user.id, req.body);
  return success(res, record, 'Request created successfully', 201);
});

const updateRequest = asyncHandler(async (req, res) => {
  const record = await requestsService.updateRequest(req.user.id, req.params.id, req.body);
  return success(res, record, 'Request updated successfully');
});

module.exports = { listRequests, getById, createRequest, updateRequest };
