import 'dart:typed_data';

import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/errors/app_exception.dart';
import '../../catalog/domain/product.dart';

class AdminProductRepository {
  final SupabaseClient _client;
  AdminProductRepository(this._client);

  Future<List<Product>> fetchAllProducts() async {
    try {
      final rows = await _client.from('products').select().order('created_at', ascending: false);
      return (rows as List).cast<Map<String, dynamic>>().map(Product.fromJson).toList();
    } on PostgrestException catch (e) {
      throw AppException(e.message, cause: e);
    }
  }

  Future<Product> createProduct({
    required String categoryId,
    required String name,
    required int priceCents,
    required String currency,
    required int stock,
    required bool isRefurbished,
    required bool isActive,
    String? description,
    String? sku,
  }) async {
    try {
      final row = await _client.from('products').insert({
        'category_id': categoryId,
        'sku': sku,
        'name': name,
        'description': description,
        'price_cents': priceCents,
        'currency': currency,
        'stock': stock,
        'is_refurbished': isRefurbished,
        'condition': isRefurbished ? 'refurbished' : 'new',
        'is_active': isActive,
      }).select().single();
      return Product.fromJson((row as Map).cast<String, dynamic>());
    } on PostgrestException catch (e) {
      throw AppException(e.message, cause: e);
    }
  }

  Future<void> updateProduct(String id, Map<String, dynamic> patch) async {
    try {
      await _client.from('products').update(patch).eq('id', id);
    } on PostgrestException catch (e) {
      throw AppException(e.message, cause: e);
    }
  }

  Future<void> deleteProduct(String id) async {
    try {
      await _client.from('products').delete().eq('id', id);
    } on PostgrestException catch (e) {
      throw AppException(e.message, cause: e);
    }
  }

  Future<String> uploadProductImage({
    required String productId,
    required Uint8List bytes,
    required String filename,
    required String contentType,
  }) async {
    try {
      final path = 'products/$productId/$filename';
      await _client.storage.from('product-images').uploadBinary(
            path,
            bytes,
            fileOptions: FileOptions(contentType: contentType, upsert: true),
          );
      return path;
    } on StorageException catch (e) {
      throw AppException(e.message, cause: e);
    }
  }

  Future<void> attachProductImage({
    required String productId,
    required String storagePath,
    bool isPrimary = true,
  }) async {
    try {
      if (isPrimary) {
        await _client.from('product_images').update({'is_primary': false}).eq('product_id', productId);
      }
      await _client.from('product_images').insert({
        'product_id': productId,
        'storage_path': storagePath,
        'is_primary': isPrimary,
      });
    } on PostgrestException catch (e) {
      throw AppException(e.message, cause: e);
    }
  }
}


