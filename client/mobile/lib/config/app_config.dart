/// LINC API & App Configuration
///
/// All environment-specific values are centralized here.
/// For production builds, these should be injected via --dart-define.
class AppConfig {
  AppConfig._();

  static const String _envBaseUrl = String.fromEnvironment('BASE_URL');
  static String get baseUrl {
    if (_envBaseUrl.isNotEmpty) return _envBaseUrl;
    return 'http://127.0.0.1:5000';
  }
  static String get apiUrl => '$baseUrl/api';

  // ─── Socket.IO ────────────────────────────────────────────────────────────
  static String get socketUrl => baseUrl;

  // ─── App Info ─────────────────────────────────────────────────────────────
  static const String appName = 'LINC';
  static const String appVersion = '1.0.0';

  // ─── Timeouts ─────────────────────────────────────────────────────────────
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);

  // ─── Pagination ───────────────────────────────────────────────────────────
  static const int defaultPageSize = 20;
}
