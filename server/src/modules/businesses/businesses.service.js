const businessesRepo = require('./businesses.repository');

const BUSINESS_FIELDS = [
  'name',
  'description',
  'logo_url',
  'cover_url',
  'email',
  'phone',
  'website',
  'location_city',
  'location_address',
  'location_lat',
  'location_lng',
  'business_type',
];

function normalizeBusinessInput(payload = {}) {
  const filtered = {};
  BUSINESS_FIELDS.forEach((field) => {
    if (payload[field] !== undefined) filtered[field] = payload[field];
  });
  return filtered;
}

async function listBusinesses(filters = {}) {
  return businessesRepo.listBusinesses(filters);
}

async function getBusinessById(id) {
  const record = await businessesRepo.findById(id);
  if (!record) {
    const err = new Error('Business not found');
    err.statusCode = 404;
    throw err;
  }
  return record;
}

async function getMyBusiness(userId) {
  const record = await businessesRepo.findByOwner(userId);
  if (!record) {
    const err = new Error('Business not found');
    err.statusCode = 404;
    throw err;
  }
  return record;
}

async function createBusiness(userId, payload = {}) {
  const data = normalizeBusinessInput(payload);
  if (!data.name) {
    const err = new Error('Business name is required');
    err.statusCode = 400;
    throw err;
  }

  const existing = await businessesRepo.findByOwner(userId);
  if (existing) {
    const err = new Error('You already have a business profile');
    err.statusCode = 409;
    throw err;
  }

  return businessesRepo.createBusiness({ owner_id: userId, ...data });
}

async function updateBusiness(userId, payload = {}) {
  const existing = await businessesRepo.findByOwner(userId);
  if (!existing) {
    const err = new Error('Business not found');
    err.statusCode = 404;
    throw err;
  }

  const data = normalizeBusinessInput(payload);
  if (Object.keys(data).length === 0) {
    const err = new Error('No valid fields to update');
    err.statusCode = 400;
    throw err;
  }

  return businessesRepo.updateBusiness(existing.id, data);
}

module.exports = { listBusinesses, getBusinessById, getMyBusiness, createBusiness, updateBusiness };
