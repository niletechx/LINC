enum MessageRole { user, ai }

class ChatMessage {
  final MessageRole role;
  final String text;
  final bool hasProviders;
  final List<dynamic>? providers;

  const ChatMessage({
    required this.role,
    required this.text,
    this.hasProviders = false,
    this.providers,
  });
}
