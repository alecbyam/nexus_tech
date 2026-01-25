# Instructions - Ajout de Produits de Simulation RDC

## 📋 Vue d'ensemble

Ce document explique comment ajouter des produits de simulation adaptés au marché congolais (RDC) dans votre base de données Supabase.

## 🎯 Objectifs

- Ajouter 30+ produits de simulation réalistes
- Adapter les prix en CDF (Franc congolais)
- Créer des catégories pertinentes pour le marché RDC
- Inclure des produits neufs et reconditionnés

## 📝 Étapes d'installation

### 1. Accéder à Supabase SQL Editor

1. Connectez-vous à votre [dashboard Supabase](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor** (menu de gauche)
4. Cliquez sur **New Query**

### 2. Exécuter le script SQL

1. Ouvrez le fichier `supabase/SEED_PRODUCTS_RDC.sql`
2. Copiez **TOUT** le contenu du fichier
3. Collez-le dans l'éditeur SQL de Supabase
4. Cliquez sur **Run** (ou appuyez sur `Ctrl+Enter`)

### 3. Vérifier les résultats

Après l'exécution, vous devriez voir :
- ✅ 6 catégories créées
- ✅ 30+ produits ajoutés
- ✅ Prix en CDF (Franc congolais)
- ✅ Produits neufs et reconditionnés

## 📦 Produits inclus

### Smartphones (8 produits)
- iPhone 15 Pro, Samsung S24 Ultra, Xiaomi 14 Pro, etc.
- Produits reconditionnés à prix réduits

### Ordinateurs (5 produits)
- MacBook Pro, Dell XPS, HP Envy, Lenovo ThinkPad, Acer Predator

### Tablettes (3 produits)
- iPad Pro, Samsung Tab S9 Ultra, Xiaomi Pad 6 Pro

### Accessoires (6 produits)
- AirPods, écouteurs, power banks, câbles, étuis, écrans

### Téléviseurs (3 produits)
- Samsung QLED, LG OLED, Xiaomi TV

### Écouteurs & Audio (3 produits)
- Sony WH-1000XM5, JBL Flip 6, AirPods Max

## 💰 Prix en CDF

Tous les prix sont en **Franc congolais (CDF)** :
- Taux de change approximatif : 1 USD ≈ 2800 CDF
- Format : Prix sans décimales (ex: 42 000 000 FC)

## 🔄 Mise à jour des prix

Pour mettre à jour les prix selon le taux de change actuel :

```sql
-- Exemple : Mettre à jour tous les prix avec un nouveau taux
UPDATE products 
SET price_cents = price_cents * 1.1  -- Augmentation de 10%
WHERE currency = 'CDF';
```

## 📊 Statistiques

Après l'exécution, vous pouvez vérifier :

```sql
-- Nombre de produits par catégorie
SELECT c.name, COUNT(p.id) as nombre_produits
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.name
ORDER BY nombre_produits DESC;

-- Produits reconditionnés
SELECT COUNT(*) FROM products WHERE is_refurbished = true;

-- Valeur totale du stock
SELECT 
  currency,
  SUM(price_cents * stock) / 100 as valeur_totale
FROM products
GROUP BY currency;
```

## ⚠️ Notes importantes

1. **Conflits SKU** : Le script utilise `ON CONFLICT (sku) DO NOTHING` pour éviter les doublons
2. **Catégories** : Les catégories sont créées avec la clé `key` comme identifiant unique
3. **Prix d'ancrage** : Certains produits ont un prix d'ancrage (comparaison) à +30% du prix de vente
4. **Stock initial** : Les quantités en stock sont réalistes pour un marché congolais

## 🚀 Prochaines étapes

1. ✅ Exécuter le script SQL
2. ✅ Vérifier les produits dans l'interface admin
3. ✅ Ajouter des images aux produits
4. ✅ Ajuster les prix si nécessaire
5. ✅ Tester l'affichage sur le site

## 📞 Support

Si vous rencontrez des erreurs :
- Vérifiez que la migration complète a été exécutée
- Assurez-vous que les tables `categories` et `products` existent
- Vérifiez les logs dans Supabase SQL Editor
