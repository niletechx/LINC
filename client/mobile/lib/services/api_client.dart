import 'package:dio/dio.dart';
import '../config/app_config.dart';
import 'storage_service.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;

  late final Dio dio;

  ApiClient._internal() {
    dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiUrl,
        connectTimeout: AppConfig.connectionTimeout,
        receiveTimeout: AppConfig.receiveTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Sync with AppConfig whenever baseUrl changes
    AppConfig.addListener(_onConfigChanged);

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

  void _onConfigChanged() {
    dio.options.baseUrl = AppConfig.apiUrl;
  }

  String getBaseUrl() => AppConfig.baseUrl;
  String getApiUrl() => AppConfig.apiUrl;

  String extractErrorMessage(dynamic error) {
    if (error is DioException) {
      final statusCode = error.response?.statusCode;
      final uri = error.requestOptions.uri.toString();
      final data = error.response?.data;

      // 1. Check for backend structured error messages
      if (data is Map<String, dynamic>) {
        if (data['message'] != null) {
          return data['message'].toString();
        }
        if (data['error'] != null) {
          return data['error'].toString();
        }
        if (data['errors'] != null && data['errors'] is List && (data['errors'] as List).isNotEmpty) {
          final first = (data['errors'] as List).first;
          if (first is Map && first['message'] != null) {
            return first['message'].toString();
          }
          return first.toString();
        }
      }

      // 2. HTTP Status Code specific feedback
      if (statusCode != null) {
        if (statusCode == 401) return 'Invalid email or password.';
        if (statusCode == 404) return 'Endpoint not found (404) at $uri';
        if (statusCode >= 500) return 'Server error ($statusCode) at $uri';
      }

      // 3. Network connection issues
      if (error.type == DioExceptionType.connectionTimeout ||
          error.type == DioExceptionType.connectionError ||
          error.type == DioExceptionType.receiveTimeout ||
          error.type == DioExceptionType.sendTimeout ||
          error.type == DioExceptionType.unknown) {
        return 'Cannot connect to LINC backend at ${AppConfig.apiUrl}.\n(Failed endpoint: $uri)\n\nTip: Use Server IP settings to configure your PC Wi-Fi IP or launch with --dart-define=BASE_URL.';
      }

      return error.message ?? 'An unexpected network error occurred';
    }
    return error.toString();
  }
}
