import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/routing/app_routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/app_scaffold.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../core/config/app_env.dart';
import '../../../core/utils/whatsapp_order_message.dart';
import '../application/cart_providers.dart';
import '../../orders/application/orders_providers.dart';
import '../../../core/providers/supabase_providers.dart';

class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartAsync = ref.watch(cartControllerProvider);
    final checkout = ref.watch(checkoutControllerProvider);
    final user = ref.watch(userProvider);
    return AppScaffold(
      title: 'Panier',
      actions: [
        IconButton(
          tooltip: 'Profil',
          onPressed: () => context.push(AppRoutes.profile),
          icon: const Icon(Icons.person_outline),
        ),
      ],
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Articles',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: cartAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Erreur panier: $e')),
              data: (cart) {
                if (cart.isEmpty) return const Center(child: Text('Panier vide.'));
                return ListView.separated(
                  itemCount: cart.items.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final item = cart.items[index];
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
                                Text(item.name, style: const TextStyle(fontWeight: FontWeight.w900)),
                                const SizedBox(height: 4),
                                Text(
                                  '\$${(item.priceCents / 100).toStringAsFixed(2)} • ${item.currency}',
                                  style: const TextStyle(color: AppColors.muted),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            tooltip: 'Moins',
                            onPressed: () => ref
                                .read(cartControllerProvider.notifier)
                                .setQuantity(item.productId, item.quantity - 1),
                            icon: const Icon(Icons.remove_circle_outline),
                          ),
                          Text('${item.quantity}', style: const TextStyle(fontWeight: FontWeight.w900)),
                          IconButton(
                            tooltip: 'Plus',
                            onPressed: () => ref
                                .read(cartControllerProvider.notifier)
                                .setQuantity(item.productId, item.quantity + 1),
                            icon: const Icon(Icons.add_circle_outline),
                          ),
                          IconButton(
                            tooltip: 'Supprimer',
                            onPressed: () => ref.read(cartControllerProvider.notifier).remove(item.productId),
                            icon: const Icon(Icons.delete_outline),
                          ),
                        ],
                      ),
                    );
                  },
                );
              },
            ),
          ),
          const SizedBox(height: 12),
          cartAsync.when(
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
            data: (cart) => Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  const Text('Total', style: TextStyle(fontWeight: FontWeight.w900)),
                  const Spacer(),
                  Text(
                    '\$${(cart.totalCents / 100).toStringAsFixed(2)}',
                    style: const TextStyle(fontWeight: FontWeight.w900, color: AppColors.primary),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          cartAsync.when(
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
            data: (cart) => PrimaryButton(
              text: 'Commander via WhatsApp',
              isLoading: checkout.loading,
              onPressed: cart.isEmpty
                  ? null
                  : () async {
                      final note = await _askNote(context);
                      final id = await ref.read(checkoutControllerProvider.notifier).checkout(
                            currency: cart.currency,
                            items: cart.items,
                            note: note == null || note.trim().isEmpty ? null : '[WHATSAPP] ${note.trim()}',
                          );
                      if (id != null && context.mounted) {
                        final message = WhatsAppOrderMessage.build(
                          storeName: 'NEXUS TECH',
                          orderId: id,
                          currency: cart.currency,
                          items: cart.items,
                          totalCents: cart.totalCents,
                          customerEmail: user?.email,
                          customerPhone: user?.phone,
                          note: note,
                        );
                        await _openWhatsApp(message);
                        await ref.read(cartControllerProvider.notifier).clear();
                        ref.invalidate(myOrdersProvider);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Commande créée: $id')),
                        );
                        context.push(AppRoutes.orders);
                      } else if (checkout.error != null && context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(checkout.error!)),
                        );
                      }
                    },
            ),
          ),
          const SizedBox(height: 10),
          cartAsync.when(
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
            data: (cart) => OutlinedButton.icon(
              onPressed: cart.isEmpty || checkout.loading
                  ? null
                  : () async {
                      final id = await ref.read(checkoutControllerProvider.notifier).checkout(
                            currency: cart.currency,
                            items: cart.items,
                          );
                      if (id != null && context.mounted) {
                        await ref.read(cartControllerProvider.notifier).clear();
                        ref.invalidate(myOrdersProvider);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Commande créée: $id')),
                        );
                        context.push(AppRoutes.orders);
                      } else if (checkout.error != null && context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(checkout.error!)),
                        );
                      }
                    },
              icon: const Icon(Icons.receipt_long_outlined),
              label: const Text('Créer commande (sans WhatsApp)'),
            ),
          ),
        ],
      ),
    );
  }
}

Future<void> _openWhatsApp(String message) async {
  final env = AppEnv.fromDotEnv();
  final encoded = Uri.encodeComponent(message);
  final url = Uri.parse('https://wa.me/${env.whatsappPhone}?text=$encoded');
  await launchUrl(url, mode: LaunchMode.externalApplication);
}

Future<String?> _askNote(BuildContext context) async {
  final controller = TextEditingController();
  final res = await showDialog<String?>(
    context: context,
    builder: (context) {
      return AlertDialog(
        title: const Text('Note (optionnel)'),
        content: TextField(
          controller: controller,
          minLines: 1,
          maxLines: 3,
          decoration: const InputDecoration(
            hintText: 'Ex: Adresse de livraison, quartier, détails…',
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, null), child: const Text('Annuler')),
          ElevatedButton(onPressed: () => Navigator.pop(context, controller.text), child: const Text('OK')),
        ],
      );
    },
  );
  controller.dispose();
  return res;
}


