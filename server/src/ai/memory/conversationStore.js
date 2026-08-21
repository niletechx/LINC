const supabase = require('../../config/supabase');

/**
 * Load the last N messages of an AI conversation in Gemini history format.
 * Also returns the last retrieved intent for multi-turn accumulation.
 */
async function loadHistory(conversationId, limit = 20) {
  const { data, error } = await supabase
    .from('ai_messages')
    .select('role, content, retrieved_context')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;

  const messages = (data || []).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  // Extract the most recent intent for multi-turn accumulation
  const lastWithContext = [...(data || [])]
    .reverse()
    .find((m) => m.retrieved_context?.intent);

  const lastIntent = lastWithContext?.retrieved_context?.intent || null;

  return { messages, lastIntent };
}

/**
 * Save a user + assistant message pair to the DB.
 */
async function saveMessages(conversationId, userMessage, assistantMessage, retrievedContext = null) {
  const { error } = await supabase.from('ai_messages').insert([
    { conversation_id: conversationId, role: 'user', content: userMessage },
    {
      conversation_id: conversationId,
      role: 'assistant',
      content: assistantMessage,
      retrieved_context: retrievedContext,
    },
  ]);

  if (error) throw error;
}

/**
 * Update the conversation title (called after first AI response).
 */
async function updateConversationTitle(conversationId, title) {
  const { error } = await supabase
    .from('ai_conversations')
    .update({ title })
    .eq('id', conversationId);

  if (error) throw error;
}

module.exports = { loadHistory, saveMessages, updateConversationTitle };
