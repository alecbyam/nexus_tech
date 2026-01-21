import 'package:equatable/equatable.dart';

class ProductImage extends Equatable {
  final String id;
  final String productId;
  final String storagePath;
  final bool isPrimary;

  const ProductImage({
    required this.id,
    required this.productId,
    required this.storagePath,
    required this.isPrimary,
  });

  factory ProductImage.fromJson(Map<String, dynamic> json) {
    return ProductImage(
      id: json['id'] as String,
      productId: json['product_id'] as String,
      storagePath: json['storage_path'] as String,
      isPrimary: (json['is_primary'] as bool?) ?? false,
    );
  }

  @override
  List<Object?> get props => [id, productId, storagePath, isPrimary];
}


