const aiService = require('./ai.service');
const { success, error } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const chat = asyncHandler(async (req, res) => {
  const { message, conversationId, userLat, userLng } = req.body;
  const userId = req.user.id;

  if (!message) return error(res, 'Message is required', 400);

  const result = await aiService.processMessage({
    userId,
    message,
    conversationId,
    userLat,
    userLng,
  });

  return success(res, result);
});

const getConversations = asyncHandler(async (req, res) => {
  const result = await aiService.getUserConversations(req.user.id);
  return success(res, result);
});

module.exports = { chat, getConversations };
