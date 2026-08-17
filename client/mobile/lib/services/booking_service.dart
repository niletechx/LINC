import 'api_client.dart';

class BookingService {
  final ApiClient _client = ApiClient();

  Future<Map<String, dynamic>> createBooking({
    required String serviceId,
    required String entityId,
    required String entityType,
    required String scheduledAt,
    required double agreedPrice,
    String? notes,
    String paymentMethod = 'cash',
  }) async {
    try {
      final response = await _client.dio.post(
        '/bookings',
        data: {
          'service_id': serviceId,
          'entity_id': entityId,
          'entity_type': entityType,
          'scheduled_at': scheduledAt,
          'agreed_price': agreedPrice,
          'currency': 'ETB',
          'notes': notes,
          'status': paymentMethod == 'escrow' ? 'paid_escrow' : 'pending',
        },
      );

      return response.data['data'] as Map<String, dynamic>;
    } catch (e) {
      throw _client.extractErrorMessage(e);
    }
  }

  Future<List<dynamic>> listBookings() async {
    try {
      final response = await _client.dio.get('/bookings');
      return response.data['data'] as List<dynamic>? ?? [];
    } catch (e) {
      throw _client.extractErrorMessage(e);
    }
  }
}
