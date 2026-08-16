const supabase = require('../../config/supabase');

const MATCH_SELECT = `
  id,
  request_id,
  entity_type,
  entity_id,
  match_score,
  score_breakdown,
  status,
  created_at
`;

async function listByRequestId(requestId) {
  const { data, error } = await supabase
    .from('matches')
    .select(MATCH_SELECT)
    .eq('request_id', requestId)
    .order('match_score', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function findById(id) {
  const { data, error } = await supabase
    .from('matches')
    .select(MATCH_SELECT)
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function createMatch(match) {
  const { data, error } = await supabase
    .from('matches')
    .insert(match)
    .select(MATCH_SELECT)
    .single();

  if (error) throw error;
  return data;
}

async function updateStatus(id, status) {
  const { data, error } = await supabase
    .from('matches')
    .update({ status })
    .eq('id', id)
    .select(MATCH_SELECT)
    .single();

  if (error) throw error;
  return data;
}

module.exports = { listByRequestId, findById, createMatch, updateStatus };
