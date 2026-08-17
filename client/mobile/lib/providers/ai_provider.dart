import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/chat_message_model.dart';
import '../data/mock_data.dart';
import '../services/ai_service.dart';

class AIChatState {
  final List<ChatMessage> messages;
  final bool loading;
  final String input;
  final String? conversationId;
  final String? error;

  const AIChatState({
    required this.messages,
    this.loading = false,
    this.input = '',
    this.conversationId,
    this.error,
  });

  AIChatState copyWith({
    List<ChatMessage>? messages,
    bool? loading,
    String? input,
    String? conversationId,
    String? error,
  }) =>
      AIChatState(
        messages: messages ?? this.messages,
        loading: loading ?? this.loading,
        input: input ?? this.input,
        conversationId: conversationId ?? this.conversationId,
        error: error,
      );
}

class AIChatNotifier extends StateNotifier<AIChatState> {
  final AiService _aiService = AiService();

  AIChatNotifier() : super(AIChatState(messages: List.from(MockData.initialAiMessages)));

  void setInput(String v) => state = state.copyWith(input: v);

  Future<void> sendPrompt(String prompt) async {
    state = state.copyWith(input: prompt);
    await send();
  }

  Future<void> send() async {
    final text = state.input.trim();
    if (text.isEmpty || state.loading) return;

    final userMsg = ChatMessage(role: MessageRole.user, text: text);
    final updatedMsgs = [...state.messages, userMsg];
    state = state.copyWith(messages: updatedMsgs, input: '', loading: true, error: null);

    try {
      final response = await _aiService.sendMessage(
        message: text,
        conversationId: state.conversationId,
      );

      final replyText = response['message'] as String? ?? 'Here are the best matches for your request:';
      final conversationId = response['conversationId']?.toString();
      final providers = response['providers'] as List<dynamic>? ?? [];

      state = state.copyWith(
        loading: false,
        conversationId: conversationId ?? state.conversationId,
        messages: [
          ...state.messages,
          ChatMessage(
            role: MessageRole.ai,
            text: replyText,
            hasProviders: providers.isNotEmpty,
            providers: providers,
          ),
        ],
      );
    } catch (_) {
      // Graceful fallback to rich local recommendation if unauthenticated/offline
      await Future.delayed(const Duration(milliseconds: 600));
      state = state.copyWith(
        loading: false,
        messages: [
          ...state.messages,
          ChatMessage(
            role: MessageRole.ai,
            text: 'I found top verified providers matching your request near Addis Ababa:',
            hasProviders: true,
          ),
        ],
      );
    }
  }
}

final aiChatProvider = StateNotifierProvider<AIChatNotifier, AIChatState>(
  (ref) => AIChatNotifier(),
);
