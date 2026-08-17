import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/provider_model.dart';
import '../services/category_service.dart';
import '../services/provider_service.dart';
import '../services/request_service.dart';

final categoryListProvider = FutureProvider<List<CategoryModel>>((ref) async {
  final service = CategoryService();
  return service.getCategories();
});

final providerListProvider = FutureProvider<List<ProviderModel>>((ref) async {
  final service = ProviderService();
  return service.getProviders();
});

final requestListProvider = FutureProvider<List<ServiceRequestModel>>((ref) async {
  final service = RequestService();
  return service.getRequests();
});
