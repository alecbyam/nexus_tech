import 'package:equatable/equatable.dart';

class CartItem extends Equatable {
  final String productId;
  final String name;
  final int priceCents;
  final String currency;
  final int quantity;

  const CartItem({
    required this.productId,
    required this.name,
    required this.priceCents,
    required this.currency,
    required this.quantity,
  });

  CartItem copyWith({int? quantity}) {
    return CartItem(
      productId: productId,
      name: name,
      priceCents: priceCents,
      currency: currency,
      quantity: quantity ?? this.quantity,
    );
  }

  Map<String, dynamic> toJson() => {
        'productId': productId,
        'name': name,
        'priceCents': priceCents,
        'currency': currency,
        'quantity': quantity,
      };

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      productId: json['productId'] as String,
      name: json['name'] as String,
      priceCents: (json['priceCents'] as num).toInt(),
      currency: (json['currency'] as String?) ?? 'USD',
      quantity: (json['quantity'] as num).toInt(),
    );
  }

  @override
  List<Object?> get props => [productId, name, priceCents, currency, quantity];
}


