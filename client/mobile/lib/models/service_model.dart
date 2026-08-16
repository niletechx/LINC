class ServiceModel {
  final String name;
  final List<String> tags;
  final String duration;
  final String price;
  final bool fixed;

  const ServiceModel({
    required this.name,
    required this.tags,
    required this.duration,
    required this.price,
    required this.fixed,
  });
}
