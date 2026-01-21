import 'dart:typed_data';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/app_scaffold.dart';
import '../../../core/widgets/primary_button.dart';
import '../../catalog/application/catalog_providers.dart';
import '../../catalog/domain/product.dart';
import '../application/admin_providers.dart';

class AdminProductEditScreen extends ConsumerStatefulWidget {
  final String? productId;
  const AdminProductEditScreen({super.key, this.productId});

  @override
  ConsumerState<AdminProductEditScreen> createState() => _AdminProductEditScreenState();
}

class _AdminProductEditScreenState extends ConsumerState<AdminProductEditScreen> {
  final _name = TextEditingController();
  final _sku = TextEditingController();
  final _desc = TextEditingController();
  final _price = TextEditingController();
  final _stock = TextEditingController(text: '0');
  bool _isRefurb = false;
  bool _isActive = true;
  String? _categoryId;
  bool _saving = false;

  Uint8List? _pickedBytes;
  String? _pickedName;
  String? _pickedMime;

  @override
  void dispose() {
    _name.dispose();
    _sku.dispose();
    _desc.dispose();
    _price.dispose();
    _stock.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final categories = ref.watch(adminCategoriesProvider);
    final repo = ref.watch(adminProductRepositoryProvider);
    final catalogRepo = ref.watch(catalogRepositoryProvider);
    final productId = widget.productId;
    final productAsync = productId == null ? null : ref.watch(productProvider(productId));

    return AppScaffold(
      title: productId == null ? 'Admin — Ajouter produit' : 'Admin — Modifier produit',
      child: categories.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erreur catégories: $e')),
        data: (cats) {
          return productAsync?.when(
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (e, _) => Center(child: Text('Erreur produit: $e')),
                data: (p) => _buildForm(context, repo, cats, catalogRepo, product: p),
              ) ??
              _buildForm(context, repo, cats, catalogRepo);
        },
      ),
    );
  }

  Widget _buildForm(
    BuildContext context,
    dynamic repo,
    List cats,
    dynamic catalogRepo, {
    Product? product,
  }) {
    if (product != null && _name.text.isEmpty) {
      // init une seule fois
      _name.text = product.name;
      _sku.text = product.sku ?? '';
      _desc.text = product.description ?? '';
      _price.text = (product.priceCents / 100).toStringAsFixed(2);
      _stock.text = product.stock.toString();
      _isRefurb = product.isRefurbished || product.condition == 'refurbished';
      _isActive = product.isActive;
      _categoryId = product.categoryId;
    }

    return ListView(
      children: [
        const Text('Infos produit', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(
          value: _categoryId,
          items: [
            for (final c in cats)
              DropdownMenuItem<String>(
                value: c.id as String,
                child: Text(c.name as String),
              ),
          ],
          onChanged: (v) => setState(() => _categoryId = v),
          decoration: const InputDecoration(labelText: 'Catégorie'),
        ),
        const SizedBox(height: 12),
        TextField(controller: _name, decoration: const InputDecoration(labelText: 'Nom')),
        const SizedBox(height: 12),
        TextField(controller: _sku, decoration: const InputDecoration(labelText: 'SKU (optionnel)')),
        const SizedBox(height: 12),
        TextField(
          controller: _desc,
          maxLines: 3,
          decoration: const InputDecoration(labelText: 'Description (optionnel)'),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: _price,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(labelText: 'Prix (USD)'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: TextField(
                controller: _stock,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Stock'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        SwitchListTile(
          value: _isRefurb,
          onChanged: (v) => setState(() => _isRefurb = v),
          title: const Text('Reconditionné'),
        ),
        SwitchListTile(
          value: _isActive,
          onChanged: (v) => setState(() => _isActive = v),
          title: const Text('Actif (visible dans le shop)'),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('Image', style: TextStyle(fontWeight: FontWeight.w900)),
              const SizedBox(height: 8),
              if (_pickedBytes != null)
                SizedBox(height: 120, child: Image.memory(_pickedBytes!, fit: BoxFit.cover))
              else
                const SizedBox(
                  height: 120,
                  child: Center(child: Icon(Icons.image_outlined, size: 44, color: AppColors.muted)),
                ),
              const SizedBox(height: 10),
              OutlinedButton.icon(
                onPressed: _saving ? null : _pickImage,
                icon: const Icon(Icons.upload_outlined),
                label: Text(_pickedBytes == null ? 'Choisir une image' : 'Changer image'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        PrimaryButton(
          text: 'Enregistrer',
          isLoading: _saving,
          onPressed: _saving
              ? null
              : () async {
                  final catId = _categoryId;
                  if (catId == null) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Choisissez une catégorie.')),
                    );
                    return;
                  }
                  final name = _name.text.trim();
                  if (name.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Nom obligatoire.')),
                    );
                    return;
                  }
                  final priceDouble = double.tryParse(_price.text.trim().replaceAll(',', '.')) ?? 0;
                  final priceCents = (priceDouble * 100).round();
                  final stock = int.tryParse(_stock.text.trim()) ?? 0;
                  setState(() => _saving = true);
                  try {
                    String id;
                    if (product == null) {
                      final created = await repo.createProduct(
                        categoryId: catId,
                        name: name,
                        priceCents: priceCents,
                        currency: 'USD',
                        stock: stock,
                        isRefurbished: _isRefurb,
                        isActive: _isActive,
                        description: _desc.text.trim().isEmpty ? null : _desc.text.trim(),
                        sku: _sku.text.trim().isEmpty ? null : _sku.text.trim(),
                      );
                      id = created.id;
                    } else {
                      id = product.id;
                      await repo.updateProduct(id, {
                        'category_id': catId,
                        'name': name,
                        'sku': _sku.text.trim().isEmpty ? null : _sku.text.trim(),
                        'description': _desc.text.trim().isEmpty ? null : _desc.text.trim(),
                        'price_cents': priceCents,
                        'currency': 'USD',
                        'stock': stock,
                        'is_refurbished': _isRefurb,
                        'condition': _isRefurb ? 'refurbished' : 'new',
                        'is_active': _isActive,
                      });
                    }

                    if (_pickedBytes != null && _pickedName != null && _pickedMime != null) {
                      final path = await repo.uploadProductImage(
                        productId: id,
                        bytes: _pickedBytes!,
                        filename: _pickedName!,
                        contentType: _pickedMime!,
                      );
                      await repo.attachProductImage(productId: id, storagePath: path, isPrimary: true);
                    }

                    // refresh
                    ref.invalidate(adminProductsProvider);
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Enregistré.')),
                      );
                      context.pop();
                    }
                  } catch (e) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Erreur: $e')),
                      );
                    }
                  } finally {
                    if (mounted) setState(() => _saving = false);
                  }
                },
        ),
        const SizedBox(height: 12),
        if (product != null)
          OutlinedButton.icon(
            onPressed: _saving
                ? null
                : () async {
                    setState(() => _saving = true);
                    try {
                      await repo.deleteProduct(product.id);
                      ref.invalidate(adminProductsProvider);
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Supprimé.')),
                        );
                        context.pop();
                      }
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Erreur: $e')),
                        );
                      }
                    } finally {
                      if (mounted) setState(() => _saving = false);
                    }
                  },
            icon: const Icon(Icons.delete_outline),
            label: const Text('Supprimer'),
          ),
      ],
    );
  }

  Future<void> _pickImage() async {
    final res = await FilePicker.platform.pickFiles(
      type: FileType.image,
      withData: true,
    );
    final file = res?.files.single;
    if (file == null || file.bytes == null) return;
    setState(() {
      _pickedBytes = file.bytes!;
      _pickedName = file.name;
      _pickedMime = file.mimeType ?? 'image/jpeg';
    });
  }
}


