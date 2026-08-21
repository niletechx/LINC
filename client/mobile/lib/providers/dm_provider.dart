import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/conversation_model.dart';
import '../data/mock_data.dart';
import '../services/socket_service.dart';

class DMState {
  final Map<dynamic, List<DMMessage>> messages;
  final Map<dynamic, bool> showAITrust;
  final String input;

  const DMState({
    required this.messages,
    required this.showAITrust,
    this.input = '',
  });

  DMState copyWith({
    Map<dynamic, List<DMMessage>>? messages,
    Map<dynamic, bool>? showAITrust,
    String? input,
  }) =>
      DMState(
        messages: messages ?? this.messages,
        showAITrust: showAITrust ?? this.showAITrust,
        input: input ?? this.input,
      );
}

class DMNotifier extends StateNotifier<DMState> {
  final SocketService _socketService = SocketService();

  DMNotifier() : super(DMState(messages: Map.from(MockData.dmSeed), showAITrust: {})) {
    _initSocket();
  }

  void _initSocket() {
    _socketService.connect();
    _socketService.onNewMessage((data) {
      final convId = data['conversation_id']?.toString() ?? '1';
      final text = data['content'] as String? ?? '';
      final senderType = data['sender_type'] as String? ?? 'provider';

      final newMsg = DMMessage(
        fromMe: senderType == 'user',
        text: text,
        time: 'now',
      );

      final current = {...state.messages};
      current[convId] = [...(current[convId] ?? []), newMsg];
      state = state.copyWith(messages: current);
    });

    _socketService.onAiAdvisorResponse((data) {
      final convId = data['conversation_id']?.toString() ?? '1';
      final trust = {...state.showAITrust, convId: true};
      state = state.copyWith(showAITrust: trust);
    });
  }

  void joinRoom(dynamic convId) {
    _socketService.joinConversation(convId);
  }

  void setInput(String v) => state = state.copyWith(input: v);

  Future<void> send(dynamic convId) async {
    final text = state.input.trim();
    if (text.isEmpty) return;

    final msgs = {...state.messages};
    msgs[convId] = [...(msgs[convId] ?? []), DMMessage(fromMe: true, text: text, time: 'now')];
    final triggerAI = text.toLowerCase().contains('@ai');

    state = state.copyWith(messages: msgs, input: '');

    _socketService.sendMessage(
      conversationId: convId,
      senderId: 'current_user',
      senderType: 'user',
      content: text,
    );

    if (triggerAI) {
      await Future.delayed(const Duration(milliseconds: 600));
      final trust = {...state.showAITrust, convId: true};
      state = state.copyWith(showAITrust: trust);
    }
  }

  void dismissTrust(dynamic convId) {
    final trust = {...state.showAITrust, convId: false};
    state = state.copyWith(showAITrust: trust);
  }
}

final dmProvider = StateNotifierProvider<DMNotifier, DMState>(
  (ref) => DMNotifier(),
);
