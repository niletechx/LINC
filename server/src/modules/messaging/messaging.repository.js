const supabase = require('../../config/supabase');

const CONVERSATION_SELECT = `
  id,
  participant_a_type,
  participant_a_id,
  participant_b_type,
  participant_b_id,
  booking_id,
  last_message_at,
  created_at
`;

const MESSAGE_SELECT = `
  id,
  conversation_id,
  sender_type,
  sender_id,
  content,
  has_ai_mention,
  ai_response,
  is_read,
  created_at
`;

async function listConversations(userIdOrEntityIds) {
  const ids = Array.isArray(userIdOrEntityIds) ? userIdOrEntityIds : [userIdOrEntityIds];
  const orConds = ids.map((id) => `participant_a_id.eq.${id},participant_b_id.eq.${id}`).join(',');

  const { data, error } = await supabase
    .from('conversations')
    .select(CONVERSATION_SELECT)
    .or(orConds)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (error) throw error;
  return data || [];
}

async function findById(id) {
  const { data, error } = await supabase
    .from('conversations')
    .select(CONVERSATION_SELECT)
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function createConversation(conversation) {
  const { data, error } = await supabase
    .from('conversations')
    .upsert(conversation, { onConflict: 'participant_a_type,participant_a_id,participant_b_type,participant_b_id' })
    .select(CONVERSATION_SELECT)
    .single();

  if (error) throw error;
  return data;
}

async function listMessages(conversationId) {
  const { data, error } = await supabase
    .from('messages')
    .select(MESSAGE_SELECT)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

async function createMessage(message) {
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select(MESSAGE_SELECT)
    .single();

  if (error) throw error;

  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', message.conversation_id);

  return data;
}

async function findExistingConversation(idA, idB) {
  const idsA = Array.isArray(idA) ? idA : [idA];
  const idsB = Array.isArray(idB) ? idB : [idB];

  const conds = [];
  idsA.forEach((a) => {
    idsB.forEach((b) => {
      conds.push(`participant_a_id.eq.${a}.and.participant_b_id.eq.${b}`);
      conds.push(`participant_a_id.eq.${b}.and.participant_b_id.eq.${a}`);
    });
  });

  const { data, error } = await supabase
    .from('conversations')
    .select(CONVERSATION_SELECT)
    .or(conds.join(','))
    .maybeSingle();

  if (error && error.code !== 'PGRST116') return null;
  return data;
}

async function markConversationRead(conversationId) {
  const { data, error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .select(MESSAGE_SELECT);

  if (error) throw error;
  return data || [];
}

module.exports = { listConversations, findById, findExistingConversation, createConversation, listMessages, createMessage, markConversationRead };
