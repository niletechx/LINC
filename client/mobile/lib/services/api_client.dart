import 'package:dio/dio.dart';
import 'storage_service.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;

  late final Dio dio;

  ApiClient._internal() {
    dio = Dio(
      BaseOptions(
        baseUrl: _resolveBaseUrl(),
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 60),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await StorageService.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) async {
          if (error.response?.statusCode == 401) {
            await StorageService.clear();
          }
          return handler.next(error);
        },
      ),
    );
  }

  static String _resolveBaseUrl() {
    const customBase = String.fromEnvironment('BASE_URL');
    if (customBase.isNotEmpty) {
      final trimmed = customBase.endsWith('/') ? customBase.substring(0, customBase.length - 1) : customBase;
      return trimmed.endsWith('/api') ? trimmed : '$trimmed/api';
    }
    return 'http://127.0.0.1:5000/api';
  }

  String extractErrorMessage(dynamic error) {
    if (error is DioException) {
      final data = error.response?.data;
      if (data is Map<String, dynamic>) {
        if (data['message'] != null) {
          return data['message'].toString();
        }
        if (data['errors'] != null && data['errors'] is List && (data['errors'] as List).isNotEmpty) {
          final first = (data['errors'] as List).first;
          if (first is Map && first['message'] != null) {
            return first['message'].toString();
          }
        }
      }
      if (error.type == DioExceptionType.connectionTimeout || error.type == DioExceptionType.connectionError) {
        return 'Unable to connect to LINC server. Please check your network connection.';
      }
      return error.message ?? 'An unexpected network error occurred';
    }
    return error.toString();
  }
}
