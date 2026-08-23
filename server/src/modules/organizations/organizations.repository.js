const supabase = require('../../config/supabase');

const ORG_SELECT = `
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
  location_lat,
  location_lng,
  org_type,
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
    .from('organizations')
    .select(ORG_SELECT)
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function findByOwner(ownerId) {
  const { data, error } = await supabase
    .from('organizations')
    .select(ORG_SELECT)
    .eq('owner_id', ownerId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function listOrganizations(filters = {}) {
  let query = supabase
    .from('organizations')
    .select(ORG_SELECT)
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

async function createOrganization(org) {
  const { data, error } = await supabase
    .from('organizations')
    .insert(org)
    .select(ORG_SELECT)
    .single();

  if (error) throw error;
  return data;
}

async function updateOrganization(id, updates) {
  const { data, error } = await supabase
    .from('organizations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(ORG_SELECT)
    .single();

  if (error) throw error;
  return data;
}

module.exports = { findById, findByOwner, listOrganizations, createOrganization, updateOrganization };
