import 'package:flutter/material.dart';

class ConversationModel {
  final int id;
  final int providerId;
  final String name;
  final String initials;
  final Color color;
  final String lastMsg;
  final String time;
  final int unread;
  final bool online;

  const ConversationModel({
    required this.id,
    required this.providerId,
    required this.name,
    required this.initials,
    required this.color,
    required this.lastMsg,
    required this.time,
    required this.unread,
    required this.online,
  });
}

class DMMessage {
  final bool fromMe;
  final String text;
  final String time;

  const DMMessage({required this.fromMe, required this.text, required this.time});
}
