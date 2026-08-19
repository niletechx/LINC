import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as socket_io;
import '../config/app_config.dart';
import 'storage_service.dart';

typedef MessageCallback = void Function(Map<String, dynamic> message);
typedef AiAdvisorCallback = void Function(Map<String, dynamic> response);

class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;

  socket_io.Socket? _socket;
  bool _isConnected = false;

  bool get isConnected => _isConnected;

  SocketService._internal() {
    AppConfig.addListener(_onConfigChanged);
  }

  void _onConfigChanged() {
    if (_socket != null) {
      debugPrint('🔄 Socket.IO base URL changed to ${AppConfig.socketUrl}, reconnecting...');
      disconnect();
      connect();
    }
  }

  Future<void> connect() async {
    if (_socket != null && _isConnected) return;

    final token = await StorageService.getToken();
    final baseUrl = AppConfig.socketUrl;

    _socket = socket_io.io(
      baseUrl,
      socket_io.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .setExtraHeaders(token != null ? {'Authorization': 'Bearer $token'} : {})
          .build(),
    );

    _socket!.onConnect((_) {
      _isConnected = true;
      debugPrint('🟢 Socket.IO connected to $baseUrl');
    });

    _socket!.onDisconnect((_) {
      _isConnected = false;
      debugPrint('🔴 Socket.IO disconnected');
    });

    _socket!.connect();
  }

  void joinConversation(dynamic conversationId) {
    if (_socket == null) return;
    _socket!.emit('join_conversation', {'conversationId': conversationId.toString()});
  }

  void sendMessage({
    required dynamic conversationId,
    required String senderId,
    required String senderType,
    required String content,
  }) {
    if (_socket == null) return;
    _socket!.emit('send_message', {
      'conversationId': conversationId.toString(),
      'senderId': senderId,
      'senderType': senderType,
      'content': content,
    });
  }

  void onNewMessage(MessageCallback callback) {
    _socket?.on('new_message', (data) {
      if (data is Map<String, dynamic>) {
        callback(data);
      }
    });
  }

  void onAiAdvisorResponse(AiAdvisorCallback callback) {
    _socket?.on('ai_advisor_response', (data) {
      if (data is Map<String, dynamic>) {
        callback(data);
      }
    });
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _isConnected = false;
  }
}
