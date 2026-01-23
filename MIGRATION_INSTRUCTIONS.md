# 🚀 Instructions de Migration Supabase

## ⚡ Migration Rapide (Recommandée)

### Étape 1 : Exécuter la Migration

1. **Ouvrez Supabase Dashboard**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet

2. **Ouvrez SQL Editor**
   - Cliquez sur "SQL Editor" dans le menu de gauche
   - Cliquez sur "New query"

3. **Copiez-collez la Migration Complète**
   - Ouvrez le fichier : `supabase/COMPLETE_MIGRATION.sql`
   - Copiez **TOUT** le contenu
   - Collez-le dans l'éditeur SQL
   - Cliquez sur **"Run"** (ou appuyez sur Ctrl+Enter)

4. **Vérifiez le résultat**
   - Vous devriez voir : `✅ Migration complète terminée!`
   - S'il y a des erreurs, elles s'afficheront en rouge

### Étape 2 : Vérifier les Tables

Exécutez cette requête pour vérifier que toutes les tables sont créées :

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Vous devriez voir au moins ces tables :
- profiles
- categories
- products
- product_images
- orders
- order_items
- wishlists
- product_reviews
- stock_notifications
- coupons
- coupon_usage
- loyalty_points
- loyalty_transactions
- browsing_history
- product_views
- search_queries

### Étape 3 : Créer un Compte Admin (si nécessaire)

Si vous n'avez pas encore de compte admin :

1. **Via SQL** :
   - Ouvrez `supabase/CREATE_ADMIN.sql`
   - Remplacez `'votre-email@example.com'` par votre email
   - Exécutez le script

2. **Via Dashboard** :
   - Table Editor > profiles
   - Trouvez votre utilisateur
   - Modifiez `is_admin` à `true`

---

## 📋 Fichiers de Migration Disponibles

- **`supabase/COMPLETE_MIGRATION.sql`** ⭐ **RECOMMANDÉ** - Tout en une fois
- `supabase/schema.sql` - Schéma de base uniquement
- `supabase/migrations/add_compare_at_price.sql` - Prix d'ancrage
- `supabase/migrations/add_user_interests.sql` - Intérêts utilisateurs
- `supabase/migrations/add_recommended_features.sql` - Fonctionnalités avancées

---

## ✅ Application Lancée

L'application est maintenant en cours d'exécution sur **http://localhost:3000**

### Prochaines Étapes :

1. ✅ **Migration exécutée** (si vous l'avez fait)
2. 🌐 **Ouvrez** http://localhost:3000 dans votre navigateur
3. 🔐 **Connectez-vous** avec votre compte admin
4. 📦 **Créez des catégories** via `/admin/categories`
5. 🛍️ **Créez des produits** via `/admin/products/new`

---

## 🆘 Dépannage

### Erreur "Permission denied"
- Vérifiez que vous êtes connecté à Supabase
- Vérifiez que votre utilisateur a les permissions nécessaires

### Erreur "Table already exists"
- C'est normal ! Les migrations utilisent `IF NOT EXISTS`
- Vous pouvez ignorer ces messages

### Erreur "Function already exists"
- C'est normal ! Les fonctions sont recréées avec `CREATE OR REPLACE`
- Vous pouvez ignorer ces messages

### L'application ne démarre pas
- Vérifiez que les variables d'environnement sont configurées (`.env.local`)
- Vérifiez que le port 3000 n'est pas déjà utilisé
- Consultez les logs dans le terminal

---

## 📚 Documentation Complète

Pour plus de détails, consultez :
- `docs/GUIDE_MIGRATION.md` - Guide détaillé
- `docs/IMPORTANT_MIGRATION.md` - Informations importantes
