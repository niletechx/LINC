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
 */
async function processMessage({ userId, message, conversationId, userLat, userLng }) {
  // 1. Get or create conversation
  let convId = conversationId;
  if (!convId) {
    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({ user_id: userId })
      .select()
      .single();
    if (error) throw error;
    convId = data.id;
  }

  // 2. Load conversation history
  const rawHistory = await loadHistory(convId);
  const history = trimHistory(rawHistory);

  // 3. Extract intent from user message
  const intent = await extractIntent(message);

  // 4. Retrieve matching providers from DB (RAG retrieval)
  const providers = await retrieveMatches(intent, userLat, userLng);

  // 5. Build prompt with context
  const { systemInstruction } = buildPrompt(message, providers, history);

  // 6. Append user message to history and call Gemini
  const messages = [
    ...history,
    { role: 'user', parts: [{ text: message }] },
  ];

  const rawResponse = await chat(messages, systemInstruction);
  const aiResponse = parseResponse(rawResponse);

  // 7. Save messages to DB
  await saveMessages(convId, message, aiResponse, { intent, providers });

  return {
    conversationId: convId,
    response: aiResponse,
    providers, // frontend can render provider cards
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

module.exports = { processMessage, getUserConversations };
