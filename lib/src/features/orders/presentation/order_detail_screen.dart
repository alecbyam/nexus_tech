import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/app_scaffold.dart';
import '../application/orders_providers.dart';

class OrderDetailScreen extends ConsumerWidget {
  final String orderId;
  const OrderDetailScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final repo = ref.watch(ordersRepositoryProvider);
    final order = ref.watch(myOrdersProvider).maybeWhen(
          data: (list) => list.where((o) => o.id == orderId).firstOrNull,
          orElse: () => null,
        );
    final items = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
      return repo.fetchOrderItems(orderId);
    });

    return AppScaffold(
      title: 'Détail commande',
      child: ref.watch(items).when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text('Erreur: $e')),
            data: (rows) {
              if (rows.isEmpty) return const Center(child: Text('Aucun article.'));
              return ListView(
                children: [
                  if (order != null) ...[
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Statut: ${order.status}', style: const TextStyle(fontWeight: FontWeight.w900)),
                          const SizedBox(height: 6),
                          Text('Total: \$${order.total.toStringAsFixed(2)}'),
                          if ((order.customerNote ?? '').trim().isNotEmpty) ...[
                            const SizedBox(height: 6),
                            Text('Note: ${order.customerNote}'),
                          ],
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],
                  const Text('Articles', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
                  const SizedBox(height: 12),
                  for (final r in rows) ...[
                    _OrderItemTile(row: r),
                    const SizedBox(height: 12),
                  ],
                ],
              );
            },
          ),
    );
  }
}

class _OrderItemTile extends StatelessWidget {
  final Map<String, dynamic> row;
  const _OrderItemTile({required this.row});

  @override
  Widget build(BuildContext context) {
    final name = row['name_snapshot'] as String;
    final priceCents = (row['price_cents_snapshot'] as num).toInt();
    final qty = (row['quantity'] as num).toInt();
    final unit = (priceCents / 100.0).toStringAsFixed(2);
    final lineTotal = (priceCents * qty) / 100.0;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          const Icon(Icons.shopping_bag_outlined, color: AppColors.primary),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontWeight: FontWeight.w900)),
                const SizedBox(height: 4),
                Text('x$qty • \$${unit}', style: const TextStyle(color: AppColors.muted)),
              ],
            ),
          ),
          Text(
            '\$${lineTotal.toStringAsFixed(2)}',
            style: const TextStyle(fontWeight: FontWeight.w900),
          ),
        ],
      ),
    );
  }
}

extension _FirstOrNull<E> on Iterable<E> {
  E? get firstOrNull => isEmpty ? null : first;
}


