const supabase = require('../config/supabase');
const mentionDetector = require('../ai/advisor/mentionDetector');
const advisorService = require('../ai/advisor/advisor.service');
const logger = require('../utils/logger');

function registerChatSocket(io, socket) {
  // Join a conversation room
  socket.on('join_conversation', ({ conversationId }) => {
    socket.join(`conversation:${conversationId}`);
  });

  // Send a message in a human-to-human conversation
  socket.on('send_message', async (data) => {
    try {
      const { conversationId, senderId, senderType, content } = data;

      // Save the message to DB
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          sender_type: senderType,
          content,
          has_ai_mention: mentionDetector.hasMention(content),
        })
        .select()
        .single();

      if (error) throw error;

      // Emit message to the conversation room
      io.to(`conversation:${conversationId}`).emit('new_message', message);

      // If @AI was mentioned, trigger advisor (only emitted back to sender)
      if (mentionDetector.hasMention(content)) {
        const aiResponse = await advisorService.respond({
          message: content,
          conversationId,
          requesterId: senderId,
        });

        // Update the message row with the AI response
        await supabase
          .from('messages')
          .update({ ai_response: aiResponse })
          .eq('id', message.id);

        // Emit AI response only to the sender
        socket.emit('ai_advisor_response', {
          messageId: message.id,
          aiResponse,
        });
      }
    } catch (err) {
      logger.error('chat.socket send_message error: ' + err.message);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Mark messages as read
  socket.on('mark_read', async ({ conversationId }) => {
    // Implementation: update is_read for messages the other party sent
    logger.debug(`mark_read for conversation: ${conversationId}`);
  });
}

module.exports = registerChatSocket;
