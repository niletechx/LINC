const organizationsRepo = require('./organizations.repository');

const ORG_FIELDS = [
  'name',
  'description',
  'logo_url',
  'cover_url',
  'email',
  'phone',
  'website',
  'location_city',
  'location_lat',
  'location_lng',
  'org_type',
];

function normalizeOrganizationInput(payload = {}) {
  const filtered = {};
  ORG_FIELDS.forEach((field) => {
    if (payload[field] !== undefined) filtered[field] = payload[field];
  });
  return filtered;
}

async function listOrganizations(filters = {}) {
  return organizationsRepo.listOrganizations(filters);
}

async function getOrganizationById(id) {
  const record = await organizationsRepo.findById(id);
  if (!record) {
    const err = new Error('Organization not found');
    err.statusCode = 404;
    throw err;
  }
  return record;
}

async function getMyOrganization(userId) {
  const record = await organizationsRepo.findByOwner(userId);
  if (!record) {
    const err = new Error('Organization not found');
    err.statusCode = 404;
    throw err;
  }
  return record;
}

async function createOrganization(userId, payload = {}) {
  const data = normalizeOrganizationInput(payload);
  if (!data.name) {
    const err = new Error('Organization name is required');
    err.statusCode = 400;
    throw err;
  }

  const existing = await organizationsRepo.findByOwner(userId);
  if (existing) {
    const err = new Error('You already have an organization profile');
    err.statusCode = 409;
    throw err;
  }

  return organizationsRepo.createOrganization({ owner_id: userId, ...data });
}

async function updateOrganization(userId, payload = {}) {
  const existing = await organizationsRepo.findByOwner(userId);
  if (!existing) {
    const err = new Error('Organization not found');
    err.statusCode = 404;
    throw err;
  }

  const data = normalizeOrganizationInput(payload);
  if (Object.keys(data).length === 0) {
    const err = new Error('No valid fields to update');
    err.statusCode = 400;
    throw err;
  }

  return organizationsRepo.updateOrganization(existing.id, data);
}

module.exports = { listOrganizations, getOrganizationById, getMyOrganization, createOrganization, updateOrganization };
