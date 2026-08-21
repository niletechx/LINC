import 'package:flutter/material.dart';

enum BookingStatus { confirmed, upcoming, completed }

class BookingModel {
  final int id;
  final String title;
  final String provider;
  final String initials;
  final Color color;
  final String date;
  final String price;
  final BookingStatus status;

  const BookingModel({
    required this.id,
    required this.title,
    required this.provider,
    required this.initials,
    required this.color,
    required this.date,
    required this.price,
    required this.status,
  });
}
