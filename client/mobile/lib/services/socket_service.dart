import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/app_config.dart';

/// Manages the Socket.IO connection to the LINC real-time server.
/// Handles both chat messages and system notifications.
class SocketService {
  SocketService._();
  static final SocketService instance = SocketService._();

  io.Socket? _socket;
  final _storage = const FlutterSecureStorage();

  io.Socket? get socket => _socket;
  bool get isConnected => _socket?.connected ?? false;

  Future<void> connect() async {
    if (isConnected) return;

    final token = await _storage.read(key: 'access_token');

    _socket = io.io(
      AppConfig.socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .setAuth({'token': token})
          .build(),
    );

    _socket!.connect();

    _socket!.onConnect((_) {
      // ignore: avoid_print
      print('[LINC Socket] Connected');
    });

    _socket!.onDisconnect((_) {
      // ignore: avoid_print
      print('[LINC Socket] Disconnected');
    });

    _socket!.onConnectError((data) {
      // ignore: avoid_print
      print('[LINC Socket] Connection error: $data');
    });
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }

  /// Join a conversation room for real-time messaging
  void joinConversation(String conversationId) {
    _socket?.emit('join_conversation', {'conversationId': conversationId});
  }

  /// Send a chat message
  void sendMessage({
    required String conversationId,
    required String content,
  }) {
    _socket?.emit('send_message', {
      'conversationId': conversationId,
      'content': content,
    });
  }

  /// Listen to incoming messages
  void onMessage(void Function(Map<String, dynamic>) callback) {
    _socket?.on('new_message', (data) => callback(Map<String, dynamic>.from(data)));
  }

  /// Listen to notifications
  void onNotification(void Function(Map<String, dynamic>) callback) {
    _socket?.on('notification', (data) => callback(Map<String, dynamic>.from(data)));
  }
}
