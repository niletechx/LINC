class ServiceModel {
  final String id;
  final String name;
  final List<String> tags;
  final String duration;
  final String price;
  final bool fixed;

  const ServiceModel({
    this.id = '1',
    required this.name,
    required this.tags,
    required this.duration,
    required this.price,
    this.fixed = true,
  });
}
