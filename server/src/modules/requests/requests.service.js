const requestsRepo = require('./requests.repository');

const REQUEST_FIELDS = [
  'category_id',
  'title',
  'description',
  'ai_extracted_intent',
  'budget_min',
  'budget_max',
  'currency',
  'location_city',
  'location_lat',
  'location_lng',
  'urgency',
  'expires_at',
];

function normalizeRequestInput(payload = {}) {
  const filtered = {};
  REQUEST_FIELDS.forEach((field) => {
    if (payload[field] !== undefined) filtered[field] = payload[field];
  });
  return filtered;
}

async function listRequests(filters = {}) {
  return requestsRepo.listRequests(filters);
}

async function getRequestById(id) {
  const record = await requestsRepo.findById(id);
  if (!record) {
    const err = new Error('Request not found');
    err.statusCode = 404;
    throw err;
  }
  return record;
}

async function createRequest(userId, payload = {}) {
  const data = normalizeRequestInput(payload);

  if (!data.title || !data.description) {
    const err = new Error('Title and description are required');
    err.statusCode = 400;
    throw err;
  }

  return requestsRepo.createRequest({ user_id: userId, ...data, status: 'open' });
}

async function updateRequest(userId, id, payload = {}) {
  const existing = await requestsRepo.findById(id);
  if (!existing) {
    const err = new Error('Request not found');
    err.statusCode = 404;
    throw err;
  }

  if (existing.user_id !== userId) {
    const err = new Error('You can only update your own request');
    err.statusCode = 403;
    throw err;
  }

  const data = normalizeRequestInput(payload);
  if (Object.keys(data).length === 0) {
    const err = new Error('No valid fields to update');
    err.statusCode = 400;
    throw err;
  }

  return requestsRepo.updateRequest(id, data);
}

module.exports = { listRequests, getRequestById, createRequest, updateRequest };
