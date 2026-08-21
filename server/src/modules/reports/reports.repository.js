const supabase = require('../../config/supabase');

const REPORT_SELECT = `
  id,
  reporter_id,
  entity_type,
  entity_id,
  reason,
  description,
  status,
  reviewed_by,
  created_at,
  reviewed_at
`;

async function listAll() {
  const { data, error } = await supabase
    .from('reports')
    .select(REPORT_SELECT)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function findById(id) {
  const { data, error } = await supabase
    .from('reports')
    .select(REPORT_SELECT)
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function createReport(report) {
  const { data, error } = await supabase
    .from('reports')
    .insert(report)
    .select(REPORT_SELECT)
    .single();

  if (error) throw error;
  return data;
}

async function updateStatus(id, updates) {
  const { data, error } = await supabase
    .from('reports')
    .update(updates)
    .eq('id', id)
    .select(REPORT_SELECT)
    .single();

  if (error) throw error;
  return data;
}

module.exports = { listAll, findById, createReport, updateStatus };
