import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/routing/app_routes.dart';
import '../../../core/widgets/app_scaffold.dart';
import '../../profile/application/profile_providers.dart';

class AdminHomeScreen extends ConsumerWidget {
  const AdminHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isAdmin = ref.watch(isAdminProvider);
    return AppScaffold(
      title: 'Admin',
      child: isAdmin.when(
        data: (ok) {
          if (!ok) {
            return const Center(
              child: Text('Accès refusé. Votre compte n’est pas admin.'),
            );
          }
          return ListView(
            children: [
              const Text(
                'Dashboard',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 12),
              _AdminTile(
                icon: Icons.inventory_2_outlined,
                title: 'Produits',
                subtitle: 'Ajouter / modifier / supprimer + stock + prix + état (neuf/reconditionné)',
                onTap: () => context.push(AppRoutes.adminProducts),
              ),
              const SizedBox(height: 12),
              _AdminTile(
                icon: Icons.receipt_long_outlined,
                title: 'Commandes',
                subtitle: 'Voir / mettre à jour le statut',
                onTap: () => context.push(AppRoutes.adminOrders),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erreur: $e')),
      ),
    );
  }
}

class _AdminTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _AdminTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Icon(icon),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w900)),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}


