const supabase = require('../../config/supabase');
const { extractIntent } = require('../pipeline/intentExtractor');
const { retrieveMatches } = require('../pipeline/retriever');
const { buildPrompt } = require('../pipeline/promptBuilder');
const { parseResponse } = require('../pipeline/responseParser');
const { loadHistory, saveMessages, updateConversationTitle } = require('../memory/conversationStore');
const { trimHistory } = require('../memory/contextWindow');
const { chat, streamChat } = require('../llm/geminiClient');
const logger = require('../../utils/logger');

// ── Title generation ────────────────────────────────────────────────────────
const TITLE_PROMPT = `You are a conversation titler. Given the first user message and the AI's first reply,
generate a concise 4-6 word title that captures the topic of the conversation.
Respond ONLY with the title text. No quotes, no punctuation at the end.`;

async function generateTitle(userMessage, aiMessage) {
  try {
    const { chat: titleChat } = require('../llm/geminiClient');
    const raw = await titleChat([
      { role: 'user', parts: [{ text: `User: ${userMessage}\nAI: ${aiMessage}` }] },
    ], TITLE_PROMPT);
    return raw.trim().slice(0, 80);
  } catch {
    return userMessage.slice(0, 60);
  }
}

// ── Core orchestrator (non-streaming) ───────────────────────────────────────
/**
 * Full RAG pipeline:
 *   1. Get/create conversation
 *   2. Load history + last intent (multi-turn accumulation)
 *   3. Extract intent (merged with previous)
 *   4. Retrieve matching providers/businesses/orgs
 *   5. Build grounded prompt
 *   6. Call Gemini
 *   7. Parse structured response
 *   8. Persist messages
 *   9. Generate title on first turn
 *  10. Return enriched result
 */
async function processMessage({ userId, message, conversationId, userLat, userLng }) {
  // 1. Get or create conversation
  let convId = conversationId;
  let isFirstTurn = false;

  if (!convId && userId) {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({ user_id: userId, title: message.slice(0, 80) })
        .select()
        .single();
      if (!error && data) {
        convId = data.id;
        isFirstTurn = true;
      }
    } catch (_) {
      // Non-fatal if DB insert fails
    }
  }

  // 2. Load history + last intent
  const { messages: rawHistory, lastIntent } = convId
    ? await loadHistory(convId)
    : { messages: [], lastIntent: null };
  const history = trimHistory(rawHistory);

  if (rawHistory.length === 0) isFirstTurn = true;

  // 3. Extract intent (multi-turn: inherit from last turn)
  const intent = await extractIntent(message, lastIntent);

  // 4. Retrieve matches (providers + businesses + orgs)
  const providers = await retrieveMatches(intent, userLat, userLng);

  // 5. Build grounded prompt
  const { systemInstruction } = buildPrompt(message, providers, history);

  // 6. Call Gemini with graceful fallback
  const messages = [
    ...history,
    { role: 'user', parts: [{ text: message }] },
  ];

  let rawResponse;
  try {
    rawResponse = await chat(messages, systemInstruction);
  } catch (err) {
    logger.warn('Gemini chat failed, generating local rule-based response: ' + err.message);
    if (providers && providers.length > 0) {
      const topMatch = providers[0];
      const otherMatches = providers.slice(1, 3).map((p) => `• **${p.name}** (@${p.username || 'provider'}) — *${p.headline}* · ★${p.avg_rating || 5.0} (${p.total_reviews || 0} reviews) · ${p.hourly_rate ? `${p.hourly_rate} ETB/hr` : 'Verified'}`).join('\n');
      rawResponse = `I found **${providers.length} verified specialist${providers.length > 1 ? 's' : ''}** for your request in Addis Ababa:\n\n• **${topMatch.name}** (@${topMatch.username || 'provider'}) — *${topMatch.headline}* · ★${topMatch.avg_rating || 5.0} (${topMatch.total_reviews || 0} reviews) · ${topMatch.hourly_rate ? `${topMatch.hourly_rate} ETB/hr` : 'Verified'}\n${otherMatches ? `\nOther top matches:\n${otherMatches}\n` : ''}\nYou can message them directly or book through LINC Escrow protection for full payment security.`;
    } else {
      rawResponse = `I couldn't find any verified service providers matching "${message}" in our database right now.\n\nWe currently support verified professionals in:\n• 🔧 **Plumbing & Water**\n• ⚡ **Electrical Work**\n• 🧹 **Cleaning & Maid Services**\n• 💻 **IT & Computer Repair**\n• 📚 **Tutoring & Skills**\n• 🚗 **Transport & Cargo**\n• 💆 **Health & Wellness**\n• 🎨 **Painting & Design**\n\nPlease try searching for one of these categories or adjust your search keywords!`;
    }
  }

  // 7. Parse structured response
  const parsed = parseResponse(rawResponse, providers);

  // 8. Persist messages
  if (convId) {
    try {
      await saveMessages(convId, message, parsed.message, { intent, providers });
    } catch (_) {}
  }

  // 9. Generate title on first turn (async, don't block response)
  if (isFirstTurn && convId) {
    generateTitle(message, parsed.message)
      .then((title) => updateConversationTitle(convId, title))
      .catch((err) => logger.warn('Title generation failed: ' + err.message));
  }

  // 10. Return
  return {
    conversationId: convId,
    message: parsed.message,
    provider_ids: parsed.provider_ids,
    providers: parsed.providers,
    intent,
  };
}

// ── Streaming orchestrator ───────────────────────────────────────────────────
/**
 * Same RAG pipeline as processMessage but streams the Gemini response
 * chunk-by-chunk via the onChunk callback.
 * The caller (controller) writes each chunk to the SSE response.
 */
async function processMessageStream({ userId, message, conversationId, userLat, userLng, onChunk }) {
  let convId = conversationId;
  let isFirstTurn = false;

  if (!convId && userId) {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({ user_id: userId, title: message.slice(0, 80) })
        .select()
        .single();
      if (!error && data) {
        convId = data.id;
        isFirstTurn = true;
      }
    } catch (_) {}
  }

  const { messages: rawHistory, lastIntent } = convId
    ? await loadHistory(convId)
    : { messages: [], lastIntent: null };
  const history = trimHistory(rawHistory);
  if (rawHistory.length === 0) isFirstTurn = true;

  const intent = await extractIntent(message, lastIntent);
  const providers = await retrieveMatches(intent, userLat, userLng);
  const { systemInstruction } = buildPrompt(message, providers, history);

  const messages = [
    ...history,
    { role: 'user', parts: [{ text: message }] },
  ];

  // Stream Gemini response
  let fullText;
  try {
    fullText = await streamChat(messages, systemInstruction, onChunk);
  } catch (err) {
    logger.warn('Gemini stream failed, streaming local rule-based response: ' + err.message);
    if (providers && providers.length > 0) {
      const topMatch = providers[0];
      const otherMatches = providers.slice(1, 3).map((p) => `• **${p.name}** (@${p.username || 'provider'}) — *${p.headline}* · ★${p.avg_rating || 5.0} (${p.total_reviews || 0} reviews) · ${p.hourly_rate ? `${p.hourly_rate} ETB/hr` : 'Verified'}`).join('\n');
      fullText = `I found **${providers.length} verified specialist${providers.length > 1 ? 's' : ''}** for your request in Addis Ababa:\n\n• **${topMatch.name}** (@${topMatch.username || 'provider'}) — *${topMatch.headline}* · ★${topMatch.avg_rating || 5.0} (${topMatch.total_reviews || 0} reviews) · ${topMatch.hourly_rate ? `${topMatch.hourly_rate} ETB/hr` : 'Verified'}\n${otherMatches ? `\nOther top matches:\n${otherMatches}\n` : ''}\nYou can message them directly or book through LINC Escrow protection for full payment security.`;
    } else {
      fullText = `I couldn't find any verified service providers matching "${message}" in our database right now.\n\nWe currently support verified professionals in:\n• 🔧 **Plumbing & Water**\n• ⚡ **Electrical Work**\n• 🧹 **Cleaning & Maid Services**\n• 💻 **IT & Computer Repair**\n• 📚 **Tutoring & Skills**\n• 🚗 **Transport & Cargo**\n• 💆 **Health & Wellness**\n• 🎨 **Painting & Design**\n\nPlease try searching for one of these categories or adjust your search keywords!`;
    }
    onChunk(fullText);
  }

  const parsed = parseResponse(fullText, providers);
  await saveMessages(convId, message, parsed.message, { intent, providers });

  if (isFirstTurn) {
    generateTitle(message, parsed.message)
      .then((title) => updateConversationTitle(convId, title))
      .catch((err) => logger.warn('Title generation failed: ' + err.message));
  }

  return {
    conversationId: convId,
    provider_ids: parsed.provider_ids,
    providers: parsed.providers,
    intent,
  };
}

// ── Conversation queries ─────────────────────────────────────────────────────
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

async function createConversation(userId, title = 'New Conversation') {
  const { data, error } = await supabase
    .from('ai_conversations')
    .insert({ user_id: userId, title })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function deleteConversation(userId, conversationId) {
  const { error } = await supabase
    .from('ai_conversations')
    .delete()
    .eq('id', conversationId)
    .eq('user_id', userId);
  if (error) throw error;
  return { success: true };
}

module.exports = {
  processMessage,
  processMessageStream,
  getUserConversations,
  getConversationMessages,
  createConversation,
  deleteConversation,
};
