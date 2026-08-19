import 'package:flutter/foundation.dart';
import '../models/conversation_model.dart';
import 'api_service.dart';

class MessageService {
  MessageService._();
  static final MessageService instance = MessageService._();

  final ApiService _api = ApiService.instance;

  Future<List<ConversationModel>> getConversations() async {
    try {
      final res = await _api.get('/messaging/conversations');
      final data = res.data['data'];
      if (data is List) {
        return data.map((json) => ConversationModel.fromJson(json as Map<String, dynamic>)).toList();
      }
      return [];
    } catch (e) {
      debugPrint('Error fetching conversations: $e');
      rethrow;
    }
  }

  Future<List<DMMessage>> getMessages(String conversationId, String currentUserId) async {
    try {
      final res = await _api.get('/messaging/conversations/$conversationId');
      final data = res.data['data'];
      if (data is Map<String, dynamic> && data['messages'] is List) {
        final list = data['messages'] as List;
        return list.map((json) => DMMessage.fromJson(json as Map<String, dynamic>, currentUserId)).toList();
      }
      return [];
    } catch (e) {
      debugPrint('Error fetching messages for conv $conversationId: $e');
      rethrow;
    }
  }

  Future<DMMessage> sendMessage({
    required String conversationId,
    required String content,
    required String senderType,
    required String senderId,
  }) async {
    try {
      final res = await _api.post('/messaging/conversations/$conversationId/messages', data: {
        'content': content,
        'sender_type': senderType,
        'sender_id': senderId,
      });
      final data = res.data['data'];
      return DMMessage.fromJson(data as Map<String, dynamic>, senderId);
    } catch (e) {
      debugPrint('Error sending message: $e');
      rethrow;
    }
  }

  Future<ConversationModel> createOrGetConversation({
    required String currentUserId,
    required String participantType,
    required String participantId,
    String? bookingId,
  }) async {
    try {
      final res = await _api.post('/messaging/conversations', data: {
        'participant_a_type': 'user',
        'participant_a_id': currentUserId,
        'participant_b_type': participantType,
        'participant_b_id': participantId,
        if (bookingId != null) 'booking_id': bookingId,
      });
      final data = res.data['data'];
      return ConversationModel.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      debugPrint('Error creating conversation: $e');
      rethrow;
    }
  }

  Future<void> markAsRead(String conversationId) async {
    try {
      await _api.put('/messaging/conversations/$conversationId/read');
    } catch (e) {
      debugPrint('Error marking conversation as read: $e');
    }
  }
}
