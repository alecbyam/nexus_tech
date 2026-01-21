import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers/supabase_providers.dart';
import '../../catalog/application/catalog_providers.dart';
import '../../catalog/domain/category.dart';
import '../../catalog/domain/product.dart';
import '../data/admin_product_repository.dart';

final adminProductRepositoryProvider = Provider<AdminProductRepository>((ref) {
  final client = ref.watch(supabaseClientProvider);
  return AdminProductRepository(client);
});

final adminCategoriesProvider = FutureProvider<List<Category>>((ref) async {
  // admin réutilise les catégories publiques
  return ref.watch(categoriesProvider.future);
});

final adminProductsProvider = FutureProvider<List<Product>>((ref) async {
  return ref.watch(adminProductRepositoryProvider).fetchAllProducts();
});


