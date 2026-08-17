import 'api_client.dart';

class ServiceRequestModel {
  final String id;
  final String title;
  final String description;
  final double budgetMin;
  final double budgetMax;
  final String currency;
  final String city;
  final String urgency;
  final String status;
  final String time;

  const ServiceRequestModel({
    required this.id,
    required this.title,
    required this.description,
    required this.budgetMin,
    required this.budgetMax,
    required this.currency,
    required this.city,
    required this.urgency,
    required this.status,
    required this.time,
  });

  factory ServiceRequestModel.fromJson(Map<String, dynamic> json) {
    return ServiceRequestModel(
      id: json['id']?.toString() ?? '',
      title: json['title'] as String? ?? 'Service Request',
      description: json['description'] as String? ?? '',
      budgetMin: (json['budget_min'] as num?)?.toDouble() ?? 0.0,
      budgetMax: (json['budget_max'] as num?)?.toDouble() ?? 500.0,
      currency: json['currency'] as String? ?? 'ETB',
      city: json['location_city'] as String? ?? 'Addis Ababa',
      urgency: json['urgency'] as String? ?? 'medium',
      status: json['status'] as String? ?? 'open',
      time: '12m ago',
    );
  }
}

class RequestService {
  final ApiClient _client = ApiClient();

  Future<List<ServiceRequestModel>> getRequests() async {
    try {
      final response = await _client.dio.get('/requests');
      final data = response.data['data'] as List<dynamic>? ?? [];
      return data.map((r) => ServiceRequestModel.fromJson(r as Map<String, dynamic>)).toList();
    } catch (e) {
      throw _client.extractErrorMessage(e);
    }
  }
}
