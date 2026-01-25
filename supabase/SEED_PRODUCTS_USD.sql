-- Script d'ajout de produits de test en USD
-- Instructions: Exécuter ce script dans Supabase SQL Editor après la migration complète

-- D'abord, vérifier et créer des catégories si elles n'existent pas
-- Note: La table categories n'a pas de colonne "key", on utilise "slug" comme identifiant unique
INSERT INTO categories (name, slug, is_active, sort_order)
VALUES 
  ('Smartphones', 'smartphones', true, 1),
  ('Ordinateurs', 'ordinateurs', true, 2),
  ('Tablettes', 'tablettes', true, 3),
  ('Accessoires', 'accessoires', true, 4),
  ('Téléviseurs', 'televiseurs', true, 5),
  ('Écouteurs & Audio', 'ecouteurs', true, 6)
ON CONFLICT (slug) DO NOTHING;

-- Récupérer les IDs des catégories et insérer les produits
DO $$
DECLARE
  cat_smartphones_id UUID;
  cat_ordinateurs_id UUID;
  cat_tablettes_id UUID;
  cat_accessoires_id UUID;
  cat_televiseurs_id UUID;
  cat_ecouteurs_id UUID;
BEGIN
  -- Récupérer les IDs des catégories (utiliser slug au lieu de key)
  SELECT id INTO cat_smartphones_id FROM categories WHERE slug = 'smartphones';
  SELECT id INTO cat_ordinateurs_id FROM categories WHERE slug = 'ordinateurs';
  SELECT id INTO cat_tablettes_id FROM categories WHERE slug = 'tablettes';
  SELECT id INTO cat_accessoires_id FROM categories WHERE slug = 'accessoires';
  SELECT id INTO cat_televiseurs_id FROM categories WHERE slug = 'televiseurs';
  SELECT id INTO cat_ecouteurs_id FROM categories WHERE slug = 'ecouteurs';

  -- Produits de test avec prix en USD (en cents)
  -- Exemple: $999.99 = 99999 cents

  -- SMARTPHONES
  INSERT INTO products (name, description, category_id, sku, price_cents, currency, stock, is_refurbished, condition, is_active)
  VALUES 
    -- Smartphones neufs
    ('iPhone 15 Pro 256GB', 'iPhone 15 Pro avec puce A17 Pro, écran Super Retina XDR 6.1", triple caméra 48MP', cat_smartphones_id, 'IPH15P256', 99999, 'USD', 5, false, 'new', true),
    ('Samsung Galaxy S24 Ultra 512GB', 'Galaxy S24 Ultra avec S Pen, écran Dynamic AMOLED 6.8", caméra 200MP', cat_smartphones_id, 'SGS24U512', 119999, 'USD', 3, false, 'new', true),
    ('Xiaomi 14 Pro 256GB', 'Xiaomi 14 Pro avec Snapdragon 8 Gen 3, écran AMOLED 6.73", triple caméra Leica', cat_smartphones_id, 'XIA14P256', 69999, 'USD', 8, false, 'new', true),
    ('OPPO Find X7 Ultra 512GB', 'OPPO Find X7 Ultra avec Snapdragon 8 Gen 3, écran LTPO 6.82", quad caméra Hasselblad', cat_smartphones_id, 'OPP-X7U512', 89999, 'USD', 4, false, 'new', true),
    ('Huawei P70 Pro 256GB', 'Huawei P70 Pro avec Kirin 9000S, écran OLED 6.58", triple caméra 50MP', cat_smartphones_id, 'HUA-P70P256', 79999, 'USD', 6, false, 'new', true),
    
    -- Smartphones reconditionnés (moins chers)
    ('iPhone 13 128GB (Reconditionné)', 'iPhone 13 reconditionné en excellent état, garantie 6 mois', cat_smartphones_id, 'IPH13-128-REF', 49999, 'USD', 12, true, 'refurbished', true),
    ('Samsung Galaxy S21 128GB (Reconditionné)', 'Galaxy S21 reconditionné, testé et certifié', cat_smartphones_id, 'SGS21-128-REF', 39999, 'USD', 10, true, 'refurbished', true),
    ('Xiaomi 12 256GB (Reconditionné)', 'Xiaomi 12 reconditionné, comme neuf', cat_smartphones_id, 'XIA12-256-REF', 34999, 'USD', 15, true, 'refurbished', true),

  -- ORDINATEURS
    ('MacBook Pro 14" M3 Pro 512GB', 'MacBook Pro 14" avec puce M3 Pro, 18GB RAM, écran Liquid Retina XDR', cat_ordinateurs_id, 'MBP14-M3P512', 199999, 'USD', 3, false, 'new', true),
    ('Dell XPS 15 9530 i7 1TB', 'Dell XPS 15 avec Intel i7-13700H, 32GB RAM, SSD 1TB, écran OLED 15.6"', cat_ordinateurs_id, 'DLL-XPS15-1TB', 149999, 'USD', 4, false, 'new', true),
    ('HP Envy 16 i7 512GB', 'HP Envy 16 avec Intel i7-1355U, 16GB RAM, SSD 512GB, écran 16.1" 4K', cat_ordinateurs_id, 'HP-ENVY16-512', 129999, 'USD', 5, false, 'new', true),
    ('Lenovo ThinkPad X1 Carbon Gen 11', 'ThinkPad X1 Carbon avec Intel i7-1355U, 16GB RAM, SSD 512GB, écran 14" 2.8K', cat_ordinateurs_id, 'LNV-TPX1C11', 139999, 'USD', 3, false, 'new', true),
    ('Acer Predator Helios 16 RTX 4060', 'Acer Predator avec Intel i7-13700HX, RTX 4060, 16GB RAM, SSD 1TB', cat_ordinateurs_id, 'ACR-PRED16-4060', 159999, 'USD', 2, false, 'new', true),

  -- TABLETTES
    ('iPad Pro 12.9" M2 256GB', 'iPad Pro 12.9" avec puce M2, écran Liquid Retina XDR, support Apple Pencil', cat_tablettes_id, 'IPD-PRO12-M2', 109999, 'USD', 4, false, 'new', true),
    ('Samsung Galaxy Tab S9 Ultra 512GB', 'Galaxy Tab S9 Ultra 14.6" avec S Pen, Snapdragon 8 Gen 2, écran AMOLED', cat_tablettes_id, 'SGS-TABS9U512', 99999, 'USD', 3, false, 'new', true),
    ('Xiaomi Pad 6 Pro 256GB', 'Xiaomi Pad 6 Pro 11" avec Snapdragon 8+ Gen 1, écran LCD 144Hz', cat_tablettes_id, 'XIA-PAD6P256', 49999, 'USD', 6, false, 'new', true),

  -- ACCESSOIRES
    ('Apple AirPods Pro 2', 'AirPods Pro 2ème génération avec réduction de bruit active, MagSafe', cat_accessoires_id, 'APL-AIRPODSP2', 24999, 'USD', 15, false, 'new', true),
    ('Samsung Galaxy Buds2 Pro', 'Galaxy Buds2 Pro avec réduction de bruit, qualité audio 24-bit', cat_accessoires_id, 'SGS-BUDS2PRO', 19999, 'USD', 12, false, 'new', true),
    ('Power Bank 20000mAh USB-C', 'Batterie externe 20000mAh avec charge rapide USB-C et USB-A', cat_accessoires_id, 'PWR-20K-USB-C', 2999, 'USD', 25, false, 'new', true),
    ('Câble Lightning vers USB-C 2m', 'Câble Apple Lightning vers USB-C certifié, longueur 2 mètres', cat_accessoires_id, 'CBL-LTNG-USB-C-2M', 1999, 'USD', 30, false, 'new', true),
    ('Étui iPhone 15 Pro Silicone', 'Étui Apple Silicone pour iPhone 15 Pro, protection complète', cat_accessoires_id, 'ETU-IPH15P-SIL', 4999, 'USD', 20, false, 'new', true),
    ('Écran Externe 27" 4K USB-C', 'Écran 27 pouces 4K UHD avec port USB-C, HDR10, pour Mac et PC', cat_accessoires_id, 'ECR-27-4K-USB-C', 39999, 'USD', 5, false, 'new', true),

  -- TÉLÉVISEURS
    ('Samsung TV 55" QLED 4K Smart', 'Samsung QLED 55" 4K UHD Smart TV avec HDR10+, Tizen OS', cat_televiseurs_id, 'SGS-TV55-QLED', 89999, 'USD', 3, false, 'new', true),
    ('LG TV 65" OLED 4K Smart', 'LG OLED 65" 4K Smart TV avec HDR10, webOS, Dolby Vision', cat_televiseurs_id, 'LG-TV65-OLED', 149999, 'USD', 2, false, 'new', true),
    ('Xiaomi TV 50" 4K Android', 'Xiaomi TV 50" 4K Android TV avec HDR10, Google TV intégré', cat_televiseurs_id, 'XIA-TV50-4K', 49999, 'USD', 4, false, 'new', true),

  -- ÉCOUTEURS & AUDIO
    ('Sony WH-1000XM5 Casque Bluetooth', 'Casque Sony avec réduction de bruit active, autonomie 30h', cat_ecouteurs_id, 'SNY-WH1000XM5', 39999, 'USD', 8, false, 'new', true),
    ('JBL Flip 6 Enceinte Bluetooth', 'Enceinte portable JBL Flip 6, étanche IPX7, autonomie 12h', cat_ecouteurs_id, 'JBL-FLIP6', 12999, 'USD', 15, false, 'new', true),
    ('Apple AirPods Max', 'Casque Apple AirPods Max avec réduction de bruit active, spatial audio', cat_ecouteurs_id, 'APL-AIRPODSMAX', 54999, 'USD', 4, false, 'new', true)
  ON CONFLICT (sku) DO NOTHING;

  -- Ajouter des prix d'ancrage (comparaison) pour certains produits
  UPDATE products 
  SET compare_at_price_cents = price_cents * 130 / 100
  WHERE sku IN (
    'IPH15P256',
    'SGS24U512',
    'MBP14-M3P512',
    'IPD-PRO12-M2',
    'SGS-TV55-QLED',
    'LG-TV65-OLED'
  );

  RAISE NOTICE '✅ Produits de test ajoutés avec succès!';
  RAISE NOTICE '📱 % smartphones ajoutés', (SELECT COUNT(*) FROM products WHERE category_id = cat_smartphones_id);
  RAISE NOTICE '💻 % ordinateurs ajoutés', (SELECT COUNT(*) FROM products WHERE category_id = cat_ordinateurs_id);
  RAISE NOTICE '📱 % tablettes ajoutées', (SELECT COUNT(*) FROM products WHERE category_id = cat_tablettes_id);
  RAISE NOTICE '🎧 % accessoires ajoutés', (SELECT COUNT(*) FROM products WHERE category_id = cat_accessoires_id);
END $$;

-- Afficher un résumé des données créées
SELECT 
  '✅ Migration terminée!' as status,
  (SELECT COUNT(*) FROM categories) as total_categories,
  (SELECT COUNT(*) FROM products) as total_products,
  (SELECT COUNT(*) FROM products WHERE currency = 'USD') as products_usd;
