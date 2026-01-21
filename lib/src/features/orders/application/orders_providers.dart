import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/providers/supabase_providers.dart';
import '../../cart/domain/cart_item.dart';
import '../data/orders_repository.dart';
import '../domain/order.dart';

final ordersRepositoryProvider = Provider<OrdersRepository>((ref) {
  final client = ref.watch(supabaseClientProvider);
  return OrdersRepository(client);
});

final myOrdersProvider = FutureProvider<List<Order>>((ref) async {
  return ref.watch(ordersRepositoryProvider).fetchMyOrders();
});

final adminOrdersProvider = FutureProvider<List<Order>>((ref) async {
  return ref.watch(ordersRepositoryProvider).fetchAllOrdersAdmin();
});

class CheckoutState {
  final bool loading;
  final String? error;
  final String? orderId;

  const CheckoutState({this.loading = false, this.error, this.orderId});

  CheckoutState copyWith({bool? loading, String? error, String? orderId}) {
    return CheckoutState(
      loading: loading ?? this.loading,
      error: error,
      orderId: orderId ?? this.orderId,
    );
  }
}

class CheckoutController extends StateNotifier<CheckoutState> {
  final OrdersRepository _repo;
  final String _userId;

  CheckoutController(this._repo, this._userId) : super(const CheckoutState());

  Future<String?> checkout({
    required String currency,
    required List<CartItem> items,
    String? note,
  }) async {
    state = state.copyWith(loading: true, error: null, orderId: null);
    try {
      final id = await _repo.createOrder(userId: _userId, currency: currency, items: items, customerNote: note);
      state = state.copyWith(loading: false, orderId: id);
      return id;
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
      return null;
    }
  }
}

final checkoutControllerProvider = StateNotifierProvider<CheckoutController, CheckoutState>((ref) {
  final user = ref.watch(userProvider);
  if (user == null) throw StateError('Utilisateur non connecté');
  final repo = ref.watch(ordersRepositoryProvider);
  return CheckoutController(repo, user.id);
});


