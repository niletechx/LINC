import 'api_client.dart';

class ReviewService {
  final ApiClient _client = ApiClient();

  Future<Map<String, dynamic>> submitReview({
    required String bookingId,
    required String entityType,
    required String entityId,
    required int rating,
    String? comment,
  }) async {
    try {
      final response = await _client.dio.post(
        '/reviews',
        data: {
          'booking_id': bookingId,
          'entity_type': entityType,
          'entity_id': entityId,
          'rating': rating,
          'comment': comment,
        },
      );
      return response.data['data'] as Map<String, dynamic>? ?? {};
    } catch (e) {
      throw _client.extractErrorMessage(e);
    }
  }

  Future<List<dynamic>> getReviewsForEntity(String entityType, String entityId) async {
    try {
      final response = await _client.dio.get('/reviews/$entityType/$entityId');
      return response.data['data'] as List<dynamic>? ?? [];
    } catch (e) {
      return [];
    }
  }
}
