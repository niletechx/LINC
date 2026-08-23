const supabase = require('../../config/supabase');

const BUSINESS_SELECT = `
  id,
  owner_id,
  name,
  description,
  logo_url,
  cover_url,
  email,
  phone,
  website,
  location_city,
  location_address,
  location_lat,
  location_lng,
  business_type,
  is_verified,
  avg_rating,
  total_reviews,
  is_active,
  created_at,
  updated_at,
  users!owner_id (id, full_name, username, avatar_url)
`;

async function findById(id) {
  const { data, error } = await supabase
    .from('businesses')
    .select(BUSINESS_SELECT)
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function findByOwner(ownerId) {
  const { data, error } = await supabase
    .from('businesses')
    .select(BUSINESS_SELECT)
    .eq('owner_id', ownerId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function listBusinesses(filters = {}) {
  let query = supabase
    .from('businesses')
    .select(BUSINESS_SELECT)
    .eq('is_active', true);

  if (filters.city) {
    query = query.ilike('location_city', `%${filters.city}%`);
  }

  if (filters.q) {
    const q = String(filters.q).replace(/[%,()]/g, '').trim();
    if (q) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(Number(filters.limit) || 20);

  if (error) throw error;
  return data;
}

async function createBusiness(business) {
  const { data, error } = await supabase
    .from('businesses')
    .insert(business)
    .select(BUSINESS_SELECT)
    .single();

  if (error) throw error;
  return data;
}

async function updateBusiness(id, updates) {
  const { data, error } = await supabase
    .from('businesses')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(BUSINESS_SELECT)
    .single();

  if (error) throw error;
  return data;
}

module.exports = { findById, findByOwner, listBusinesses, createBusiness, updateBusiness };
