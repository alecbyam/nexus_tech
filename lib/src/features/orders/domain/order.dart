import 'package:equatable/equatable.dart';

class Order extends Equatable {
  final String id;
  final String userId;
  final String status;
  final int totalCents;
  final String currency;
  final String? customerNote;
  final DateTime createdAt;

  const Order({
    required this.id,
    required this.userId,
    required this.status,
    required this.totalCents,
    required this.currency,
    required this.customerNote,
    required this.createdAt,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      status: json['status'] as String,
      totalCents: (json['total_cents'] as num).toInt(),
      currency: (json['currency'] as String?) ?? 'USD',
      customerNote: json['customer_note'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  double get total => totalCents / 100.0;

  @override
  List<Object?> get props => [id, userId, status, totalCents, currency, customerNote, createdAt];
}


