import 'api_client.dart';

class CategoryModel {
  final String id;
  final String name;
  final String slug;
  final String icon;
  final String description;

  const CategoryModel({
    required this.id,
    required this.name,
    required this.slug,
    required this.icon,
    this.description = '',
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id']?.toString() ?? '',
      name: json['name'] as String? ?? 'Category',
      slug: json['slug'] as String? ?? '',
      icon: json['icon'] as String? ?? '⭐',
      description: json['description'] as String? ?? '',
    );
  }
}

class CategoryService {
  final ApiClient _client = ApiClient();

  Future<List<CategoryModel>> getCategories() async {
    try {
      final response = await _client.dio.get('/categories');
      final data = response.data['data'] as List<dynamic>? ?? [];
      return data.map((c) => CategoryModel.fromJson(c as Map<String, dynamic>)).toList();
    } catch (e) {
      throw _client.extractErrorMessage(e);
    }
  }
}
