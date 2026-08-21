import 'api_client.dart';

class AiService {
  final ApiClient _client = ApiClient();

  Future<Map<String, dynamic>> sendMessage({
    required String message,
    String? conversationId,
    double? userLat,
    double? userLng,
  }) async {
    try {
      final response = await _client.dio.post(
        '/ai/chat',
        data: {
          'message': message.trim(),
          if (conversationId != null) 'conversationId': conversationId,
          if (userLat != null) 'userLat': userLat,
          if (userLng != null) 'userLng': userLng,
        },
      );

      return response.data['data'] as Map<String, dynamic>;
    } catch (e) {
      throw _client.extractErrorMessage(e);
    }
  }

  Future<List<dynamic>> getConversations() async {
    try {
      final response = await _client.dio.get('/ai/conversations');
      return response.data['data'] as List<dynamic>? ?? [];
    } catch (e) {
      throw _client.extractErrorMessage(e);
    }
  }

  Future<List<dynamic>> getConversationMessages(String conversationId) async {
    try {
      final response = await _client.dio.get('/ai/conversations/$conversationId/messages');
      return response.data['data'] as List<dynamic>? ?? [];
    } catch (e) {
      throw _client.extractErrorMessage(e);
    }
  }

  Future<Map<String, dynamic>> createConversation([String? title]) async {
    try {
      final response = await _client.dio.post(
        '/ai/conversations',
        data: {'title': title ?? 'New Conversation'},
      );
      return response.data['data'] as Map<String, dynamic>;
    } catch (e) {
      throw _client.extractErrorMessage(e);
    }
  }

  Future<void> deleteConversation(String conversationId) async {
    try {
      await _client.dio.delete('/ai/conversations/$conversationId');
    } catch (e) {
      throw _client.extractErrorMessage(e);
    }
  }
}
