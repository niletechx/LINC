const providersRepo = require('./providers.repository');
const categoriesRepo = require('../categories/categories.repository');

const PROFILE_FIELDS = [
  'headline',
  'bio',
  'hourly_rate',
  'currency',
  'location_city',
  'location_lat',
  'location_lng',
  'availability_status',
];

function normalizeProfileInput(payload = {}) {
  const filtered = {};
  PROFILE_FIELDS.forEach((field) => {
    if (payload[field] !== undefined) filtered[field] = payload[field];
  });

  const categoryIds = Array.isArray(payload.category_ids)
    ? payload.category_ids.filter(Boolean)
    : [];

  return { ...filtered, category_ids: categoryIds };
}

async function getValidCategoryIds(categoryIds = []) {
  if (!Array.isArray(categoryIds) || categoryIds.length === 0) return [];
  const rows = await categoriesRepo.findByIds(categoryIds);
  return rows.map((row) => row.id);
}

async function getMyProfile(userId) {
  const profile = await providersRepo.findByUserId(userId);
  if (!profile) {
    const err = new Error('Provider profile not found');
    err.statusCode = 404;
    throw err;
  }
  return profile;
}

async function getProviderProfile(id) {
  const profile = await providersRepo.findById(id);
  if (!profile) {
    const err = new Error('Provider profile not found');
    err.statusCode = 404;
    throw err;
  }
  return profile;
}

async function listProviders(filters = {}) {
  return providersRepo.listProviders(filters);
}

async function createProviderProfile(userId, payload = {}) {
  const profile = await providersRepo.findByUserId(userId);
  if (profile) {
    return updateProviderProfile(userId, payload);
  }

  const data = normalizeProfileInput(payload);
  const { category_ids, ...profileData } = data;

  if (!profileData.headline) {
    const err = new Error('Headline is required');
    err.statusCode = 400;
    throw err;
  }

  const validCategoryIds = await getValidCategoryIds(category_ids);
  const created = await providersRepo.createProfile({ user_id: userId, ...profileData });

  if (validCategoryIds.length > 0) {
    await providersRepo.syncProviderCategories(created.id, validCategoryIds);
  }

  return created;
}

async function updateProviderProfile(userId, payload = {}) {
  const existing = await providersRepo.findByUserId(userId);
  if (!existing) {
    const err = new Error('Provider profile not found');
    err.statusCode = 404;
    throw err;
  }

  const data = normalizeProfileInput(payload);
  const { category_ids, ...profileData } = data;

  if (Object.keys(profileData).length === 0) {
    const err = new Error('No valid fields to update');
    err.statusCode = 400;
    throw err;
  }

  const validCategoryIds = await getValidCategoryIds(category_ids);
  const updated = await providersRepo.updateProfile(existing.id, profileData);

  if (validCategoryIds.length > 0 || Array.isArray(category_ids)) {
    await providersRepo.syncProviderCategories(existing.id, validCategoryIds);
  }

  return updated;
}

module.exports = {
  getMyProfile,
  getProviderProfile,
  listProviders,
  createProviderProfile,
  updateProviderProfile,
};
