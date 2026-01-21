import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/app_scaffold.dart';
import '../../orders/application/orders_providers.dart';
import '../../profile/application/profile_providers.dart';

class AdminOrdersScreen extends ConsumerWidget {
  const AdminOrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isAdmin = ref.watch(isAdminProvider);
    final orders = ref.watch(adminOrdersProvider);
    final repo = ref.watch(ordersRepositoryProvider);

    return AppScaffold(
      title: 'Admin — Commandes',
      child: isAdmin.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erreur: $e')),
        data: (ok) {
          if (!ok) return const Center(child: Text('Accès refusé.'));
          return orders.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => Center(child: Text('Erreur: $e')),
            data: (items) {
              if (items.isEmpty) return const Center(child: Text('Aucune commande.'));
              return ListView.separated(
                itemCount: items.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, i) {
                  final o = items[i];
                  return Container(
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
                        Text('User: ${o.userId}', style: const TextStyle(color: AppColors.muted)),
                        const SizedBox(height: 6),
                        Text(
                          'Total: \$${o.total.toStringAsFixed(2)}',
                          style: const TextStyle(fontWeight: FontWeight.w900),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            const Text('Statut:', style: TextStyle(fontWeight: FontWeight.w900)),
                            const SizedBox(width: 10),
                            Expanded(
                              child: DropdownButtonFormField<String>(
                                value: o.status,
                                items: const [
                                  DropdownMenuItem(value: 'pending', child: Text('pending')),
                                  DropdownMenuItem(value: 'confirmed', child: Text('confirmed')),
                                  DropdownMenuItem(value: 'shipped', child: Text('shipped')),
                                  DropdownMenuItem(value: 'delivered', child: Text('delivered')),
                                  DropdownMenuItem(value: 'cancelled', child: Text('cancelled')),
                                ],
                                onChanged: (v) async {
                                  if (v == null || v == o.status) return;
                                  try {
                                    await repo.updateOrderStatusAdmin(o.id, v);
                                    ref.invalidate(adminOrdersProvider);
                                    if (context.mounted) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(content: Text('Statut mis à jour.')),
                                      );
                                    }
                                  } catch (e) {
                                    if (context.mounted) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(content: Text('Erreur: $e')),
                                      );
                                    }
                                  }
                                },
                                decoration: const InputDecoration(isDense: true),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              );
            },
          );
        },
      ),
    );
  }
}


