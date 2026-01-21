import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/routing/app_routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/app_scaffold.dart';
import '../../catalog/domain/product.dart';
import '../application/admin_providers.dart';
import '../../profile/application/profile_providers.dart';

class AdminProductsScreen extends ConsumerWidget {
  const AdminProductsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isAdmin = ref.watch(isAdminProvider);
    final products = ref.watch(adminProductsProvider);

    return AppScaffold(
      title: 'Admin — Produits',
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push(AppRoutes.adminProducts + '/edit'),
        icon: const Icon(Icons.add),
        label: const Text('Ajouter'),
      ),
      child: isAdmin.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erreur: $e')),
        data: (ok) {
          if (!ok) return const Center(child: Text('Accès refusé.'));
          return products.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text('Erreur: $e')),
            data: (items) {
              if (items.isEmpty) return const Center(child: Text('Aucun produit.'));
              return ListView.separated(
                itemCount: items.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, i) => _AdminProductTile(product: items[i]),
              );
            },
          );
        },
      ),
    );
  }
}

class _AdminProductTile extends StatelessWidget {
  final Product product;
  const _AdminProductTile({required this.product});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          const Icon(Icons.inventory_2_outlined, color: AppColors.primary),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(product.name, style: const TextStyle(fontWeight: FontWeight.w900)),
                const SizedBox(height: 4),
                Text(
                  'Stock: ${product.stock} • \$${product.price.toStringAsFixed(2)} • ${product.isActive ? 'Actif' : 'Inactif'}',
                  style: const TextStyle(color: AppColors.muted),
                ),
              ],
            ),
          ),
          IconButton(
            tooltip: 'Modifier',
            onPressed: () => context.push('${AppRoutes.adminProducts}/edit?id=${product.id}'),
            icon: const Icon(Icons.edit_outlined),
          ),
        ],
      ),
    );
  }
}


