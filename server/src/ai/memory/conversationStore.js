const supabase = require('../../config/supabase');

/**
 * Load the last N messages of an AI conversation as Gemini history format.
 */
async function loadHistory(conversationId, limit = 20) {
  const { data, error } = await supabase
    .from('ai_messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;

  // Convert to Gemini message format
  return (data || []).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
}

/**
 * Save a message pair to the DB.
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

module.exports = { loadHistory, saveMessages };
