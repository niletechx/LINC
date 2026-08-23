import 'package:flutter/material.dart';

class ConversationModel {
  final String id;
  final String providerId;
  final String name;
  final String username;
  final String initials;
  final String? avatarUrl;
  final Color color;
  final String lastMsg;
  final String time;
  final int unread;
  final bool online;

  const ConversationModel({
    required this.id,
    required this.providerId,
    required this.name,
    this.username = '',
    required this.initials,
    this.avatarUrl,
    required this.color,
    required this.lastMsg,
    required this.time,
    required this.unread,
    required this.online,
  });

  static const List<Color> _avatarColors = [
    Color(0xFF0284C7),
    Color(0xFF0D9488),
    Color(0xFF059669),
    Color(0xFF7C3AED),
    Color(0xFFD97706),
    Color(0xFFE11D48),
  ];

  static Color hashColor(String text) {
    int hash = 0;
    for (int i = 0; i < text.length; i++) {
      hash = text.codeUnitAt(i) + ((hash << 5) - hash);
    }
    return _avatarColors[hash.abs() % _avatarColors.length];
  }

  static String extractInitials(String name) {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty || parts[0].isEmpty) return 'U';
    if (parts.length == 1) return parts[0].substring(0, 1).toUpperCase();
    return (parts[0].substring(0, 1) + parts[1].substring(0, 1)).toUpperCase();
  }

  static String formatTime(dynamic raw) {
    if (raw == null) return 'now';
    try {
      final dt = DateTime.parse(raw.toString()).toLocal();
      final diff = DateTime.now().difference(dt);
      if (diff.inMinutes < 1) return 'now';
      if (diff.inMinutes < 60) return '${diff.inMinutes}m';
      if (diff.inHours < 24) return '${diff.inHours}h';
      if (diff.inDays < 7) return '${diff.inDays}d';
      return '${dt.month}/${dt.day}';
    } catch (_) {
      return raw.toString();
    }
  }

  factory ConversationModel.fromJson(Map<String, dynamic> json) {
    final other = json['other_participant'] as Map<String, dynamic>? ?? {};
    final name = other['name']?.toString() ?? other['full_name']?.toString() ?? 'Provider';
    final otherId = other['id']?.toString() ?? json['participant_b_id']?.toString() ?? '1';

    return ConversationModel(
      id: json['id']?.toString() ?? '1',
      providerId: otherId,
      name: name,
      username: other['username']?.toString() ?? '',
      initials: extractInitials(name),
      avatarUrl: other['avatar_url']?.toString(),
      color: hashColor(name),
      lastMsg: json['last_message']?.toString() ?? 'Conversation started',
      time: formatTime(json['last_message_at'] ?? json['created_at']),
      unread: (json['unread_count'] is num) ? (json['unread_count'] as num).toInt() : 0,
      online: true,
    );
  }
}

class DMMessage {
  final String? id;
  final String senderId;
  final bool fromMe;
  final String text;
  final String time;
  final bool hasAiMention;
  final String? aiResponse;

  const DMMessage({
    this.id,
    this.senderId = '',
    required this.fromMe,
    required this.text,
    required this.time,
    this.hasAiMention = false,
    this.aiResponse,
  });

  static String formatTime(dynamic raw) {
    if (raw == null) return 'now';
    try {
      final dt = DateTime.parse(raw.toString()).toLocal();
      final h = dt.hour.toString().padLeft(2, '0');
      final m = dt.minute.toString().padLeft(2, '0');
      return '$h:$m';
    } catch (_) {
      return raw.toString();
    }
  }

  factory DMMessage.fromJson(Map<String, dynamic> json, String currentUserId) {
    final sId = json['sender_id']?.toString() ?? '';
    final isFromMe = currentUserId.isNotEmpty && (sId == currentUserId);

    return DMMessage(
      id: json['id']?.toString(),
      senderId: sId,
      fromMe: isFromMe,
      text: json['content']?.toString() ?? '',
      time: formatTime(json['created_at']),
      hasAiMention: json['has_ai_mention'] == true,
      aiResponse: json['ai_response']?.toString(),
    );
  }
}
