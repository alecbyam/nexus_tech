# ⚠️ IMPORTANT : Exécuter la Migration SQL

## Problème Actuel

L'application peut afficher "Internal Server Error" si les nouvelles tables n'ont pas été créées dans Supabase.

## Solution

**Vous devez exécuter la migration SQL dans Supabase Dashboard** :

1. Ouvrez votre projet Supabase
2. Allez dans **SQL Editor**
3. Exécutez le contenu du fichier : `supabase/migrations/add_recommended_features.sql`

## Tables à Créer

Les nouvelles fonctionnalités nécessitent ces tables :
- `wishlists` - Liste de souhaits
- `product_reviews` - Avis produits
- `stock_notifications` - Notifications de stock
- `coupons` - Codes promo
- `coupon_usage` - Utilisation des codes
- `loyalty_points` - Points de fidélité
- `loyalty_transactions` - Historique fidélité
- `admin_notifications` - Notifications admin
- `browsing_history` - Historique de navigation

## Note

L'application a été modifiée pour **gérer gracieusement** l'absence de ces tables. Elle fonctionnera même si les migrations ne sont pas encore exécutées, mais les nouvelles fonctionnalités ne seront pas disponibles.

Une fois les migrations exécutées, toutes les fonctionnalités seront opérationnelles.
