const supabase = require('../../config/supabase');

const SERVICE_SELECT = `
  id,
  provider_id,
  business_id,
  organization_id,
  category_id,
  title,
  description,
  price_type,
  price_amount,
  currency,
  location_city,
  location_lat,
  location_lng,
  tags,
  is_available,
  is_active,
  created_at,
  updated_at,
  categories (
    id,
    name,
    slug,
    icon
  ),
  provider_profiles (
    id,
    headline,
    hourly_rate,
    users!user_id (
      id,
      full_name,
      username,
      avatar_url
    )
  )
`;

async function findAll(filters = {}) {
  let query = supabase
    .from('services')
    .select(SERVICE_SELECT)
    .eq('is_active', true);

  if (filters.category_id) {
    query = query.eq('category_id', filters.category_id);
  }

  if (filters.provider_id) {
    query = query.eq('provider_id', filters.provider_id);
  }

  if (filters.q) {
    const q = filters.q.trim();
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }

  if (filters.city) {
    query = query.ilike('location_city', `%${filters.city}%`);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(Number(filters.limit) || 20);

  if (error) throw error;
  return data;
}

async function findById(id) {
  const { data, error } = await supabase
    .from('services')
    .select(SERVICE_SELECT)
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function createService(service) {
  const { data, error } = await supabase
    .from('services')
    .insert(service)
    .select(SERVICE_SELECT)
    .single();

  if (error) throw error;
  return data;
}

async function updateService(id, updates) {
  const { data, error } = await supabase
    .from('services')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(SERVICE_SELECT)
    .single();

  if (error) throw error;
  return data;
}

async function deleteService(id) {
  const { data, error } = await supabase
    .from('services')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(SERVICE_SELECT)
    .single();

  if (error) throw error;
  return data;
}

module.exports = {
  findAll,
  findById,
  createService,
  updateService,
  deleteService,
};
