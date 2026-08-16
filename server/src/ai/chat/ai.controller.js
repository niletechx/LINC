const aiService = require('./ai.service');
const { success, error } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * POST /api/ai/chat
 * Standard (non-streaming) chat endpoint.
 * Body: { message, conversationId?, userLat?, userLng? }
 * Returns: { conversationId, message, provider_ids, providers, intent }
 */
const chat = asyncHandler(async (req, res) => {
  const { message, conversationId, userLat, userLng } = req.body;
  const userId = req.user.id;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return error(res, 'message is required and must be a non-empty string', 400);
  }

  const result = await aiService.processMessage({
    userId,
    message: message.trim(),
    conversationId: conversationId || null,
    userLat: userLat ? parseFloat(userLat) : null,
    userLng: userLng ? parseFloat(userLng) : null,
  });

  return success(res, result);
});

/**
 * POST /api/ai/chat/stream
 * Streaming SSE chat endpoint. Sends tokens as they arrive.
 *
 * Response format (Server-Sent Events):
 *   data: {"type":"chunk","text":"Hello"}\n\n
 *   data: {"type":"chunk","text":" world"}\n\n
 *   data: {"type":"done","conversationId":"...","provider_ids":[...],"providers":[...],"intent":{...}}\n\n
 *   data: {"type":"error","message":"..."}\n\n
 */
const chatStream = async (req, res) => {
  const { message, conversationId, userLat, userLng } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ success: false, message: 'message is required' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable Nginx buffering if used
  res.flushHeaders();

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    if (res.flush) res.flush(); // flush for proxies
  };

  try {
    const meta = await aiService.processMessageStream({
      userId,
      message: message.trim(),
      conversationId: conversationId || null,
      userLat: userLat ? parseFloat(userLat) : null,
      userLng: userLng ? parseFloat(userLng) : null,
      onChunk: (text) => sendEvent({ type: 'chunk', text }),
    });

    // Final event with metadata (provider cards, intent, conversationId)
    sendEvent({ type: 'done', ...meta });
  } catch (err) {
    sendEvent({ type: 'error', message: err.message || 'AI service unavailable' });
  } finally {
    res.end();
  }
};

/**
 * GET /api/ai/conversations
 * Returns the authenticated user's AI conversation list.
 */
const getConversations = asyncHandler(async (req, res) => {
  const result = await aiService.getUserConversations(req.user.id);
  return success(res, result);
});

/**
 * GET /api/ai/conversations/:id/messages
 * Returns the full message history for a specific AI conversation.
 */
const getConversationMessages = asyncHandler(async (req, res) => {
  const result = await aiService.getConversationMessages(req.user.id, req.params.id);
  return success(res, result);
});

module.exports = { chat, chatStream, getConversations, getConversationMessages };
