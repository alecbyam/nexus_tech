# 📋 Guide de Migration Supabase

## Option 1 : Migration Complète (Recommandée)

**Fichier : `supabase/COMPLETE_MIGRATION.sql`**

Cette migration contient **TOUT** en une seule fois :
- ✅ Schéma de base (profiles, categories, products, etc.)
- ✅ Prix d'ancrage (compare_at_price_cents)
- ✅ Intérêts utilisateurs (product_views, search_queries)
- ✅ Fonctionnalités avancées (wishlist, reviews, coupons, loyalty, etc.)

### Étapes :

1. **Ouvrez votre projet Supabase Dashboard**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet

2. **Ouvrez le SQL Editor**
   - Cliquez sur "SQL Editor" dans le menu de gauche

3. **Exécutez la migration**
   - Cliquez sur "New query"
   - Ouvrez le fichier `supabase/COMPLETE_MIGRATION.sql`
   - Copiez-collez **TOUT** le contenu dans l'éditeur
   - Cliquez sur "Run" (ou Ctrl+Enter)

4. **Vérifiez le résultat**
   - Vous devriez voir : `✅ Migration complète terminée!`
   - Vérifiez qu'il n'y a pas d'erreurs

---

## Option 2 : Migrations Séparées

Si vous préférez exécuter les migrations une par une :

### Ordre d'exécution :

1. **Schéma principal** : `supabase/schema.sql`
2. **Catégories** : `supabase/categories-schema.sql` (optionnel)
3. **Prix de comparaison** : `supabase/migrations/add_compare_at_price.sql`
4. **Intérêts utilisateurs** : `supabase/migrations/add_user_interests.sql`
5. **Fonctionnalités recommandées** : `supabase/migrations/add_recommended_features.sql`

---

## ⚠️ Important

- Les migrations utilisent `CREATE TABLE IF NOT EXISTS`, donc elles sont **sûres** à réexécuter
- Si vous avez déjà des données, elles ne seront **PAS** supprimées
- Les politiques RLS (Row Level Security) seront recréées

---

## ✅ Vérification

Après la migration, vérifiez que ces tables existent :

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Vous devriez voir :
- ✅ profiles
- ✅ categories
- ✅ products
- ✅ product_images
- ✅ orders
- ✅ order_items
- ✅ wishlists
- ✅ product_reviews
- ✅ stock_notifications
- ✅ coupons
- ✅ coupon_usage
- ✅ loyalty_points
- ✅ loyalty_transactions
- ✅ browsing_history
- ✅ product_views
- ✅ search_queries

---

## 🚀 Après la Migration

1. **Créez un compte admin** (si nécessaire) :
   - Utilisez `supabase/CREATE_ADMIN.sql`
   - Ou via le dashboard : Table Editor > profiles > Modifier un utilisateur > is_admin = true

2. **Lancez l'application** :
   ```bash
   npm run dev
   ```

3. **Testez les fonctionnalités** :
   - Création de produits
   - Gestion des catégories
   - Wishlist
   - Reviews
   - etc.

---

## 🆘 En cas d'erreur

Si vous rencontrez une erreur lors de la migration :

1. **Vérifiez les logs** dans le SQL Editor
2. **Vérifiez que vous êtes connecté** à Supabase
3. **Vérifiez les permissions** de votre utilisateur
4. **Exécutez les migrations une par une** pour identifier le problème

---

## 📝 Notes

- Les migrations sont **idempotentes** (peuvent être exécutées plusieurs fois)
- Les données existantes ne seront **PAS** supprimées
- Les index et contraintes seront créés automatiquement
