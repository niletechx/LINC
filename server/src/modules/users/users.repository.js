const supabase = require('../../config/supabase');

const PUBLIC_FIELDS = 'id, full_name, username, avatar_url, bio, location_city, created_at';
const PRIVATE_FIELDS = 'id, email, full_name, username, avatar_url, bio, phone, location_city, location_lat, location_lng, is_admin, is_active, email_verified, created_at, updated_at';

async function findById(id, includePrivate = false) {
  const fields = includePrivate ? PRIVATE_FIELDS : PUBLIC_FIELDS;
  const { data, error } = await supabase
    .from('users')
    .select(fields)
    .eq('id', id)
    .eq('is_active', true)
    .single();
  if (error) throw error;
  return data;
}

async function findByUsername(username) {
  const { data, error } = await supabase
    .from('users')
    .select(PUBLIC_FIELDS)
    .eq('username', username.toLowerCase())
    .eq('is_active', true)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function updateUser(id, updates) {
  // Only allow safe fields to be updated
  const allowed = ['full_name', 'bio', 'phone', 'avatar_url', 'location_city', 'location_lat', 'location_lng'];
  const filtered = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowed.includes(k))
  );

  if (Object.keys(filtered).length === 0) {
    const err = new Error('No valid fields to update');
    err.statusCode = 400;
    throw err;
  }

  const { data, error } = await supabase
    .from('users')
    .update(filtered)
    .eq('id', id)
    .select(PRIVATE_FIELDS)
    .single();
  if (error) throw error;
  return data;
}

async function searchUsers(query, limit = 20) {
  const { data, error } = await supabase
    .from('users')
    .select(PUBLIC_FIELDS)
    .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
    .eq('is_active', true)
    .limit(limit);
  if (error) throw error;
  return data;
}

module.exports = { findById, findByUsername, updateUser, searchUsers };
