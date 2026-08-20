import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/conversation_model.dart';
import '../services/message_service.dart';
import '../services/socket_service.dart';
import 'auth_provider.dart';
import 'data_providers.dart';

class DMState {
  final Map<String, List<DMMessage>> messages;
  final Map<String, bool> isLoading;
  final Map<String, bool> showAITrust;
  final String input;

  const DMState({
    required this.messages,
    this.isLoading = const {},
    required this.showAITrust,
    this.input = '',
  });

  DMState copyWith({
    Map<String, List<DMMessage>>? messages,
    Map<String, bool>? isLoading,
    Map<String, bool>? showAITrust,
    String? input,
  }) =>
      DMState(
        messages: messages ?? this.messages,
        isLoading: isLoading ?? this.isLoading,
        showAITrust: showAITrust ?? this.showAITrust,
        input: input ?? this.input,
      );
}

class DMNotifier extends StateNotifier<DMState> {
  final Ref _ref;
  final SocketService _socketService = SocketService();
  final MessageService _messageService = MessageService.instance;

  DMNotifier(this._ref) : super(const DMState(messages: {}, showAITrust: {})) {
    _initSocket();
  }

  void _initSocket() {
    _socketService.connect();
    _socketService.onNewMessage((data) {
      final convId = data['conversation_id']?.toString() ?? '1';
      final currentUserId = _ref.read(authProvider).user?.id ?? '';
      final newMsg = DMMessage.fromJson(data, currentUserId);

      final current = {...state.messages};
      final list = current[convId] ?? [];

      if (newMsg.id != null && list.any((m) => m.id == newMsg.id)) {
        return;
      }

      current[convId] = [...list, newMsg];
      state = state.copyWith(messages: current);
    });

    _socketService.onAiAdvisorResponse((data) {
      final convId = data['conversation_id']?.toString() ?? '1';
      final trust = {...state.showAITrust, convId: true};
      state = state.copyWith(showAITrust: trust);
    });
  }

  Future<void> loadConversation(dynamic convId) async {
    final key = convId.toString();
    _socketService.joinConversation(key);

    final hasExisting = state.messages[key] != null && state.messages[key]!.isNotEmpty;
    if (!hasExisting) {
      final loading = {...state.isLoading, key: true};
      state = state.copyWith(isLoading: loading);
    }

    try {
      final currentUserId = _ref.read(authProvider).user?.id ?? '';
      final msgs = await _messageService.getMessages(key, currentUserId);
      final current = {...state.messages, key: msgs};
      state = state.copyWith(messages: current);
      _ref.invalidate(conversationListProvider);
    } catch (_) {
      // Fallback gracefully
    } finally {
      final loadingDone = {...state.isLoading, key: false};
      state = state.copyWith(isLoading: loadingDone);
    }
  }

  void setInput(String v) => state = state.copyWith(input: v);

  Future<void> send(dynamic convId) async {
    final text = state.input.trim();
    if (text.isEmpty) return;

    final key = convId.toString();
    final user = _ref.read(authProvider).user;
    final currentUserId = user?.id ?? '1';
    final senderType = user?.role == 'provider' ? 'provider' : 'user';

    final optimisticMsg = DMMessage(
      fromMe: true,
      text: text,
      time: 'now',
      senderId: currentUserId,
    );

    final msgs = {...state.messages};
    msgs[key] = [...(msgs[key] ?? []), optimisticMsg];
    state = state.copyWith(messages: msgs, input: '');

    _socketService.sendMessage(
      conversationId: key,
      senderId: currentUserId,
      senderType: senderType,
      content: text,
    );

    try {
      await _messageService.sendMessage(
        conversationId: key,
        content: text,
        senderType: senderType,
        senderId: currentUserId,
      );
    } catch (_) {}

    if (text.toLowerCase().contains('@ai')) {
      await Future.delayed(const Duration(milliseconds: 600));
      final trust = {...state.showAITrust, key: true};
      state = state.copyWith(showAITrust: trust);
    }
  }

  void dismissTrust(dynamic convId) {
    final key = convId.toString();
    final trust = {...state.showAITrust, key: false};
    state = state.copyWith(showAITrust: trust);
  }
}

final dmProvider = StateNotifierProvider<DMNotifier, DMState>(
  (ref) => DMNotifier(ref),
);
