/// LINC API & App Configuration
///
/// All environment-specific values are centralized here.
/// For production builds, these should be injected via --dart-define.
class AppConfig {
  AppConfig._();

  // ─── API ──────────────────────────────────────────────────────────────────
  static const String baseUrl =
      String.fromEnvironment('BASE_URL', defaultValue: 'http://10.0.2.2:5000');
  static const String apiUrl = '$baseUrl/api';

  // ─── Socket.IO ────────────────────────────────────────────────────────────
  static const String socketUrl = baseUrl;

  // ─── App Info ─────────────────────────────────────────────────────────────
  static const String appName = 'LINC';
  static const String appVersion = '1.0.0';

  // ─── Timeouts ─────────────────────────────────────────────────────────────
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);

  // ─── Pagination ───────────────────────────────────────────────────────────
  static const int defaultPageSize = 20;
}
