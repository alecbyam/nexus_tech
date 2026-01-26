# Exécuter la Migration Paiement Mobile Money

## 🚀 Instructions Rapides

### Option 1 : Via Supabase Dashboard (Recommandé)

1. **Ouvrez votre projet Supabase**
   - Allez sur https://supabase.com/dashboard
   - Connectez-vous à votre compte
   - Sélectionnez votre projet ONATECH

2. **Accédez au SQL Editor**
   - Dans le menu de gauche, cliquez sur **"SQL Editor"**
   - Cliquez sur **"New query"**

3. **Copiez-collez le code SQL**
   - Ouvrez le fichier : `supabase/ADD_MOBILE_MONEY_PAYMENT.sql`
   - Copiez **TOUT** le contenu (Ctrl+A, Ctrl+C)
   - Collez dans l'éditeur SQL de Supabase (Ctrl+V)

4. **Exécutez la migration**
   - Cliquez sur le bouton **"Run"** (ou appuyez sur Ctrl+Enter)
   - Attendez la confirmation "Success. No rows returned"

5. **Vérifiez que ça a fonctionné**
   - Dans le SQL Editor, exécutez :
   ```sql
   SELECT * FROM payments LIMIT 1;
   ```
   - Si vous voyez une structure de table, c'est bon ✅
   - Si vous avez une erreur "relation does not exist", la migration n'a pas fonctionné ❌

---

## ✅ Vérification Post-Migration

### Vérifier que la table existe

```sql
-- Vérifier la table payments
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'payments'
ORDER BY ordinal_position;
```

### Vérifier les index

```sql
-- Vérifier les index
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'payments';
```

### Vérifier les politiques RLS

```sql
-- Vérifier les politiques
SELECT * FROM pg_policies WHERE tablename = 'payments';
```

### Vérifier les triggers

```sql
-- Vérifier les triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'payments';
```

---

## 🔧 En Cas d'Erreur

### Erreur : "relation already exists"
- La table existe déjà
- Vous pouvez soit :
  - Ignorer cette erreur (si la table est correcte)
  - Supprimer la table et réessayer (ATTENTION : perte de données)

### Erreur : "function does not exist"
- La fonction `set_updated_at()` n'existe pas
- Exécutez d'abord `supabase/COMPLETE_MIGRATION.sql` qui contient cette fonction

### Erreur : "permission denied"
- Vérifiez que vous êtes connecté avec un compte admin
- Vérifiez les permissions de votre projet Supabase

---

## 📋 Contenu de la Migration

La migration crée :

1. **Table `payments`** avec :
   - Champs pour mobile money (phone_number, transaction_id)
   - Statuts de paiement
   - Métadonnées

2. **Index** pour performance :
   - Sur user_id, order_id, status, transaction_id, created_at

3. **Triggers** :
   - Mise à jour automatique de `updated_at`
   - Mise à jour automatique du statut de commande quand paiement complété

4. **Politiques RLS** :
   - Utilisateurs voient leurs propres paiements
   - Admins voient tous les paiements

5. **Colonne `payment_method`** dans `orders` :
   - Pour compatibilité et recherche rapide

---

## 🎯 Après la Migration

Une fois la migration exécutée avec succès :

1. ✅ La table `payments` est créée
2. ✅ Les index sont en place
3. ✅ Les triggers fonctionnent
4. ✅ Les politiques RLS sont actives
5. ✅ Vous pouvez maintenant utiliser le système de paiement

---

## 🧪 Test Rapide

Après la migration, testez avec :

```sql
-- Créer un paiement de test (remplacez les UUIDs par de vrais)
INSERT INTO payments (
  order_id,
  user_id,
  amount_cents,
  currency,
  payment_method,
  payment_status,
  phone_number
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- UUID d'une commande existante
  '00000000-0000-0000-0000-000000000000', -- UUID d'un utilisateur existant
  10000, -- 100.00 USD
  'USD',
  'mpesa',
  'pending',
  '+243900000000'
);

-- Vérifier
SELECT * FROM payments WHERE phone_number = '+243900000000';
```

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs dans Supabase Dashboard > Logs
2. Vérifiez que toutes les tables prérequises existent (orders, profiles)
3. Vérifiez que la fonction `is_admin()` existe (dans COMPLETE_MIGRATION.sql)

---

**Note :** Cette migration est **idempotente** - vous pouvez l'exécuter plusieurs fois sans problème grâce aux `IF NOT EXISTS` et `DROP IF EXISTS`.
