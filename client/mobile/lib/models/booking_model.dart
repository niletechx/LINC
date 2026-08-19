import 'package:flutter/material.dart';

enum BookingStatus { confirmed, upcoming, completed, pending, cancelled }

class BookingModel {
  final dynamic id;
  final String title;
  final String provider;
  final String initials;
  final Color color;
  final String date;
  final String price;
  final BookingStatus status;
  final String statusText;
  final String? entityId;

  const BookingModel({
    required this.id,
    required this.title,
    required this.provider,
    required this.initials,
    required this.color,
    required this.date,
    required this.price,
    required this.status,
    this.statusText = 'Confirmed',
    this.entityId,
  });

  static const List<Color> _avatarColors = [
    Color(0xFF0284C7),
    Color(0xFF0D9488),
    Color(0xFF059669),
    Color(0xFF7C3AED),
    Color(0xFFD97706),
    Color(0xFFE11D48),
  ];

  static Color _hashColor(String text) {
    int hash = 0;
    for (int i = 0; i < text.length; i++) {
      hash = text.codeUnitAt(i) + ((hash << 5) - hash);
    }
    return _avatarColors[hash.abs() % _avatarColors.length];
  }

  static String _extractInitials(String name) {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty || parts[0].isEmpty) return 'P';
    if (parts.length == 1) return parts[0].substring(0, 1).toUpperCase();
    return (parts[0].substring(0, 1) + parts[1].substring(0, 1)).toUpperCase();
  }

  static String _formatDate(dynamic raw) {
    if (raw == null) return 'Upcoming';
    try {
      final dt = DateTime.parse(raw.toString()).toLocal();
      final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      final m = months[dt.month - 1];
      final h = dt.hour.toString().padLeft(2, '0');
      final min = dt.minute.toString().padLeft(2, '0');
      return '$m ${dt.day} · $h:$min';
    } catch (_) {
      return raw.toString();
    }
  }

  factory BookingModel.fromJson(Map<String, dynamic> json) {
    final rawStatus = (json['status']?.toString() ?? 'pending').toLowerCase();
    BookingStatus bStatus;
    String statusLabel;

    if (rawStatus == 'completed') {
      bStatus = BookingStatus.completed;
      statusLabel = 'Completed';
    } else if (rawStatus == 'confirmed' || rawStatus == 'paid_escrow' || rawStatus == 'in_progress') {
      bStatus = BookingStatus.confirmed;
      statusLabel = rawStatus == 'paid_escrow' ? 'Escrow Held 🛡️' : 'Confirmed';
    } else if (rawStatus == 'cancelled') {
      bStatus = BookingStatus.cancelled;
      statusLabel = 'Cancelled';
    } else {
      bStatus = BookingStatus.upcoming;
      statusLabel = 'Pending';
    }

    final serviceObj = json['services'] as Map<String, dynamic>?;
    final title = serviceObj?['title']?.toString() ?? json['title']?.toString() ?? 'Service Booking';
    final providerName = json['provider_name']?.toString() ?? 'Verified Provider';
    final priceAmount = json['agreed_price'] ?? serviceObj?['price_amount'] ?? 350;
    final currency = json['currency']?.toString() ?? 'ETB';

    return BookingModel(
      id: json['id'] ?? 1,
      title: title,
      provider: providerName,
      initials: _extractInitials(providerName),
      color: _hashColor(providerName),
      date: _formatDate(json['scheduled_at'] ?? json['created_at']),
      price: '$priceAmount $currency',
      status: bStatus,
      statusText: statusLabel,
      entityId: json['entity_id']?.toString(),
    );
  }
}
