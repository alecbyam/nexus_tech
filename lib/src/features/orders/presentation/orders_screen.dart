import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/app_scaffold.dart';
import '../../../core/routing/app_routes.dart';
import '../application/orders_providers.dart';

class OrdersScreen extends ConsumerWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orders = ref.watch(myOrdersProvider);
    return AppScaffold(
      title: 'Mes commandes',
      child: orders.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erreur: $e')),
        data: (items) {
          if (items.isEmpty) return const Center(child: Text('Aucune commande.'));
          return ListView.separated(
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final o = items[index];
              return InkWell(
                borderRadius: BorderRadius.circular(16),
                onTap: () => context.push('${AppRoutes.orderDetail}?id=${o.id}'),
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Commande ${o.id}', style: const TextStyle(fontWeight: FontWeight.w900)),
                      const SizedBox(height: 6),
                      Text('Statut: ${o.status}', style: const TextStyle(color: AppColors.muted)),
                      const SizedBox(height: 6),
                      Text(
                        'Total: \$${o.total.toStringAsFixed(2)}',
                        style: const TextStyle(fontWeight: FontWeight.w900),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}


