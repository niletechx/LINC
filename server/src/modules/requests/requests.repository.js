const supabase = require('../../config/supabase');

const REQUEST_SELECT = `
  id,
  user_id,
  category_id,
  title,
  description,
  ai_extracted_intent,
  budget_min,
  budget_max,
  currency,
  location_city,
  location_lat,
  location_lng,
  urgency,
  status,
  expires_at,
  created_at,
  updated_at,
  users!user_id (id, full_name, username, avatar_url)
`;

async function listRequests(filters = {}) {
  let query = supabase
    .from('requests')
    .select(REQUEST_SELECT)
    .order('created_at', { ascending: false });

  if (filters.user_id) {
    query = query.eq('user_id', filters.user_id);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query.limit(Number(filters.limit) || 20);
  if (error) throw error;
  return data;
}

async function findById(id) {
  const { data, error } = await supabase
    .from('requests')
    .select(REQUEST_SELECT)
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function createRequest(request) {
  const { data, error } = await supabase
    .from('requests')
    .insert(request)
    .select(REQUEST_SELECT)
    .single();

  if (error) throw error;
  return data;
}

async function updateRequest(id, updates) {
  const { data, error } = await supabase
    .from('requests')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(REQUEST_SELECT)
    .single();

  if (error) throw error;
  return data;
}

module.exports = { listRequests, findById, createRequest, updateRequest };
