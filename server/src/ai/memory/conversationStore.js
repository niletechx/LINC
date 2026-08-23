const supabase = require('../../config/supabase');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidUUID(id) {
  if (!id || typeof id !== 'string') return false;
  return UUID_REGEX.test(id) || id.length >= 1;
}

/**
 * Load the last N messages of an AI conversation in Gemini history format.
 * Also returns the last retrieved intent for multi-turn accumulation.
 */
async function loadHistory(conversationId, limit = 20) {
  if (!conversationId || !isValidUUID(conversationId)) {
    return { messages: [], lastIntent: null };
  }

  try {
    const { data, error } = await supabase
      .from('ai_messages')
      .select('role, content, retrieved_context')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      return { messages: [], lastIntent: null };
    }

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
  } catch {
    return { messages: [], lastIntent: null };
  }
}

/**
 * Save a user + assistant message pair to the DB.
 */
async function saveMessages(conversationId, userMessage, assistantMessage, retrievedContext = null) {
  if (!conversationId || !isValidUUID(conversationId)) {
    return;
  }

  try {
    await supabase.from('ai_messages').insert([
      { conversation_id: conversationId, role: 'user', content: userMessage },
      {
        conversation_id: conversationId,
        role: 'assistant',
        content: assistantMessage,
        retrieved_context: retrievedContext,
      },
    ]);
  } catch (_) {
    // Non-fatal if DB insert fails
  }
}

/**
 * Update the conversation title (called after first AI response).
 */
async function updateConversationTitle(conversationId, title) {
  if (!conversationId || !isValidUUID(conversationId)) {
    return;
  }

  try {
    await supabase
      .from('ai_conversations')
      .update({ title })
      .eq('id', conversationId);
  } catch (_) {
    // Non-fatal
  }
}

module.exports = { loadHistory, saveMessages, updateConversationTitle };
