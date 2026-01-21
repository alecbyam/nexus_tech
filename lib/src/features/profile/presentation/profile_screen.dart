import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/providers/supabase_providers.dart';
import '../../../core/routing/app_routes.dart';
import '../../../core/widgets/app_scaffold.dart';
import '../application/profile_providers.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(userProvider);
    final profile = ref.watch(myProfileProvider);

    return AppScaffold(
      title: 'Profil',
      actions: [
        IconButton(
          tooltip: 'Commandes',
          onPressed: () => context.push(AppRoutes.orders),
          icon: const Icon(Icons.receipt_long_outlined),
        ),
      ],
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Compte', style: TextStyle(fontWeight: FontWeight.w900)),
                  const SizedBox(height: 8),
                  Text(user?.email ?? 'Email: —'),
                  const SizedBox(height: 4),
                  profile.when(
                    loading: () => const Text('Téléphone: …'),
                    error: (_, __) => Text(user?.phone ?? 'Téléphone: —'),
                    data: (p) => Text(p.phone?.isNotEmpty == true ? 'Téléphone: ${p.phone}' : (user?.phone ?? 'Téléphone: —')),
                  ),
                  const SizedBox(height: 6),
                  profile.when(
                    loading: () => const Text('Rôle: …'),
                    error: (_, __) => const Text('Rôle: —'),
                    data: (p) => Text('Rôle: ${p.isAdmin ? 'Admin' : 'Client'}'),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: () => context.push(AppRoutes.orders),
            icon: const Icon(Icons.receipt_long_outlined),
            label: const Text('Historique des commandes'),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: () async {
              await ref.read(supabaseClientProvider).auth.signOut();
              if (context.mounted) context.go(AppRoutes.home);
            },
            icon: const Icon(Icons.logout),
            label: const Text('Se déconnecter'),
          ),
        ],
      ),
    );
  }
}


