import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../application/catalog_providers.dart';
import '../domain/product.dart';
import '../../../core/routing/app_routes.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/app_scaffold.dart';
import '../../../core/widgets/app_error_view.dart';
import '../../../core/utils/responsive.dart';

class CatalogScreen extends ConsumerStatefulWidget {
  final String? category;
  const CatalogScreen({super.key, this.category});

  @override
  ConsumerState<CatalogScreen> createState() => _CatalogScreenState();
}

class _CatalogScreenState extends ConsumerState<CatalogScreen> {
  final _controller = TextEditingController();
  String _query = '';

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.category == null ? 'Catalogue' : 'Catalogue — ${widget.category}';
    final products = ref.watch(productsProvider(ProductQuery(categoryKey: widget.category, q: _query)));

    return AppScaffold(
      title: title,
      actions: [
        IconButton(
          tooltip: 'Panier',
          onPressed: () => context.push(AppRoutes.cart),
          icon: const Icon(Icons.shopping_cart_outlined),
        ),
      ],
      child: Column(
        children: [
          TextField(
            controller: _controller,
            textInputAction: TextInputAction.search,
            onChanged: (v) => setState(() => _query = v.trim()),
            decoration: const InputDecoration(
              prefixIcon: Icon(Icons.search),
              hintText: 'Rechercher… (optimisé low-bandwidth)',
            ),
          ),
          SizedBox(height: Responsive.spacing(context, mobile: 14, tablet: 16)),
          Expanded(
            child: products.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => AppErrorView(
                error: e,
                onRetry: () => ref.invalidate(productsProvider(ProductQuery(categoryKey: widget.category, q: _query))),
              ),
              data: (items) {
                if (items.isEmpty) {
                  return Center(
                    child: Text(
                      'Aucun produit.',
                      style: TextStyle(fontSize: Responsive.fontSize(context, mobile: 16)),
                    ),
                  );
                }
                return ListView.separated(
                  itemCount: items.length,
                  separatorBuilder: (_, __) => SizedBox(height: Responsive.spacing(context, mobile: 12, tablet: 16)),
                  itemBuilder: (context, index) => _ProductTile(product: items[index]),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _ProductTile extends StatelessWidget {
  final Product product;
  const _ProductTile({required this.product});

  @override
  Widget build(BuildContext context) {
    final subtitle = product.condition == 'refurbished' || product.isRefurbished ? 'Reconditionné' : 'Neuf';
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () => context.push('${AppRoutes.product}?id=${product.id}'),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.border),
              ),
              child: const Icon(Icons.image_outlined, color: AppColors.muted),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product.name, style: const TextStyle(fontWeight: FontWeight.w800)),
                  const SizedBox(height: 4),
                  Text(subtitle, style: const TextStyle(color: AppColors.muted)),
                  const SizedBox(height: 6),
                  Text(
                    '\$${product.price.toStringAsFixed(2)}',
                    style: const TextStyle(fontWeight: FontWeight.w900, color: AppColors.primary),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: AppColors.muted),
          ],
        ),
      ),
    );
  }
}


