import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers/supabase_providers.dart';
import '../data/catalog_repository.dart';
import '../domain/category.dart';
import '../domain/product.dart';
import '../domain/product_image.dart';

final catalogRepositoryProvider = Provider<CatalogRepository>((ref) {
  final client = ref.watch(supabaseClientProvider);
  return CatalogRepository(client);
});

final categoriesProvider = FutureProvider<List<Category>>((ref) async {
  return ref.watch(catalogRepositoryProvider).fetchCategories();
});

class ProductQuery {
  final String? categoryKey;
  final String? q;

  const ProductQuery({this.categoryKey, this.q});

  @override
  bool operator ==(Object other) =>
      other is ProductQuery && other.categoryKey == categoryKey && other.q == q;

  @override
  int get hashCode => Object.hash(categoryKey, q);
}

final productsProvider = FutureProvider.family<List<Product>, ProductQuery>((ref, input) async {
  return ref.watch(catalogRepositoryProvider).fetchProducts(
        categoryKey: input.categoryKey,
        query: input.q,
      );
});

final productProvider = FutureProvider.family<Product, String>((ref, id) async {
  return ref.watch(catalogRepositoryProvider).fetchProductById(id);
});

final productImagesProvider = FutureProvider.family<List<ProductImage>, String>((ref, productId) async {
  return ref.watch(catalogRepositoryProvider).fetchProductImages(productId);
});


