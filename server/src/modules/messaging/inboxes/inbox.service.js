const supabase = require('../../../config/supabase');

async function getInboxForEntity(entityType, entityId) {
  const table = entityType === 'user' ? 'users' : `${entityType}s`;
  const { data, error } = await supabase
    .from(table)
    .select('id')
    .eq('id', entityId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

module.exports = { getInboxForEntity };
