import 'package:flutter/material.dart';
import 'service_model.dart';

class ProviderModel {
  final dynamic id;
  final String initials;
  final Color color;
  final String name;
  final String headline;
  final double rating;
  final int reviews;
  final String distance;
  final String price;
  final bool verified;
  final int match;
  final int jobs;
  final String response;
  final String about;
  final List<ServiceModel> services;

  const ProviderModel({
    required this.id,
    required this.initials,
    required this.color,
    required this.name,
    required this.headline,
    required this.rating,
    required this.reviews,
    required this.distance,
    required this.price,
    required this.verified,
    required this.match,
    required this.jobs,
    required this.response,
    required this.about,
    required this.services,
  });
}
