import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../catalog/domain/product.dart';
import '../domain/cart_item.dart';

class CartState {
  final List<CartItem> items;

  const CartState({this.items = const []});

  int get totalCents => items.fold(0, (sum, i) => sum + i.priceCents * i.quantity);
  String get currency => items.isEmpty ? 'USD' : items.first.currency;
  bool get isEmpty => items.isEmpty;

  Map<String, dynamic> toJson() => {
        'items': items.map((e) => e.toJson()).toList(),
      };

  factory CartState.fromJson(Map<String, dynamic> json) {
    final raw = (json['items'] as List?) ?? const [];
    return CartState(
      items: raw.cast<Map>().map((m) => CartItem.fromJson(m.cast<String, dynamic>())).toList(),
    );
  }
}

/// AsyncNotifier pour éviter les crashes au démarrage (SharedPreferences async).
class CartController extends AsyncNotifier<CartState> {
  static const _storageKey = 'nexus_cart_v1';

  SharedPreferences? _prefs;

  @override
  Future<CartState> build() async {
    _prefs = await SharedPreferences.getInstance();
    final raw = _prefs!.getString(_storageKey);
    if (raw == null || raw.isEmpty) return const CartState();
    try {
      return CartState.fromJson(jsonDecode(raw) as Map<String, dynamic>);
    } catch (_) {
      return const CartState();
    }
  }

  Future<void> _save(CartState s) async {
    final prefs = _prefs ?? await SharedPreferences.getInstance();
    _prefs = prefs;
    await prefs.setString(_storageKey, jsonEncode(s.toJson()));
  }

  Future<void> clear() async {
    const next = CartState();
    state = const AsyncData(next);
    await _save(next);
  }

  Future<void> addProduct(Product p, {int qty = 1}) async {
    final current = state.value ?? const CartState();
    final idx = current.items.indexWhere((i) => i.productId == p.id);
    final items = [...current.items];
    if (idx >= 0) {
      items[idx] = items[idx].copyWith(quantity: items[idx].quantity + qty);
    } else {
      items.add(
        CartItem(
          productId: p.id,
          name: p.name,
          priceCents: p.priceCents,
          currency: p.currency,
          quantity: qty,
        ),
      );
    }
    final next = CartState(items: items);
    state = AsyncData(next);
    await _save(next);
  }

  Future<void> setQuantity(String productId, int quantity) async {
    final current = state.value ?? const CartState();
    final items = current.items
        .map((i) => i.productId == productId ? i.copyWith(quantity: quantity) : i)
        .where((i) => i.quantity > 0)
        .toList();
    final next = CartState(items: items);
    state = AsyncData(next);
    await _save(next);
  }

  Future<void> remove(String productId) async {
    final current = state.value ?? const CartState();
    final next = CartState(items: current.items.where((i) => i.productId != productId).toList());
    state = AsyncData(next);
    await _save(next);
  }
}


