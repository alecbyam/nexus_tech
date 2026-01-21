import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/errors/app_exception.dart';
import '../domain/category.dart';
import '../domain/product.dart';
import '../domain/product_image.dart';

class CatalogRepository {
  final SupabaseClient _client;
  CatalogRepository(this._client);

  Future<List<Category>> fetchCategories() async {
    try {
      final rows = await _client.from('categories').select().order('sort_order');
      return (rows as List).cast<Map<String, dynamic>>().map(Category.fromJson).toList();
    } on PostgrestException catch (e) {
      throw AppException(e.message, cause: e);
    }
  }

  Future<List<Product>> fetchProducts({
    String? categoryKey,
    String? query,
    int limit = 50,
    int offset = 0,
  }) async {
    try {
      // NOTE: keep this typed as dynamic so Postgrest filter extensions (eq/ilike)
      // are available across supabase_flutter versions used in CI (Vercel).
      final dynamic q = _client
          .from('products')
          .select('*, categories!inner(key)')
          .eq('is_active', true);

      if (categoryKey != null && categoryKey.isNotEmpty) {
        q.eq('categories.key', categoryKey);
      }
      if (query != null && query.trim().isNotEmpty) {
        // recherche simple (ilike)
        q.ilike('name', '%${query.trim()}%');
      }

      final rows = await q.order('created_at', ascending: false).range(offset, offset + limit - 1);
      return (rows as List).cast<Map<String, dynamic>>().map(Product.fromJson).toList();
    } on PostgrestException catch (e) {
      throw AppException(e.message, cause: e);
    }
  }

  Future<Product> fetchProductById(String id) async {
    try {
      final row = await _client.from('products').select().eq('id', id).single();
      return Product.fromJson((row as Map).cast<String, dynamic>());
    } on PostgrestException catch (e) {
      throw AppException(e.message, cause: e);
    }
  }

  Future<List<ProductImage>> fetchProductImages(String productId) async {
    try {
      final rows = await _client.from('product_images').select().eq('product_id', productId).order('is_primary');
      return (rows as List).cast<Map<String, dynamic>>().map(ProductImage.fromJson).toList();
    } on PostgrestException catch (e) {
      throw AppException(e.message, cause: e);
    }
  }

  String publicImageUrl(String storagePath) {
    return _client.storage.from('product-images').getPublicUrl(storagePath);
  }
}


