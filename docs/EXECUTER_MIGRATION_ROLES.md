# 📋 Guide d'Exécution - Migration Système de Rôles

## 🎯 Objectif

Cette migration ajoute un système de rôles complet (`client`, `staff`, `admin`, `tech`) à la table `profiles` et met à jour toutes les fonctions nécessaires.

---

## 📝 Fichier de Migration

**Fichier :** `supabase/ADD_ROLE_SYSTEM.sql`

---

## 🚀 Étapes d'Exécution

### 1. Ouvrir Supabase Dashboard

1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet **ONATECH**

### 2. Ouvrir SQL Editor

1. Dans le menu de gauche, cliquez sur **"SQL Editor"**
2. Cliquez sur **"New query"** pour créer une nouvelle requête

### 3. Copier le Code SQL

Copiez-collez **TOUT** le contenu du fichier `supabase/ADD_ROLE_SYSTEM.sql` dans l'éditeur SQL.

### 4. Exécuter la Migration

1. Cliquez sur **"Run"** (ou appuyez sur `Ctrl+Enter`)
2. Attendez la confirmation de succès
3. Vérifiez qu'il n'y a pas d'erreurs

---

## ✅ Vérification Post-Migration

### 1. Vérifier que la colonne `role` existe

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'role';
```

**Résultat attendu :**
- `column_name`: `role`
- `data_type`: `text`
- `column_default`: `'client'::text`

### 2. Vérifier les rôles actuels

```sql
SELECT id, full_name, role, is_admin, created_at
FROM profiles 
ORDER BY role, created_at DESC;
```

**Vérifications :**
- ✅ Tous les utilisateurs ont un `role` (pas de NULL)
- ✅ Les utilisateurs avec `is_admin = true` ont `role = 'admin'`
- ✅ Les nouveaux utilisateurs auront `role = 'client'` par défaut

### 3. Tester les fonctions helper

```sql
-- Tester is_admin() (doit retourner true si vous êtes admin)
SELECT public.is_admin();

-- Tester has_role()
SELECT public.has_role('admin');
SELECT public.has_role('staff');

-- Tester is_staff_or_admin()
SELECT public.is_staff_or_admin();

-- Tester is_tech_or_admin()
SELECT public.is_tech_or_admin();
```

---

## 🔧 Script de Vérification

Vous pouvez aussi exécuter le script de vérification :

**Fichier :** `supabase/VERIFY_ROLE_MIGRATION.sql`

Ce script vérifie automatiquement :
- ✅ La colonne `role` existe
- ✅ Tous les utilisateurs ont un rôle
- ✅ Les admins ont été migrés correctement
- ✅ Les fonctions helper existent
- ✅ Les statistiques par rôle

---

## 📊 Commandes Utiles Après Migration

### Compter les utilisateurs par rôle

```sql
SELECT 
  role,
  COUNT(*) as count
FROM profiles
GROUP BY role
ORDER BY count DESC;
```

### Mettre à jour un utilisateur spécifique

```sql
-- Mettre un utilisateur en admin
UPDATE profiles 
SET role = 'admin', is_admin = true
WHERE id = 'user-uuid-here';

-- Mettre un utilisateur en staff
UPDATE profiles 
SET role = 'staff', is_admin = false
WHERE id = 'user-uuid-here';

-- Mettre un utilisateur en tech
UPDATE profiles 
SET role = 'tech', is_admin = false
WHERE id = 'user-uuid-here';

-- Mettre un utilisateur en client
UPDATE profiles 
SET role = 'client', is_admin = false
WHERE id = 'user-uuid-here';
```

---

## ⚠️ Notes Importantes

1. **Le champ `is_admin` est conservé** pour compatibilité mais ne doit plus être utilisé
2. **Tous les nouveaux utilisateurs** auront `role = 'client'` par défaut
3. **Les utilisateurs existants** avec `is_admin = true` ont été migrés vers `role = 'admin'`
4. **La migration est idempotente** : vous pouvez l'exécuter plusieurs fois sans problème

---

## 🐛 Dépannage

### Erreur : "column role already exists"

**Solution :** C'est normal, la migration utilise `ADD COLUMN IF NOT EXISTS`. Vous pouvez ignorer cette erreur.

### Erreur : "function is_admin() already exists"

**Solution :** C'est normal, la migration utilise `CREATE OR REPLACE FUNCTION`. La fonction sera mise à jour.

### Les utilisateurs ont `role = NULL`

**Solution :** Exécutez cette commande :

```sql
UPDATE profiles 
SET role = CASE 
  WHEN is_admin = true THEN 'admin'
  ELSE 'client'
END
WHERE role IS NULL;
```

---

## ✅ Checklist

- [ ] Migration SQL exécutée dans Supabase
- [ ] Aucune erreur dans les logs
- [ ] La colonne `role` existe
- [ ] Tous les utilisateurs ont un rôle
- [ ] Les admins existants ont `role = 'admin'`
- [ ] Les fonctions helper fonctionnent
- [ ] L'application fonctionne correctement

---

**Note :** Après la migration, rechargez l'application et testez les pages admin pour vérifier que tout fonctionne.
