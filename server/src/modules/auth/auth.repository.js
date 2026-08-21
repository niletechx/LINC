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

async function createUser({ email, password_hash, full_name, username, phone, location_city, role = 'client', headline }) {
  const { data, error } = await supabase
    .from('users')
    .insert({
      email: email.toLowerCase(),
      password_hash,
      full_name,
      username: username.toLowerCase(),
      phone: phone || null,
      location_city: location_city || 'Addis Ababa',
    })
    .select('id, email, full_name, username, avatar_url, phone, location_city, is_admin, created_at')
    .single();
  if (error) throw error;

  if (role === 'provider') {
    await supabase.from('provider_profiles').insert({
      user_id: data.id,
      headline: headline || `${full_name} Services`,
      location_city: location_city || 'Addis Ababa',
      hourly_rate: 250,
      currency: 'ETB',
      availability_status: 'available',
      is_verified: false,
    });
  }

  return data;
}

module.exports = { findByEmail, findByUsername, findById, createUser };
