const supabase = require('../../config/supabase');
const { extractIntent } = require('../pipeline/intentExtractor');
const { retrieveMatches } = require('../pipeline/retriever');
const { buildPrompt } = require('../pipeline/promptBuilder');
const { parseResponse } = require('../pipeline/responseParser');
const { loadHistory, saveMessages } = require('../memory/conversationStore');
const { trimHistory } = require('../memory/contextWindow');
const { chat } = require('../llm/geminiClient');

/**
 * Full RAG pipeline orchestrator.
 *
 * Flow:
 *   1. Get or create AI conversation record
 *   2. Load + trim conversation history
 *   3. Extract intent from the user message (Gemini call #1)
 *   4. Retrieve & score matching providers from DB (RAG retrieval)
 *   5. Build grounded system prompt with provider context
 *   6. Call Gemini with full history + grounded prompt (Gemini call #2)
 *   7. Parse structured response (message + provider_ids)
 *   8. Persist messages to DB
 *   9. Return { conversationId, message, provider_ids, providers, intent }
 */
async function processMessage({ userId, message, conversationId, userLat, userLng }) {
  // 1. Get or create conversation
  let convId = conversationId;
  if (!convId) {
    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({ user_id: userId, title: message.slice(0, 80) })
      .select()
      .single();
    if (error) throw error;
    convId = data.id;
  }

  // 2. Load and trim conversation history
  const rawHistory = await loadHistory(convId);
  const history = trimHistory(rawHistory);

  // 3. Extract intent
  const intent = await extractIntent(message);

  // 4. Retrieve matching providers
  const providers = await retrieveMatches(intent, userLat, userLng);

  // 5. Build grounded prompt
  const { systemInstruction } = buildPrompt(message, providers, history);

  // 6. Call Gemini
  const messages = [
    ...history,
    { role: 'user', parts: [{ text: message }] },
  ];
  const rawResponse = await chat(messages, systemInstruction);

  // 7. Parse structured response
  const parsed = parseResponse(rawResponse, providers);

  // 8. Persist to DB
  await saveMessages(convId, message, parsed.message, { intent, providers });

  // 9. Return enriched result
  return {
    conversationId: convId,
    message: parsed.message,
    provider_ids: parsed.provider_ids,
    providers: parsed.providers,
    intent,
  };
}

async function getUserConversations(userId) {
  const { data, error } = await supabase
    .from('ai_conversations')
    .select('id, title, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data;
}

async function getConversationMessages(userId, conversationId) {
  // Verify ownership first
  const { data: convo, error: convoErr } = await supabase
    .from('ai_conversations')
    .select('id')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single();

  if (convoErr || !convo) {
    const err = new Error('Conversation not found');
    err.statusCode = 404;
    throw err;
  }

  const { data, error } = await supabase
    .from('ai_messages')
    .select('id, role, content, retrieved_context, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

module.exports = { processMessage, getUserConversations, getConversationMessages };
