const verificationRepo = require('./verification.repository');

async function listMyRequests(userId) {
  return verificationRepo.listByUser(userId);
}

async function getRequest(userId, requestId) {
  const request = await verificationRepo.findById(requestId);
  if (!request) {
    const err = new Error('Verification request not found');
    err.statusCode = 404;
    throw err;
  }

  if (request.submitted_by !== userId) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  return request;
}

async function createRequest(userId, payload = {}) {
  const { entity_type, entity_id, documents } = payload;
  if (!entity_type || !entity_id || !documents || !Array.isArray(documents) || documents.length === 0) {
    const err = new Error('entity_type, entity_id, and documents are required');
    err.statusCode = 400;
    throw err;
  }

  if (!['provider', 'business', 'organization'].includes(entity_type)) {
    const err = new Error('Invalid entity_type');
    err.statusCode = 400;
    throw err;
  }

  return verificationRepo.createRequest({
    entity_type,
    entity_id,
    submitted_by: userId,
    documents,
    status: 'pending',
  });
}

async function reviewRequest(adminId, requestId, payload = {}) {
  const request = await verificationRepo.findById(requestId);
  if (!request) {
    const err = new Error('Verification request not found');
    err.statusCode = 404;
    throw err;
  }

  const { status, review_notes } = payload;
  if (!status || !['approved', 'rejected'].includes(status)) {
    const err = new Error('status must be approved or rejected');
    err.statusCode = 400;
    throw err;
  }

  return verificationRepo.updateStatus(requestId, {
    status,
    reviewed_by: adminId,
    review_notes: review_notes || null,
    reviewed_at: new Date().toISOString(),
  });
}

module.exports = { listMyRequests, getRequest, createRequest, reviewRequest };
