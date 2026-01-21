import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/config/app_env.dart';
import '../../../core/routing/app_routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/app_scaffold.dart';
import '../../../core/widgets/primary_button.dart';
import '../application/catalog_providers.dart';
import '../../cart/application/cart_providers.dart';

class ProductDetailScreen extends ConsumerWidget {
  final String? productId;
  const ProductDetailScreen({super.key, required this.productId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final id = productId;
    if (id == null || id.isEmpty) {
      return const AppScaffold(
        title: 'Détail produit',
        child: Center(child: Text('Produit introuvable.')),
      );
    }
    final product = ref.watch(productProvider(id));
    final images = ref.watch(productImagesProvider(id));
    final repo = ref.watch(catalogRepositoryProvider);

    return AppScaffold(
      title: 'Détail produit',
      actions: [
        IconButton(
          tooltip: 'Panier',
          onPressed: () => context.push(AppRoutes.cart),
          icon: const Icon(Icons.shopping_cart_outlined),
        ),
      ],
      child: product.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erreur: $e')),
        data: (p) {
          final isRefurb = p.condition == 'refurbished' || p.isRefurbished;
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              images.when(
                loading: () => _ImageBox(child: const Center(child: CircularProgressIndicator())),
                error: (e, _) => _ImageBox(child: Center(child: Text('Images: $e'))),
                data: (imgs) {
                  final primary = imgs.where((i) => i.isPrimary).toList();
                  final first = (primary.isNotEmpty ? primary.first : (imgs.isNotEmpty ? imgs.first : null));
                  if (first == null) {
                    return const _ImageBox(
                      child: Center(child: Icon(Icons.image_outlined, size: 64, color: AppColors.muted)),
                    );
                  }
                  final url = repo.publicImageUrl(first.storagePath);
                  return _ImageBox(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: Image.network(url, fit: BoxFit.cover),
                    ),
                  );
                },
              ),
              const SizedBox(height: 14),
              Text(p.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
              const SizedBox(height: 6),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Text(
                      isRefurb ? 'Reconditionné' : 'Neuf',
                      style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.muted),
                    ),
                  ),
                  const Spacer(),
                  Text(
                    '\$${p.price.toStringAsFixed(2)}',
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.primary),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                p.description?.trim().isNotEmpty == true
                    ? p.description!.trim()
                    : 'Description courte (optimisée): infos essentielles, poids léger.',
                style: const TextStyle(color: AppColors.muted, height: 1.35),
              ),
              const Spacer(),
              PrimaryButton(
                text: 'Ajouter au panier',
                onPressed: () {
                  ref.read(cartControllerProvider.notifier).addProduct(p);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Ajouté au panier.')),
                  );
                },
              ),
              const SizedBox(height: 10),
              OutlinedButton.icon(
                onPressed: () => _openWhatsAppOrder(context, p.name, p.price),
                icon: const Icon(Icons.chat_outlined),
                label: const Text('Commander via WhatsApp'),
              ),
            ],
          );
        },
      ),
    );
  }

  Future<void> _openWhatsAppOrder(BuildContext context, String productName, double price) async {
    // On récupère le numéro depuis l'env chargé au démarrage via AppEnv.
    // Ici on le re-lit via dotenv pour éviter un global; on améliorera en provider.
    final env = AppEnv.fromDotEnv();
    final message = Uri.encodeComponent(
      'Bonjour NEXUS TECH, je veux commander: $productName (prix: \$${price.toStringAsFixed(2)}).',
    );
    final url = Uri.parse('https://wa.me/${env.whatsappPhone}?text=$message');

    final ok = await launchUrl(url, mode: LaunchMode.externalApplication);
    if (!ok && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Impossible d’ouvrir WhatsApp.')),
      );
    }
  }
}

class _ImageBox extends StatelessWidget {
  final Widget child;
  const _ImageBox({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 180,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      clipBehavior: Clip.antiAlias,
      child: child,
    );
  }
}


