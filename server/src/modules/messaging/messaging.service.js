const messagingRepo = require('./messaging.repository');

async function listConversations(userId) {
  return messagingRepo.listConversations(userId);
}

async function getConversation(userId, conversationId) {
  const conversation = await messagingRepo.findById(conversationId);
  if (!conversation) {
    const err = new Error('Conversation not found');
    err.statusCode = 404;
    throw err;
  }

  const isParticipant = [conversation.participant_a_id, conversation.participant_b_id].includes(userId);
  if (!isParticipant) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  return conversation;
}

async function createConversation(payload = {}) {
  const { participant_a_type, participant_a_id, participant_b_type, participant_b_id, booking_id } = payload;

  if (!participant_a_type || !participant_a_id || !participant_b_type || !participant_b_id) {
    const err = new Error('participant_a_type, participant_a_id, participant_b_type, and participant_b_id are required');
    err.statusCode = 400;
    throw err;
  }

  return messagingRepo.createConversation({
    participant_a_type,
    participant_a_id,
    participant_b_type,
    participant_b_id,
    booking_id: booking_id || null,
  });
}

async function listMessages(userId, conversationId) {
  const conversation = await getConversation(userId, conversationId);
  const messages = await messagingRepo.listMessages(conversationId);
  return { conversation, messages };
}

async function sendMessage(userId, conversationId, payload = {}) {
  const conversation = await getConversation(userId, conversationId);
  const { content, sender_type, sender_id } = payload;

  if (!content || !sender_type || !sender_id) {
    const err = new Error('content, sender_type, and sender_id are required');
    err.statusCode = 400;
    throw err;
  }

  const effectiveSenderId = sender_id || userId;
  const validSenders = [conversation.participant_a_id, conversation.participant_b_id];
  if (!validSenders.includes(effectiveSenderId)) {
    const err = new Error('You can only send messages from a conversation participant');
    err.statusCode = 403;
    throw err;
  }

  return messagingRepo.createMessage({
    conversation_id: conversationId,
    sender_type,
    sender_id: effectiveSenderId,
    content,
    has_ai_mention: Boolean(payload.has_ai_mention),
    ai_response: payload.ai_response || null,
  });
}

async function markConversationRead(userId, conversationId) {
  await getConversation(userId, conversationId);
  return messagingRepo.markConversationRead(conversationId);
}

module.exports = { listConversations, getConversation, createConversation, listMessages, sendMessage, markConversationRead };
