const supabase = require('../../../config/supabase');

async function findInboxConversations(entityType, entityId) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .or(`participant_a_type.eq.${entityType}.and.participant_a_id.eq.${entityId},participant_b_type.eq.${entityType}.and.participant_b_id.eq.${entityId}`)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (error) throw error;
  return data || [];
}

module.exports = { findInboxConversations };
