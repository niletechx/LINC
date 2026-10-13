import 'dart:async';
import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Service responsible for polling and streaming network connectivity status.
class ConnectivityService {
  static final ConnectivityService _instance = ConnectivityService._internal();
  factory ConnectivityService() => _instance;
  ConnectivityService._internal();

  final _controller = StreamController<bool>.broadcast();
  Timer? _pollingTimer;
  bool _isOnline = true;

  /// Stream of network availability updates (`true` = online, `false` = offline).
  Stream<bool> get onConnectivityChanged => _controller.stream;

  /// Current synchronous connectivity status.
  bool get isOnline => _isOnline;

  /// Initializes periodic connectivity checks (defaults to 15s interval).
  void startMonitoring({Duration interval = const Duration(seconds: 15)}) {
    _pollingTimer?.cancel();
    checkConnectivity();
    _pollingTimer = Timer.periodic(interval, (_) => checkConnectivity());
  }

  /// Stops periodic polling.
  void stopMonitoring() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
  }

  /// Probes DNS resolution to determine active internet connection.
  Future<bool> checkConnectivity() async {
    try {
      final lookup = await InternetAddress.lookup('google.com')
          .timeout(const Duration(seconds: 4));
      final online = lookup.isNotEmpty && lookup[0].rawAddress.isNotEmpty;
      _updateStatus(online);
      return online;
    } catch (_) {
      _updateStatus(false);
      return false;
    }
  }

  void _updateStatus(bool online) {
    if (_isOnline != online) {
      _isOnline = online;
      _controller.add(online);
    }
  }

  void dispose() {
    stopMonitoring();
    _controller.close();
  }
}

/// Riverpod provider delivering connectivity stream to UI components.
final connectivityStreamProvider = StreamProvider<bool>((ref) {
  final service = ConnectivityService();
  service.startMonitoring();
  ref.onDispose(() => service.stopMonitoring());
  return service.onConnectivityChanged;
});

/// Riverpod provider for immediate connectivity boolean state.
final isOnlineProvider = Provider<bool>((ref) {
  final asyncVal = ref.watch(connectivityStreamProvider);
  return asyncVal.value ?? ConnectivityService().isOnline;
});
