-- Script d'ajout de produits de simulation pour la RDC
-- Adapté au marché congolais avec prix en CDF (Franc congolais)

-- D'abord, vérifier et créer des catégories si elles n'existent pas
INSERT INTO categories (id, name, slug, description, is_active, sort_order)
VALUES 
  ('cat-smartphones', 'Smartphones', 'smartphones', 'Téléphones intelligents et smartphones', true, 1),
  ('cat-ordinateurs', 'Ordinateurs', 'ordinateurs', 'Ordinateurs portables et de bureau', true, 2),
  ('cat-tablettes', 'Tablettes', 'tablettes', 'Tablettes tactiles', true, 3),
  ('cat-accessoires', 'Accessoires', 'accessoires', 'Accessoires tech et téléphonie', true, 4),
  ('cat-televiseurs', 'Téléviseurs', 'televiseurs', 'TV Smart et écrans', true, 5),
  ('cat-ecouteurs', 'Écouteurs & Audio', 'ecouteurs', 'Écouteurs, casques et enceintes', true, 6)
ON CONFLICT (id) DO NOTHING;

-- Produits de simulation adaptés au marché congolais
-- Prix en CDF (Franc congolais) - 1 USD ≈ 2800 CDF

-- SMARTPHONES
INSERT INTO products (id, name, description, category_id, sku, price_cents, currency, stock, is_refurbished, condition, is_active)
VALUES 
  -- Smartphones neufs
  ('prod-iphone-15-pro', 'iPhone 15 Pro 256GB', 'iPhone 15 Pro avec puce A17 Pro, écran Super Retina XDR 6.1", triple caméra 48MP', 'cat-smartphones', 'IPH15P256', 42000000, 'CDF', 5, false, 'new', true),
  ('prod-samsung-s24', 'Samsung Galaxy S24 Ultra 512GB', 'Galaxy S24 Ultra avec S Pen, écran Dynamic AMOLED 6.8", caméra 200MP', 'cat-smartphones', 'SGS24U512', 45000000, 'CDF', 3, false, 'new', true),
  ('prod-xiaomi-14', 'Xiaomi 14 Pro 256GB', 'Xiaomi 14 Pro avec Snapdragon 8 Gen 3, écran AMOLED 6.73", triple caméra Leica', 'cat-smartphones', 'XIA14P256', 28000000, 'CDF', 8, false, 'new', true),
  ('prod-oppo-find-x7', 'OPPO Find X7 Ultra 512GB', 'OPPO Find X7 Ultra avec Snapdragon 8 Gen 3, écran LTPO 6.82", quad caméra Hasselblad', 'cat-smartphones', 'OPP-X7U512', 35000000, 'CDF', 4, false, 'new', true),
  ('prod-huawei-p70', 'Huawei P70 Pro 256GB', 'Huawei P70 Pro avec Kirin 9000S, écran OLED 6.58", triple caméra 50MP', 'cat-smartphones', 'HUA-P70P256', 32000000, 'CDF', 6, false, 'new', true),
  
  -- Smartphones reconditionnés (moins chers)
  ('prod-iphone-13-ref', 'iPhone 13 128GB (Reconditionné)', 'iPhone 13 reconditionné en excellent état, garantie 6 mois', 'cat-smartphones', 'IPH13-128-REF', 18000000, 'CDF', 12, true, 'refurbished', true),
  ('prod-samsung-s21-ref', 'Samsung Galaxy S21 128GB (Reconditionné)', 'Galaxy S21 reconditionné, testé et certifié', 'cat-smartphones', 'SGS21-128-REF', 15000000, 'CDF', 10, true, 'refurbished', true),
  ('prod-xiaomi-12-ref', 'Xiaomi 12 256GB (Reconditionné)', 'Xiaomi 12 reconditionné, comme neuf', 'cat-smartphones', 'XIA12-256-REF', 12000000, 'CDF', 15, true, 'refurbished', true),

-- ORDINATEURS
  ('prod-macbook-pro-14', 'MacBook Pro 14" M3 Pro 512GB', 'MacBook Pro 14" avec puce M3 Pro, 18GB RAM, écran Liquid Retina XDR', 'cat-ordinateurs', 'MBP14-M3P512', 65000000, 'CDF', 3, false, 'new', true),
  ('prod-dell-xps-15', 'Dell XPS 15 9530 i7 1TB', 'Dell XPS 15 avec Intel i7-13700H, 32GB RAM, SSD 1TB, écran OLED 15.6"', 'cat-ordinateurs', 'DLL-XPS15-1TB', 45000000, 'CDF', 4, false, 'new', true),
  ('prod-hp-envy-16', 'HP Envy 16 i7 512GB', 'HP Envy 16 avec Intel i7-1355U, 16GB RAM, SSD 512GB, écran 16.1" 4K', 'cat-ordinateurs', 'HP-ENVY16-512', 38000000, 'CDF', 5, false, 'new', true),
  ('prod-lenovo-thinkpad', 'Lenovo ThinkPad X1 Carbon Gen 11', 'ThinkPad X1 Carbon avec Intel i7-1355U, 16GB RAM, SSD 512GB, écran 14" 2.8K', 'cat-ordinateurs', 'LNV-TPX1C11', 42000000, 'CDF', 3, false, 'new', true),
  ('prod-acer-predator', 'Acer Predator Helios 16 RTX 4060', 'Acer Predator avec Intel i7-13700HX, RTX 4060, 16GB RAM, SSD 1TB', 'cat-ordinateurs', 'ACR-PRED16-4060', 48000000, 'CDF', 2, false, 'new', true),

-- TABLETTES
  ('prod-ipad-pro-12', 'iPad Pro 12.9" M2 256GB', 'iPad Pro 12.9" avec puce M2, écran Liquid Retina XDR, support Apple Pencil', 'cat-tablettes', 'IPD-PRO12-M2', 35000000, 'CDF', 4, false, 'new', true),
  ('prod-samsung-tab-s9', 'Samsung Galaxy Tab S9 Ultra 512GB', 'Galaxy Tab S9 Ultra 14.6" avec S Pen, Snapdragon 8 Gen 2, écran AMOLED', 'cat-tablettes', 'SGS-TABS9U512', 32000000, 'CDF', 3, false, 'new', true),
  ('prod-xiaomi-pad-6', 'Xiaomi Pad 6 Pro 256GB', 'Xiaomi Pad 6 Pro 11" avec Snapdragon 8+ Gen 1, écran LCD 144Hz', 'cat-tablettes', 'XIA-PAD6P256', 18000000, 'CDF', 6, false, 'new', true),

-- ACCESSOIRES
  ('prod-airpods-pro-2', 'Apple AirPods Pro 2', 'AirPods Pro 2ème génération avec réduction de bruit active, MagSafe', 'cat-accessoires', 'APL-AIRPODSP2', 4500000, 'CDF', 15, false, 'new', true),
  ('prod-samsung-buds2', 'Samsung Galaxy Buds2 Pro', 'Galaxy Buds2 Pro avec réduction de bruit, qualité audio 24-bit', 'cat-accessoires', 'SGS-BUDS2PRO', 3500000, 'CDF', 12, false, 'new', true),
  ('prod-powerbank-20000', 'Power Bank 20000mAh USB-C', 'Batterie externe 20000mAh avec charge rapide USB-C et USB-A', 'cat-accessoires', 'PWR-20K-USB-C', 150000, 'CDF', 25, false, 'new', true),
  ('prod-cable-lightning', 'Câble Lightning vers USB-C 2m', 'Câble Apple Lightning vers USB-C certifié, longueur 2 mètres', 'cat-accessoires', 'CBL-LTNG-USB-C-2M', 25000, 'CDF', 30, false, 'new', true),
  ('prod-etui-iphone-15', 'Étui iPhone 15 Pro Silicone', 'Étui Apple Silicone pour iPhone 15 Pro, protection complète', 'cat-accessoires', 'ETU-IPH15P-SIL', 45000, 'CDF', 20, false, 'new', true),
  ('prod-ecran-externe-27', 'Écran Externe 27" 4K USB-C', 'Écran 27 pouces 4K UHD avec port USB-C, HDR10, pour Mac et PC', 'cat-accessoires', 'ECR-27-4K-USB-C', 8500000, 'CDF', 5, false, 'new', true),

-- TÉLÉVISEURS
  ('prod-samsung-tv-55', 'Samsung TV 55" QLED 4K Smart', 'Samsung QLED 55" 4K UHD Smart TV avec HDR10+, Tizen OS', 'cat-televiseurs', 'SGS-TV55-QLED', 18000000, 'CDF', 3, false, 'new', true),
  ('prod-lg-tv-65', 'LG TV 65" OLED 4K Smart', 'LG OLED 65" 4K Smart TV avec HDR10, webOS, Dolby Vision', 'cat-televiseurs', 'LG-TV65-OLED', 28000000, 'CDF', 2, false, 'new', true),
  ('prod-xiaomi-tv-50', 'Xiaomi TV 50" 4K Android', 'Xiaomi TV 50" 4K Android TV avec HDR10, Google TV intégré', 'cat-televiseurs', 'XIA-TV50-4K', 12000000, 'CDF', 4, false, 'new', true),

-- ÉCOUTEURS & AUDIO
  ('prod-sony-wh1000xm5', 'Sony WH-1000XM5 Casque Bluetooth', 'Casque Sony avec réduction de bruit active, autonomie 30h', 'cat-ecouteurs', 'SNY-WH1000XM5', 5500000, 'CDF', 8, false, 'new', true),
  ('prod-jbl-flip-6', 'JBL Flip 6 Enceinte Bluetooth', 'Enceinte portable JBL Flip 6, étanche IPX7, autonomie 12h', 'cat-ecouteurs', 'JBL-FLIP6', 180000, 'CDF', 15, false, 'new', true),
  ('prod-airpods-max', 'Apple AirPods Max', 'Casque Apple AirPods Max avec réduction de bruit active, spatial audio', 'cat-ecouteurs', 'APL-AIRPODSMAX', 8500000, 'CDF', 4, false, 'new', true)
ON CONFLICT (id) DO NOTHING;

-- Ajouter des prix d'ancrage (comparaison) pour certains produits
UPDATE products 
SET compare_at_price_cents = price_cents * 1.3
WHERE id IN (
  'prod-iphone-15-pro',
  'prod-samsung-s24',
  'prod-macbook-pro-14',
  'prod-ipad-pro-12',
  'prod-samsung-tv-55',
  'prod-lg-tv-65'
);

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Produits de simulation ajoutés avec succès pour le marché RDC!';
  RAISE NOTICE '📱 % smartphones ajoutés', (SELECT COUNT(*) FROM products WHERE category_id = 'cat-smartphones');
  RAISE NOTICE '💻 % ordinateurs ajoutés', (SELECT COUNT(*) FROM products WHERE category_id = 'cat-ordinateurs');
  RAISE NOTICE '📱 % tablettes ajoutées', (SELECT COUNT(*) FROM products WHERE category_id = 'cat-tablettes');
  RAISE NOTICE '🎧 % accessoires ajoutés', (SELECT COUNT(*) FROM products WHERE category_id = 'cat-accessoires');
END $$;
