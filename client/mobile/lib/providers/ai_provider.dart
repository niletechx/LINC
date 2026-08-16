import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/chat_message_model.dart';
import '../data/mock_data.dart';

class AIChatState {
  final List<ChatMessage> messages;
  final bool loading;
  final String input;
  const AIChatState({required this.messages, this.loading = false, this.input = ''});
  AIChatState copyWith({List<ChatMessage>? messages, bool? loading, String? input}) =>
      AIChatState(messages: messages ?? this.messages, loading: loading ?? this.loading, input: input ?? this.input);
}

class AIChatNotifier extends StateNotifier<AIChatState> {
  AIChatNotifier() : super(AIChatState(messages: List.from(MockData.initialAiMessages)));

  void setInput(String v) => state = state.copyWith(input: v);

  Future<void> send() async {
    final text = state.input.trim();
    if (text.isEmpty || state.loading) return;
    final msgs = [...state.messages, ChatMessage(role: MessageRole.user, text: text)];
    state = state.copyWith(messages: msgs, input: '', loading: true);
    await Future.delayed(const Duration(milliseconds: 1400));
    state = state.copyWith(
      loading: false,
      messages: [
        ...state.messages,
        ChatMessage(
          role: MessageRole.ai,
          text: 'I analysed your request and found verified providers near Bole. Here are the top matches based on rating, distance, and your budget:',
          hasProviders: true,
        ),
      ],
    );
  }
}

final aiChatProvider = StateNotifierProvider<AIChatNotifier, AIChatState>(
  (ref) => AIChatNotifier(),
);
