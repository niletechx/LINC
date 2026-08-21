const matchesRepo = require('./matching.repository');
const requestsRepo = require('../requests/requests.repository');

const MATCH_FIELDS = ['entity_type', 'entity_id', 'match_score', 'score_breakdown', 'status'];

function normalizeMatchInput(payload = {}) {
  const filtered = {};
  MATCH_FIELDS.forEach((field) => {
    if (payload[field] !== undefined) filtered[field] = payload[field];
  });
  return filtered;
}

async function listMatchesForRequest(userId, requestId) {
  const request = await requestsRepo.findById(requestId);
  if (!request) {
    const err = new Error('Request not found');
    err.statusCode = 404;
    throw err;
  }

  if (request.user_id !== userId) {
    const err = new Error('You can only view matches for your own requests');
    err.statusCode = 403;
    throw err;
  }

  return matchesRepo.listByRequestId(requestId);
}

async function createMatch(userId, requestId, payload = {}) {
  const request = await requestsRepo.findById(requestId);
  if (!request) {
    const err = new Error('Request not found');
    err.statusCode = 404;
    throw err;
  }

  if (request.user_id !== userId) {
    const err = new Error('You can only create matches for your own requests');
    err.statusCode = 403;
    throw err;
  }

  const data = normalizeMatchInput(payload);
  if (!data.entity_type || !data.entity_id) {
    const err = new Error('entity_type and entity_id are required');
    err.statusCode = 400;
    throw err;
  }

  if (!['provider', 'business', 'organization'].includes(data.entity_type)) {
    const err = new Error('Invalid entity_type');
    err.statusCode = 400;
    throw err;
  }

  const matchPayload = {
    request_id: requestId,
    entity_type: data.entity_type,
    entity_id: data.entity_id,
    match_score: data.match_score ?? 0,
    score_breakdown: data.score_breakdown ?? {},
    status: data.status || 'pending',
  };

  return matchesRepo.createMatch(matchPayload);
}

async function updateMatchStatus(userId, matchId, status) {
  const existing = await matchesRepo.findById(matchId);
  if (!existing) {
    const err = new Error('Match not found');
    err.statusCode = 404;
    throw err;
  }

  const request = await requestsRepo.findById(existing.request_id);
  if (!request || request.user_id !== userId) {
    const err = new Error('You can only update matches for your own requests');
    err.statusCode = 403;
    throw err;
  }

  if (!status || !['pending', 'viewed', 'contacted', 'rejected'].includes(status)) {
    const err = new Error('Invalid status');
    err.statusCode = 400;
    throw err;
  }

  return matchesRepo.updateStatus(matchId, status);
}

module.exports = { listMatchesForRequest, createMatch, updateMatchStatus };
