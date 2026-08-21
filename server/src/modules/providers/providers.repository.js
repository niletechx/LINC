const supabase = require('../../config/supabase');

const PROFILE_SELECT = `
  id,
  user_id,
  headline,
  bio,
  hourly_rate,
  currency,
  location_city,
  location_lat,
  location_lng,
  availability_status,
  is_verified,
  avg_rating,
  total_reviews,
  completed_jobs,
  is_active,
  created_at,
  updated_at,
  users!user_id (
    id,
    full_name,
    username,
    avatar_url,
    location_city
  )
`;

async function findById(id) {
  const { data, error } = await supabase
    .from('provider_profiles')
    .select(PROFILE_SELECT)
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function findByUserId(userId) {
  const { data, error } = await supabase
    .from('provider_profiles')
    .select(PROFILE_SELECT)
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function listProviders(filters = {}) {
  let query = supabase
    .from('provider_profiles')
    .select(PROFILE_SELECT)
    .eq('is_active', true);

  if (filters.city) {
    query = query.ilike('location_city', `%${filters.city}%`);
  }

  if (filters.maxRate !== undefined) {
    query = query.lte('hourly_rate', Number(filters.maxRate));
  }

  if (filters.minRate !== undefined) {
    query = query.gte('hourly_rate', Number(filters.minRate));
  }

  const { data, error } = await query
    .order('avg_rating', { ascending: false })
    .limit(Number(filters.limit) || 20);

  if (error) throw error;
  return data;
}

async function createProfile(profile) {
  const { data, error } = await supabase
    .from('provider_profiles')
    .insert(profile)
    .select(PROFILE_SELECT)
    .single();

  if (error) throw error;
  return data;
}

async function updateProfile(id, updates) {
  const { data, error } = await supabase
    .from('provider_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(PROFILE_SELECT)
    .single();

  if (error) throw error;
  return data;
}

async function syncProviderCategories(providerId, categoryIds = []) {
  if (!Array.isArray(categoryIds) || categoryIds.length === 0) return [];

  const uniqueIds = [...new Set(categoryIds.filter(Boolean))];
  if (uniqueIds.length === 0) return [];

  const { error: deleteError } = await supabase
    .from('provider_categories')
    .delete()
    .eq('provider_id', providerId);

  if (deleteError) throw deleteError;

  const rows = uniqueIds.map((category_id) => ({ provider_id: providerId, category_id }));
  const { data, error } = await supabase
    .from('provider_categories')
    .insert(rows)
    .select('provider_id, category_id');

  if (error) throw error;
  return data;
}

module.exports = {
  findById,
  findByUserId,
  listProviders,
  createProfile,
  updateProfile,
  syncProviderCategories,
};
