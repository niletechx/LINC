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
}
