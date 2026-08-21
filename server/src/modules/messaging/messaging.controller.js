const messagingService = require('./messaging.service');
const { success } = require('../../utils/apiResponse');
const asyncHandler = require('../../utils/asyncHandler');

const listConversations = asyncHandler(async (req, res) => {
  const conversations = await messagingService.listConversations(req.user.id);
  return success(res, conversations);
});

const createConversation = asyncHandler(async (req, res) => {
  const conversation = await messagingService.createConversation(req.body);
  return success(res, conversation, 'Conversation created successfully', 201);
});

const listMessages = asyncHandler(async (req, res) => {
  const payload = await messagingService.listMessages(req.user.id, req.params.id);
  return success(res, payload);
});

const sendMessage = asyncHandler(async (req, res) => {
  const message = await messagingService.sendMessage(req.user.id, req.params.id, {
    ...req.body,
    sender_id: req.user.id,
    sender_type: 'user',
  });
  return success(res, message, 'Message sent successfully', 201);
});

const markConversationRead = asyncHandler(async (req, res) => {
  const messages = await messagingService.markConversationRead(req.user.id, req.params.id);
  return success(res, messages, 'Conversation marked as read');
});

module.exports = { listConversations, createConversation, listMessages, sendMessage, markConversationRead };
