import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../application/catalog_providers.dart';
import '../../../core/routing/app_routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/app_scaffold.dart';
import '../../../core/widgets/app_error_view.dart';
import '../../../core/utils/responsive.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categories = ref.watch(categoriesProvider);
    return AppScaffold(
      title: 'NEXUS TECH',
      actions: [
        IconButton(
          tooltip: 'Panier',
          onPressed: () => context.push(AppRoutes.cart),
          icon: const Icon(Icons.shopping_cart_outlined),
        ),
        IconButton(
          tooltip: 'Profil',
          onPressed: () => context.push(AppRoutes.profile),
          icon: const Icon(Icons.person_outline),
        ),
      ],
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _SearchBar(
            onTap: () => context.push(AppRoutes.catalog),
          ),
          SizedBox(height: Responsive.spacing(context, mobile: 16, tablet: 20)),
          Text(
            'Catégories',
            style: TextStyle(
              fontSize: Responsive.fontSize(context, mobile: 20, tablet: 22, desktop: 24),
              fontWeight: FontWeight.w700,
            ),
          ),
          SizedBox(height: Responsive.spacing(context, mobile: 12, tablet: 16)),
          Expanded(
            child: categories.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => AppErrorView(error: e, onRetry: () => ref.invalidate(categoriesProvider)),
              data: (items) {
                // fallback si pas de seed
                final list = items.isEmpty
                    ? const [
                        ('Téléphones', Icons.phone_iphone, 'Phones'),
                        ('Ordinateurs', Icons.computer, 'Computers'),
                        ('Accessoires', Icons.headphones, 'Accessories'),
                        ('Services', Icons.build_circle_outlined, 'Services'),
                      ]
                    : items
                        .map((c) => (c.name, _iconForCategory(c.key), c.key))
                        .toList(growable: false);

                final columns = Responsive.gridColumns(context);
                return GridView.count(
                  crossAxisCount: columns,
                  mainAxisSpacing: Responsive.spacing(context, mobile: 12, tablet: 16, desktop: 20),
                  crossAxisSpacing: Responsive.spacing(context, mobile: 12, tablet: 16, desktop: 20),
                  childAspectRatio: Responsive.isMobile(context) ? 1.1 : 1.2,
                  children: [
                    for (final item in list)
                      _CategoryCard(title: item.$1, icon: item.$2, categoryKey: item.$3),
                  ],
                );
              },
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: () => context.push(AppRoutes.admin),
            icon: const Icon(Icons.admin_panel_settings_outlined),
            label: const Text('Admin'),
          ),
        ],
      ),
    );
  }
}

IconData _iconForCategory(String key) {
  switch (key) {
    case 'Phones':
      return Icons.phone_iphone;
    case 'Computers':
      return Icons.computer;
    case 'Accessories':
      return Icons.headphones;
    case 'Wearables':
      return Icons.watch;
    case 'Cameras':
      return Icons.videocam_outlined;
    case 'Storage':
      return Icons.sd_storage_outlined;
    case 'Electronics':
      return Icons.electrical_services_outlined;
    case 'Services':
      return Icons.build_circle_outlined;
    default:
      return Icons.category_outlined;
  }
}

class _SearchBar extends StatelessWidget {
  final VoidCallback onTap;
  const _SearchBar({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.border),
        ),
        child: const Row(
          children: [
            Icon(Icons.search, color: AppColors.muted),
            SizedBox(width: 10),
            Expanded(
              child: Text(
                'Rechercher un produit, service…',
                style: TextStyle(color: AppColors.muted, fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CategoryCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final String categoryKey;
  const _CategoryCard({
    required this.title,
    required this.icon,
    required this.categoryKey,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () => context.push('${AppRoutes.catalog}?category=$categoryKey'),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 34, color: AppColors.primary),
            const SizedBox(height: 10),
            Text(title, style: const TextStyle(fontWeight: FontWeight.w800)),
          ],
        ),
      ),
    );
  }
}


