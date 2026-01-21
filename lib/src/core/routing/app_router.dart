import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/admin/presentation/admin_home_screen.dart';
import '../../features/admin/presentation/admin_orders_screen.dart';
import '../../features/admin/presentation/admin_product_edit_screen.dart';
import '../../features/admin/presentation/admin_products_screen.dart';
import '../../features/auth/presentation/auth_screen.dart';
import '../../features/cart/presentation/cart_screen.dart';
import '../../features/catalog/presentation/catalog_screen.dart';
import '../../features/catalog/presentation/home_screen.dart';
import '../../features/catalog/presentation/product_detail_screen.dart';
import '../../features/orders/presentation/orders_screen.dart';
import '../../features/orders/presentation/order_detail_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../providers/supabase_providers.dart';
import 'app_routes.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  // Réagit aux changements d'auth pour refresh les redirections.
  final auth = ref.watch(authStateChangesProvider);

  return GoRouter(
    initialLocation: AppRoutes.home,
    refreshListenable: GoRouterRefreshStream(
      auth.when(
        data: (d) => Stream.value(d),
        error: (_, __) => const Stream.empty(),
        loading: () => const Stream.empty(),
      ),
    ),
    redirect: (context, state) {
      final session = ref.read(sessionProvider);
      final isAuthed = session != null;
      final goingAuth = state.matchedLocation == AppRoutes.auth;

      // Pages qui nécessitent un compte
      final needsAuth = state.matchedLocation == AppRoutes.profile ||
          state.matchedLocation == AppRoutes.orders ||
          state.matchedLocation == AppRoutes.cart ||
          state.matchedLocation.startsWith(AppRoutes.admin);

      if (!isAuthed && needsAuth) return AppRoutes.auth;
      if (isAuthed && goingAuth) return AppRoutes.home;
      return null;
    },
    routes: [
      GoRoute(
        path: AppRoutes.home,
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: AppRoutes.catalog,
        builder: (context, state) {
          final category = state.uri.queryParameters['category'];
          return CatalogScreen(category: category);
        },
      ),
      GoRoute(
        path: AppRoutes.product,
        builder: (context, state) {
          final id = state.uri.queryParameters['id'];
          return ProductDetailScreen(productId: id);
        },
      ),
      GoRoute(
        path: AppRoutes.cart,
        builder: (context, state) => const CartScreen(),
      ),
      GoRoute(
        path: AppRoutes.auth,
        builder: (context, state) => const AuthScreen(),
      ),
      GoRoute(
        path: AppRoutes.profile,
        builder: (context, state) => const ProfileScreen(),
      ),
      GoRoute(
        path: AppRoutes.orders,
        builder: (context, state) => const OrdersScreen(),
      ),
      GoRoute(
        path: AppRoutes.orderDetail,
        builder: (context, state) {
          final id = state.uri.queryParameters['id'];
          if (id == null || id.isEmpty) {
            return const Scaffold(body: Center(child: Text('Commande introuvable')));
          }
          return OrderDetailScreen(orderId: id);
        },
      ),
      GoRoute(
        path: AppRoutes.admin,
        builder: (context, state) => const AdminHomeScreen(),
        routes: [
          GoRoute(
            path: 'products',
            builder: (context, state) => const AdminProductsScreen(),
            routes: [
              GoRoute(
                path: 'edit',
                builder: (context, state) {
                  final id = state.uri.queryParameters['id'];
                  return AdminProductEditScreen(productId: id);
                },
              ),
            ],
          ),
          GoRoute(
            path: 'orders',
            builder: (context, state) => const AdminOrdersScreen(),
          ),
        ],
      ),
    ],
    errorBuilder: (context, state) {
      return Scaffold(
        appBar: AppBar(title: const Text('Erreur')),
        body: Padding(
          padding: const EdgeInsets.all(16),
          child: Text(state.error?.toString() ?? 'Erreur inconnue'),
        ),
      );
    },
  );
});

/// Petit helper officiel GoRouter : force refresh via Stream.
class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<dynamic> stream) {
    _subscription = stream.asBroadcastStream().listen((_) => notifyListeners());
  }

  late final StreamSubscription<dynamic> _subscription;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}


