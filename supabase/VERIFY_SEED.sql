-- Script de vérification des données créées
-- Exécutez ce script pour vérifier que les produits et catégories ont été créés

-- Vérifier les catégories
SELECT 
  'Catégories créées' as type,
  COUNT(*) as total
FROM categories;

-- Vérifier les produits par catégorie
SELECT 
  c.name as categorie,
  COUNT(p.id) as nombre_produits,
  SUM(p.stock) as stock_total,
  MIN(p.price_cents::numeric / 100) as prix_min,
  MAX(p.price_cents::numeric / 100) as prix_max
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.id, c.name
ORDER BY c.sort_order;

-- Liste de tous les produits
SELECT 
  p.name,
  c.name as categorie,
  p.price_cents::numeric / 100 as prix_usd,
  p.stock,
  p.currency,
  p.is_active
FROM products p
JOIN categories c ON p.category_id = c.id
ORDER BY c.sort_order, p.name
LIMIT 50;
