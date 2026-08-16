enum MessageRole { user, ai }

class ChatMessage {
  final MessageRole role;
  final String text;
  final bool hasProviders;

  const ChatMessage({
    required this.role,
    required this.text,
    this.hasProviders = false,
  });
}
