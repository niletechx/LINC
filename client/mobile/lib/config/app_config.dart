import 'package:flutter/foundation.dart';
import '../services/storage_service.dart';

/// LINC API & App Configuration
///
/// Single source of truth for all backend endpoints (REST API & Socket.IO).
/// Supports:
/// 1. Compile-time environment injection via `--dart-define=BASE_URL=http://...`
/// 2. User/runtime configuration via UI settings saved to SharedPreferences.
/// 3. Platform-aware development defaults.
class AppConfig {
  AppConfig._();

  static const String defaultDevHost = '10.2.64.251:5000';
  static const String _envBaseUrl = String.fromEnvironment('BASE_URL');

  static String? _overrideBaseUrl;

  /// Callback registered by ApiClient/SocketService to be notified when baseUrl changes.
  static final List<VoidCallback> _listeners = [];

  static void addListener(VoidCallback listener) {
    if (!_listeners.contains(listener)) {
      _listeners.add(listener);
    }
  }

  static void removeListener(VoidCallback listener) {
    _listeners.remove(listener);
  }

  static void _notifyListeners() {
    for (final listener in _listeners) {
      try {
        listener();
      } catch (_) {}
    }
  }

  /// Initialize stored configuration on app startup.
  static Future<void> initialize() async {
    try {
      final saved = await StorageService.getBaseUrl();
      if (saved != null && saved.trim().isNotEmpty) {
        _overrideBaseUrl = _normalizeUrl(saved);
      }
    } catch (_) {}
  }

  /// The root base URL (e.g. `http://10.186.1.187:5000`) without trailing slash or `/api`.
  static String get baseUrl {
    if (_overrideBaseUrl != null && _overrideBaseUrl!.isNotEmpty) {
      return _overrideBaseUrl!;
    }
    if (_envBaseUrl.isNotEmpty) {
      return _normalizeUrl(_envBaseUrl);
    }
    if (kIsWeb) {
      return 'http://127.0.0.1:5000';
    }
    return 'http://$defaultDevHost';
  }

  /// The REST API endpoint prefix (e.g. `http://10.186.1.187:5000/api`).
  static String get apiUrl => '$baseUrl/api';

  /// The Socket.IO connection URL (e.g. `http://10.186.1.187:5000`).
  static String get socketUrl => baseUrl;

  /// Dynamically update the base URL and persist the setting.
  static Future<void> setBaseUrl(String newUrl) async {
    final normalized = _normalizeUrl(newUrl);
    _overrideBaseUrl = normalized;
    await StorageService.saveBaseUrl(normalized);
    _notifyListeners();
  }

  /// Reset to the default environment / fallback URL.
  static Future<void> resetToDefault() async {
    _overrideBaseUrl = null;
    await StorageService.removeBaseUrl();
    _notifyListeners();
  }

  static String _normalizeUrl(String raw) {
    var trimmed = raw.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      trimmed = 'http://$trimmed';
    }
    // Development servers on local network / localhost use HTTP, not HTTPS
    if (trimmed.startsWith('https://127.0.0.1') ||
        trimmed.startsWith('https://localhost') ||
        trimmed.startsWith('https://10.') ||
        trimmed.startsWith('https://192.168.')) {
      trimmed = trimmed.replaceFirst('https://', 'http://');
    }
    while (trimmed.endsWith('/')) {
      trimmed = trimmed.substring(0, trimmed.length - 1);
    }
    if (trimmed.endsWith('/api')) {
      trimmed = trimmed.substring(0, trimmed.length - 4);
    }
    while (trimmed.endsWith('/')) {
      trimmed = trimmed.substring(0, trimmed.length - 1);
    }
    return trimmed;
  }

  // ─── App Info ─────────────────────────────────────────────────────────────
  static const String appName = 'LINC';
  static const String appVersion = '1.0.0';

  // ─── Timeouts ─────────────────────────────────────────────────────────────
  static const Duration connectionTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 30);

  // ─── Pagination ───────────────────────────────────────────────────────────
  static const int defaultPageSize = 20;
}
