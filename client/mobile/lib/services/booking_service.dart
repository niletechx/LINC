import '../models/booking_model.dart';
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

  Future<List<BookingModel>> listBookings() async {
    try {
      final response = await _client.dio.get('/bookings');
      final data = response.data['data'];
      if (data is List) {
        return data.map((json) => BookingModel.fromJson(json as Map<String, dynamic>)).toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  Future<Map<String, dynamic>> markComplete(String bookingId) async {
    try {
      final response = await _client.dio.post('/bookings/$bookingId/complete');
      final raw = response.data['data'];
      if (raw is Map<String, dynamic>) return raw;
      if (raw is List && raw.isNotEmpty && raw.first is Map<String, dynamic>) {
        return raw.first as Map<String, dynamic>;
      }
      return {};
    } catch (e) {
      throw _client.extractErrorMessage(e);
    }
  }

  Future<Map<String, dynamic>> updateBooking(String bookingId, Map<String, dynamic> payload) async {
    try {
      final response = await _client.dio.put('/bookings/$bookingId', data: payload);
      final raw = response.data['data'];
      if (raw is Map<String, dynamic>) return raw;
      if (raw is List && raw.isNotEmpty && raw.first is Map<String, dynamic>) {
        return raw.first as Map<String, dynamic>;
      }
      return {};
    } catch (e) {
      throw _client.extractErrorMessage(e);
    }
  }
}

