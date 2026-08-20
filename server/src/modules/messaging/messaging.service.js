const messagingRepo = require('./messaging.repository');
const supabase = require('../../config/supabase');

async function getUserEntityIds(userId) {
  if (!userId) return [];
  const ids = new Set([String(userId)]);
  try {
    const { data: provs } = await supabase
      .from('provider_profiles')
      .select('id, user_id')
      .or(`user_id.eq.${userId},id.eq.${userId}`);
    if (provs && provs.length > 0) {
      provs.forEach((p) => {
        if (p.id) ids.add(String(p.id));
        if (p.user_id) ids.add(String(p.user_id));
      });
    }
  } catch (_) {}
  return Array.from(ids);
}

async function listConversations(userId) {
  const userEntityIds = await getUserEntityIds(userId);
  const convs = await messagingRepo.listConversations(userEntityIds);
  const enriched = await Promise.all(
    convs.map(async (conv) => {
      const isParticipantA = userEntityIds.includes(String(conv.participant_a_id));
      const otherId = isParticipantA ? conv.participant_b_id : conv.participant_a_id;
      const otherType = isParticipantA ? conv.participant_b_type : conv.participant_a_type;

      let otherUser = null;
      if (otherType === 'provider') {
        const { data: prov } = await supabase
          .from('provider_profiles')
          .select('id, user_id, headline, users!user_id(id, full_name, username, avatar_url)')
          .eq('id', otherId)
          .maybeSingle();
        if (prov) {
          otherUser = {
            id: prov.id,
            user_id: prov.user_id,
            name: prov.users?.full_name || prov.headline || 'Provider',
            username: prov.users?.username || '',
            avatar_url: prov.users?.avatar_url || null,
          };
        }
      }
      if (!otherUser) {
        const { data: usr } = await supabase
          .from('users')
          .select('id, full_name, username, avatar_url')
          .eq('id', otherId)
          .maybeSingle();
        if (usr) {
          otherUser = {
            id: usr.id,
            user_id: usr.id,
            name: usr.full_name || usr.username || 'User',
            username: usr.username || '',
            avatar_url: usr.avatar_url || null,
          };
        }
      }

      const msgs = await messagingRepo.listMessages(conv.id);
      const lastMessage = msgs.length > 0 ? msgs[msgs.length - 1] : null;
      const unreadCount = msgs.filter((m) => !m.is_read && !userEntityIds.includes(String(m.sender_id))).length;

      return {
        ...conv,
        other_participant: otherUser || { id: otherId, name: 'Participant', username: '' },
        last_message: lastMessage ? lastMessage.content : '',
        last_message_time: lastMessage ? lastMessage.created_at : conv.created_at,
        unread_count: unreadCount,
      };
    })
  );
  return enriched;
}

async function getConversation(userId, conversationId) {
  const conversation = await messagingRepo.findById(conversationId);
  if (!conversation) {
    const err = new Error('Conversation not found');
    err.statusCode = 404;
    throw err;
  }

  const userEntityIds = await getUserEntityIds(userId);
  const isParticipant = [String(conversation.participant_a_id), String(conversation.participant_b_id)].some((id) =>
    userEntityIds.includes(String(id))
  );

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

  const userAIds = await getUserEntityIds(participant_a_id);
  const userBIds = await getUserEntityIds(participant_b_id);

  const existing = await messagingRepo.findExistingConversation(userAIds, userBIds);
  if (existing) {
    return existing;
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
  const { content, sender_type } = payload;

  if (!content) {
    const err = new Error('content is required');
    err.statusCode = 400;
    throw err;
  }

  const userEntityIds = await getUserEntityIds(userId);
  const effectiveSenderId = String(userId);
  const isParticipantB = userEntityIds.includes(String(conversation.participant_b_id));
  const effectiveSenderType = sender_type || (isParticipantB && conversation.participant_b_type === 'provider' ? 'provider' : 'user');

  const msg = await messagingRepo.createMessage({
    conversation_id: conversationId,
    sender_type: effectiveSenderType,
    sender_id: effectiveSenderId,
    content,
    has_ai_mention: Boolean(payload.has_ai_mention),
    ai_response: payload.ai_response || null,
  });

  try {
    const isA = userEntityIds.includes(String(conversation.participant_a_id));
    let recipientId = isA ? conversation.participant_b_id : conversation.participant_a_id;
    let recipientType = isA ? conversation.participant_b_type : conversation.participant_a_type;

    if (recipientType === 'provider') {
      const { data: p } = await supabase
        .from('provider_profiles')
        .select('user_id')
        .eq('id', recipientId)
        .maybeSingle();
      if (p && p.user_id) recipientId = p.user_id;
    }

    if (recipientId) {
      await supabase.from('notifications').insert({
        user_id: recipientId,
        title: 'New Message',
        body: content.length > 60 ? content.substring(0, 60) + '...' : content,
        type: 'message',
        data: { conversation_id: conversationId },
      });
    }
  } catch (_) {}

  return msg;
}

async function markConversationRead(userId, conversationId) {
  await getConversation(userId, conversationId);
  return messagingRepo.markConversationRead(conversationId);
}

module.exports = { listConversations, getConversation, createConversation, listMessages, sendMessage, markConversationRead };

