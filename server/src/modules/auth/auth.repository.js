const supabase = require('../../config/supabase');

async function findByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function findByUsername(username) {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('username', username.toLowerCase())
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function findById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, full_name, username, avatar_url, bio, phone, location_city, location_lat, location_lng, is_admin, is_active, email_verified, created_at, updated_at')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

async function createUser({ email, password_hash, full_name, username }) {
  const { data, error } = await supabase
    .from('users')
    .insert({
      email: email.toLowerCase(),
      password_hash,
      full_name,
      username: username.toLowerCase(),
    })
    .select('id, email, full_name, username, avatar_url, is_admin, created_at')
    .single();
  if (error) throw error;
  return data;
}

module.exports = { findByEmail, findByUsername, findById, createUser };
