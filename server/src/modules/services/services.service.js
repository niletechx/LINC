const servicesRepo = require('./services.repository');
const providersRepo = require('../providers/providers.repository');

const SERVICE_FIELDS = [
  'provider_id',
  'business_id',
  'organization_id',
  'category_id',
  'title',
  'description',
  'price_type',
  'price_amount',
  'currency',
  'location_city',
  'location_lat',
  'location_lng',
  'tags',
  'is_available',
];

function normalizeServiceInput(payload = {}) {
  const filtered = {};
  SERVICE_FIELDS.forEach((field) => {
    if (payload[field] !== undefined) filtered[field] = payload[field];
  });

  if (payload.tags !== undefined) {
    filtered.tags = Array.isArray(payload.tags) ? payload.tags : [payload.tags];
  }

  return filtered;
}

async function listServices(filters = {}) {
  return servicesRepo.findAll(filters);
}

async function getServiceById(id) {
  const service = await servicesRepo.findById(id);
  if (!service) {
    const err = new Error('Service not found');
    err.statusCode = 404;
    throw err;
  }
  return service;
}

async function createService(userId, payload = {}) {
  const data = normalizeServiceInput(payload);

  if (!data.title || !data.category_id || !data.price_type) {
    const err = new Error('Title, category_id, and price_type are required');
    err.statusCode = 400;
    throw err;
  }

  let providerProfile = null;
  if (data.provider_id) {
    providerProfile = await providersRepo.findById(data.provider_id);
  } else {
    providerProfile = await providersRepo.findByUserId(userId);
  }

  if (!providerProfile && !data.business_id && !data.organization_id) {
    const err = new Error('Create a provider profile before listing a service');
    err.statusCode = 400;
    throw err;
  }

  if (data.provider_id && providerProfile && providerProfile.user_id !== userId) {
    const err = new Error('You can only create services for your own provider profile');
    err.statusCode = 403;
    throw err;
  }

  const ownerCount = [Boolean(data.provider_id || providerProfile?.id), Boolean(data.business_id), Boolean(data.organization_id)].filter(Boolean).length;
  if (ownerCount !== 1) {
    const err = new Error('Exactly one owner must be provided: provider_id, business_id, or organization_id');
    err.statusCode = 400;
    throw err;
  }

  const servicePayload = {
    ...data,
    provider_id: data.provider_id || providerProfile?.id || null,
    business_id: data.business_id || null,
    organization_id: data.organization_id || null,
    is_available: data.is_available ?? true,
    currency: data.currency || 'ETB',
  };

  return servicesRepo.createService(servicePayload);
}

async function updateService(userId, id, payload = {}) {
  const existing = await servicesRepo.findById(id);
  if (!existing) {
    const err = new Error('Service not found');
    err.statusCode = 404;
    throw err;
  }

  let providerProfile = null;
  if (userId) {
    providerProfile = await providersRepo.findByUserId(userId);
  }

  if (!providerProfile && !existing.business_id && !existing.organization_id) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  if (existing.provider_id && providerProfile && existing.provider_id !== providerProfile.id) {
    const err = new Error('You can only update your own service');
    err.statusCode = 403;
    throw err;
  }

  const data = normalizeServiceInput(payload);
  if (Object.keys(data).length === 0) {
    const err = new Error('No valid fields to update');
    err.statusCode = 400;
    throw err;
  }

  return servicesRepo.updateService(id, data);
}

async function deleteService(userId, id) {
  const existing = await servicesRepo.findById(id);
  if (!existing) {
    const err = new Error('Service not found');
    err.statusCode = 404;
    throw err;
  }

  const providerProfile = await providersRepo.findByUserId(userId);
  if (existing.provider_id && providerProfile && existing.provider_id !== providerProfile.id) {
    const err = new Error('You can only delete your own service');
    err.statusCode = 403;
    throw err;
  }

  return servicesRepo.deleteService(id);
}

module.exports = {
  listServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
