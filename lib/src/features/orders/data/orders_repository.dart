import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/errors/app_exception.dart';
import '../../cart/domain/cart_item.dart';
import '../domain/order.dart';

class OrdersRepository {
  final SupabaseClient _client;
  OrdersRepository(this._client);

  Future<List<Order>> fetchMyOrders() async {
    try {
      final rows = await _client.from('orders').select().order('created_at', ascending: false);
      return (rows as List).cast<Map<String, dynamic>>().map(Order.fromJson).toList();
    } on PostgrestException catch (e) {
      throw AppException(e.message, cause: e);
    }
  }

  Future<List<Order>> fetchAllOrdersAdmin() async {
    try {
      final rows = await _client.from('orders').select().order('created_at', ascending: false);
      return (rows as List).cast<Map<String, dynamic>>().map(Order.fromJson).toList();
    } on PostgrestException catch (e) {
      throw AppException(e.message, cause: e);
    }
  }

  Future<String> createOrder({
    required String userId,
    required String currency,
    required List<CartItem> items,
    String? customerNote,
  }) async {
    try {
      final orderRow = await _client
          .from('orders')
          .insert({
            'user_id': userId,
            'status': 'pending',
            'currency': currency,
            'customer_note': customerNote,
          })
          .select()
          .single();

      final orderId = (orderRow as Map)['id'] as String;

      final orderItems = items
          .map(
            (i) => {
              'order_id': orderId,
              'product_id': i.productId,
              'name_snapshot': i.name,
              'price_cents_snapshot': i.priceCents,
              'quantity': i.quantity,
            },
          )
          .toList();

      await _client.from('order_items').insert(orderItems);

      // total recalculé via trigger (order_items_changed)
      return orderId;
    } on PostgrestException catch (e) {
      throw AppException(e.message, cause: e);
    }
  }

  Future<void> updateOrderStatusAdmin(String orderId, String status) async {
    try {
      await _client.from('orders').update({'status': status}).eq('id', orderId);
    } on PostgrestException catch (e) {
      throw AppException(e.message, cause: e);
    }
  }

  Future<List<Map<String, dynamic>>> fetchOrderItems(String orderId) async {
    try {
      final rows = await _client
          .from('order_items')
          .select('id, name_snapshot, price_cents_snapshot, quantity, created_at')
          .eq('order_id', orderId)
          .order('created_at');
      return (rows as List).cast<Map<String, dynamic>>();
    } on PostgrestException catch (e) {
      throw AppException(e.message, cause: e);
    }
  }
}


