import 'package:flutter/material.dart';
import '../models/provider_model.dart';
import '../models/service_model.dart';
import 'api_client.dart';

class ProviderService {
  final ApiClient _client = ApiClient();

  Future<List<ProviderModel>> getProviders({
    String? city,
    double? maxRate,
    double? minRate,
    int? limit,
  }) async {
    try {
      final response = await _client.dio.get(
        '/providers',
        queryParameters: {
          if (city != null) 'city': city,
          if (maxRate != null) 'maxRate': maxRate,
          if (minRate != null) 'minRate': minRate,
          if (limit != null) 'limit': limit,
        },
      );

      final data = response.data['data'] as List<dynamic>? ?? [];
      return data.map((json) => _mapJsonToProvider(json as Map<String, dynamic>)).toList();
    } catch (e) {
      debugPrint('ProviderService.getProviders error: $e');
      return [];
    }
  }

  Future<ProviderModel> getProviderById(String id) async {
    try {
      final response = await _client.dio.get('/providers/$id');
      final data = response.data['data'] as Map<String, dynamic>;
      return _mapJsonToProvider(data);
    } catch (e) {
      debugPrint('ProviderService.getProviderById error for id $id: $e');
      throw _client.extractErrorMessage(e);
    }
  }

  Future<Map<String, dynamic>> createMyProfile({
    required String headline,
    required String bio,
    required double hourlyRate,
    String currency = 'ETB',
    String locationCity = 'Addis Ababa',
    List<String> categoryIds = const [],
    String availabilityStatus = 'available',
  }) async {
    try {
      final response = await _client.dio.post(
        '/providers/me',
        data: {
          'headline': headline,
          'bio': bio,
          'hourly_rate': hourlyRate,
          'currency': currency,
          'location_city': locationCity,
          'category_ids': categoryIds,
          'availability_status': availabilityStatus,
        },
      );
      return response.data['data'] as Map<String, dynamic>? ?? {};
    } catch (e) {
      throw _client.extractErrorMessage(e);
    }
  }

  Future<Map<String, dynamic>?> getMyProfile() async {
    try {
      final response = await _client.dio.get('/providers/me');
      return response.data['data'] as Map<String, dynamic>?;
    } catch (_) {
      return null;
    }
  }

  ProviderModel _mapJsonToProvider(Map<String, dynamic> json) {
    final user = json['users'] as Map<String, dynamic>? ?? {};
    final id = json['id']?.toString() ?? '1';
    final name = user['full_name'] as String? ?? user['username'] as String? ?? 'Service Provider';
    final headline = json['headline'] as String? ?? 'Verified Specialist';
    final bio = json['bio'] as String? ?? '';
    final isVerified = json['is_verified'] as bool? ?? true;
    final rating = (json['avg_rating'] as num?)?.toDouble() ?? 4.9;
    final reviews = json['total_reviews'] as int? ?? 12;
    final hourlyRate = (json['hourly_rate'] as num?)?.toDouble() ?? 300.0;
    final currency = json['currency'] as String? ?? 'ETB';
    final jobs = json['completed_jobs'] as int? ?? 48;

    final parts = name.trim().split(RegExp(r'\s+'));
    final initials = parts.length > 1
        ? '${parts[0][0]}${parts[1][0]}'.toUpperCase()
        : name.substring(0, name.length > 1 ? 2 : 1).toUpperCase();

    final services = [
      ServiceModel(
        id: '1',
        name: headline,
        price: '${hourlyRate.toInt()} $currency/hr',
        duration: '1–2 hrs',
        tags: const ['Popular', 'Verified'],
      ),
      ServiceModel(
        id: '2',
        name: 'Full Inspection & Consultation',
        price: '200 $currency',
        duration: '45 mins',
        tags: const ['Standard'],
      ),
    ];

    return ProviderModel(
      id: id,
      initials: initials,
      color: const Color(0xFF1E5F7A),
      name: name,
      headline: headline,
      rating: rating,
      reviews: reviews,
      distance: '1.2 km',
      price: '${hourlyRate.toInt()} $currency/hr',
      verified: isVerified,
      match: 94,
      jobs: jobs,
      response: '~5 min',
      about: bio.isNotEmpty ? bio : '$name is a verified professional with high ratings across Addis Ababa.',
      services: services,
    );
  }
}
