const messagingService = require('./messaging.service');
const { success, error } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const listConversations = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const conversations = await messagingService.listConversations(userId);
  return success(res, conversations);
});

const createConversation = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  // Ensure the requesting user is one of the participants
  const payload = { ...req.body };
  if (!payload.participant_a_id) {
    payload.participant_a_id = userId;
    payload.participant_a_type = req.user.role === 'provider' ? 'provider' : 'user';
  }
  const conversation = await messagingService.createConversation(payload);
  return success(res, conversation, 'Conversation created successfully', 201);
});

const listMessages = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const payload = await messagingService.listMessages(userId, req.params.id);
  return success(res, payload);
});

const sendMessage = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const message = await messagingService.sendMessage(userId, req.params.id, {
    ...req.body,
    sender_id: userId,
    sender_type: req.body.sender_type || (req.user.role === 'provider' ? 'provider' : 'user'),
  });
  return success(res, message, 'Message sent successfully', 201);
});

const markConversationRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const messages = await messagingService.markConversationRead(userId, req.params.id);
  return success(res, messages, 'Conversation marked as read');
});

module.exports = { listConversations, createConversation, listMessages, sendMessage, markConversationRead };
