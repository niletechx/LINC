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

const supabase = require('../../config/supabase');

async function getValidCategoryIds(categoryIds = []) {
  if (!Array.isArray(categoryIds) || categoryIds.length === 0) return [];
  
  // First try findByIds
  const rows = await categoriesRepo.findByIds(categoryIds);
  if (rows && rows.length > 0) {
    return rows.map((row) => row.id);
  }

  // Fallback: match by slug or name
  const allCats = await categoriesRepo.findAll();
  const matched = (allCats || []).filter((c) =>
    categoryIds.includes(c.id) ||
    categoryIds.includes(c.slug) ||
    categoryIds.some((cid) => c.slug.toLowerCase().includes(String(cid).toLowerCase()))
  );
  return matched.map((c) => c.id);
}

async function syncPrimaryService(providerId, profileData, categoryId) {
  if (!categoryId) return;
  try {
    const { data: existingServices } = await supabase
      .from('services')
      .select('id')
      .eq('provider_id', providerId);

    if (!existingServices || existingServices.length === 0) {
      await supabase.from('services').insert({
        provider_id: providerId,
        title: profileData.headline || 'Standard Service',
        description: profileData.bio || 'Verified professional service across Addis Ababa.',
        price_type: 'hourly',
        price_amount: Number(profileData.hourly_rate) || 350,
        currency: profileData.currency || 'ETB',
        category_id: categoryId,
        is_active: true,
        is_available: true,
        created_at: new Date().toISOString(),
      });
    } else {
      await supabase.from('services').update({
        title: profileData.headline,
        description: profileData.bio,
        price_amount: Number(profileData.hourly_rate) || 350,
        category_id: categoryId,
        updated_at: new Date().toISOString(),
      }).eq('id', existingServices[0].id);
    }
  } catch (_) {}
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
    await syncPrimaryService(created.id, profileData, validCategoryIds[0]);
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
    if (validCategoryIds.length > 0) {
      await syncPrimaryService(existing.id, { ...existing, ...profileData }, validCategoryIds[0]);
    }
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
