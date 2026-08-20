import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/chat_message_model.dart';
import '../services/ai_service.dart';

const _kWelcomeMessage = ChatMessage(
  role: MessageRole.ai,
  text: "Hi! I'm LINC AI. Describe what you need in plain language — location, budget, urgency — and I'll match you with the best verified providers nearby.",
);

class AIChatState {
  final List<ChatMessage> messages;
  final bool loading;
  final String input;
  final String? conversationId;
  final String? activeTitle;
  final List<dynamic> conversations;
  final bool loadingSessions;
  final String? error;

  const AIChatState({
    required this.messages,
    this.loading = false,
    this.input = '',
    this.conversationId,
    this.activeTitle,
    this.conversations = const [],
    this.loadingSessions = false,
    this.error,
  });

  AIChatState copyWith({
    List<ChatMessage>? messages,
    bool? loading,
    String? input,
    String? conversationId,
    String? activeTitle,
    List<dynamic>? conversations,
    bool? loadingSessions,
    String? error,
  }) =>
      AIChatState(
        messages: messages ?? this.messages,
        loading: loading ?? this.loading,
        input: input ?? this.input,
        conversationId: conversationId ?? this.conversationId,
        activeTitle: activeTitle ?? this.activeTitle,
        conversations: conversations ?? this.conversations,
        loadingSessions: loadingSessions ?? this.loadingSessions,
        error: error,
      );
}

class AIChatNotifier extends StateNotifier<AIChatState> {
  final AiService _aiService = AiService();

  AIChatNotifier()
      : super(const AIChatState(
          messages: [_kWelcomeMessage],
          activeTitle: 'New Chat',
        )) {
    loadSessions();
  }

  void setInput(String v) => state = state.copyWith(input: v);

  Future<void> loadSessions() async {
    state = state.copyWith(loadingSessions: true);
    try {
      final list = await _aiService.getConversations();
      state = state.copyWith(conversations: list, loadingSessions: false);
    } catch (_) {
      state = state.copyWith(loadingSessions: false);
    }
  }

  Future<void> startNewSession() async {
    state = AIChatState(
      messages: [_kWelcomeMessage],
      activeTitle: 'New Chat',
      conversations: state.conversations,
      conversationId: null,
    );
  }

  Future<void> switchSession(dynamic session) async {
    final String convId = session['id'].toString();
    final String title = session['title']?.toString() ?? 'Chat';

    state = state.copyWith(
      loading: true,
      conversationId: convId,
      activeTitle: title,
    );

    try {
      final rawMsgs = await _aiService.getConversationMessages(convId);
      final List<ChatMessage> loaded = [];

      for (final m in rawMsgs) {
        final roleStr = m['role']?.toString();
        final content = m['content']?.toString() ?? '';
        final contextObj = m['retrieved_context'] as Map<String, dynamic>?;
        final providers = contextObj?['providers'] as List<dynamic>?;

        loaded.add(
          ChatMessage(
            role: roleStr == 'user' ? MessageRole.user : MessageRole.ai,
            text: content,
            hasProviders: providers != null && providers.isNotEmpty,
            providers: providers,
          ),
        );
      }

      state = state.copyWith(
        loading: false,
        messages: loaded.isNotEmpty ? loaded : [_kWelcomeMessage],
      );
    } catch (_) {
      state = state.copyWith(loading: false);
    }
  }

  Future<void> deleteSession(String convId) async {
    try {
      await _aiService.deleteConversation(convId);
      final updated = state.conversations.where((c) => c['id'].toString() != convId).toList();
      state = state.copyWith(conversations: updated);

      if (state.conversationId == convId) {
        await startNewSession();
      }
    } catch (_) {}
  }

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
        activeTitle: state.activeTitle == 'New Chat' ? text.slice(0, 30) : state.activeTitle,
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

      // Refresh session list so the new thread appears in drawer
      loadSessions();
    } catch (e) {
      // Print error to console for instant debugging
      // ignore: avoid_print
      print('AI chat error: $e');

      state = state.copyWith(
        loading: false,
        error: e.toString(),
        messages: [
          ...state.messages,
          ChatMessage(
            role: MessageRole.ai,
            text: '⚠️ Unable to reach LINC AI service right now: $e. Please check your internet connection or try again.',
            hasProviders: false,
          ),
        ],
      );
    }
  }
}

extension StringSlice on String {
  String slice(int start, int end) {
    if (length <= start) return '';
    return substring(start, length < end ? length : end);
  }
}

final aiChatProvider = StateNotifierProvider<AIChatNotifier, AIChatState>(
  (ref) => AIChatNotifier(),
);
