const matchingService = require('./matching.service');
const { success } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const listMatches = asyncHandler(async (req, res) => {
  const matches = await matchingService.listMatchesForRequest(req.user.id, req.params.requestId);
  return success(res, matches);
});

const createMatch = asyncHandler(async (req, res) => {
  const match = await matchingService.createMatch(req.user.id, req.params.requestId, req.body);
  return success(res, match, 'Match created successfully', 201);
});

const updateMatchStatus = asyncHandler(async (req, res) => {
  const match = await matchingService.updateMatchStatus(req.user.id, req.params.id, req.body.status);
  return success(res, match, 'Match updated successfully');
});

module.exports = { listMatches, createMatch, updateMatchStatus };
