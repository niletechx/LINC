const supabase = require('../../config/supabase');

const VERIFICATION_SELECT = `
  id,
  entity_type,
  entity_id,
  submitted_by,
  documents,
  status,
  reviewed_by,
  review_notes,
  created_at,
  reviewed_at
`;

async function listByUser(userId) {
  const { data, error } = await supabase
    .from('verification_requests')
    .select(VERIFICATION_SELECT)
    .eq('submitted_by', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function listAll() {
  const { data, error } = await supabase
    .from('verification_requests')
    .select(VERIFICATION_SELECT)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function findById(id) {
  const { data, error } = await supabase
    .from('verification_requests')
    .select(VERIFICATION_SELECT)
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function createRequest(request) {
  const { data, error } = await supabase
    .from('verification_requests')
    .insert(request)
    .select(VERIFICATION_SELECT)
    .single();

  if (error) throw error;
  return data;
}

async function updateStatus(id, updates) {
  const { data, error } = await supabase
    .from('verification_requests')
    .update(updates)
    .eq('id', id)
    .select(VERIFICATION_SELECT)
    .single();

  if (error) throw error;
  return data;
}

module.exports = { listByUser, listAll, findById, createRequest, updateStatus };
