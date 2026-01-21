import 'package:equatable/equatable.dart';

class Product extends Equatable {
  final String id;
  final String categoryId;
  final String? sku;
  final String name;
  final String? description;
  final int priceCents;
  final String currency;
  final int stock;
  final bool isRefurbished;
  final String condition; // new/refurbished
  final bool isActive;

  const Product({
    required this.id,
    required this.categoryId,
    required this.sku,
    required this.name,
    required this.description,
    required this.priceCents,
    required this.currency,
    required this.stock,
    required this.isRefurbished,
    required this.condition,
    required this.isActive,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] as String,
      categoryId: json['category_id'] as String,
      sku: json['sku'] as String?,
      name: json['name'] as String,
      description: json['description'] as String?,
      priceCents: (json['price_cents'] as num).toInt(),
      currency: (json['currency'] as String?) ?? 'USD',
      stock: (json['stock'] as num?)?.toInt() ?? 0,
      isRefurbished: (json['is_refurbished'] as bool?) ?? false,
      condition: (json['condition'] as String?) ?? 'new',
      isActive: (json['is_active'] as bool?) ?? true,
    );
  }

  double get price => priceCents / 100.0;

  @override
  List<Object?> get props =>
      [id, categoryId, sku, name, description, priceCents, currency, stock, isRefurbished, condition, isActive];
}


