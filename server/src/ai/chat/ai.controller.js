const aiService = require('./ai.service');
const { success, error } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * POST /api/ai/chat
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

module.exports = { chat, getConversations, getConversationMessages };
