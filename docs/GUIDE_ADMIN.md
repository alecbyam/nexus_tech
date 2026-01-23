# 👤 Guide - Gestion des Administrateurs

## ✅ Résultat de la Vérification

**Un compte administrateur a été trouvé dans votre base de données :**

- **ID** : `2d178b66-6f07-4495-9c12-19267ed93a4f`
- **Nom** : MOISE BYAMUNGU
- **Téléphone** : Non renseigné
- **Créé le** : 22/01/2026 12:56:20
- **Statut** : ✅ Administrateur

**Statistiques actuelles :**
- Total utilisateurs : 1
- Administrateurs : 1
- Utilisateurs réguliers : 0

---

## 🔍 Vérifier les Administrateurs

### Méthode 1 : Via le Script (Recommandé)

```bash
node scripts/check-admin-users.js
```

Ce script affiche :
- ✅ Liste de tous les administrateurs
- 📊 Statistiques complètes
- 📝 Instructions si aucun admin n'est trouvé

### Méthode 2 : Via l'Interface Admin

1. **Connectez-vous** avec un compte admin
2. Allez sur `/admin/users`
3. Cliquez sur **"Statistiques"** pour voir les détails
4. Les administrateurs sont marqués avec un badge **"ADMIN"**

### Méthode 3 : Via Supabase Dashboard

1. Allez dans **Table Editor** → **profiles**
2. Filtrez par `is_admin = true`
3. Vous verrez tous les administrateurs

### Méthode 4 : Via SQL

Exécutez dans **Supabase SQL Editor** :

```sql
SELECT 
  p.id,
  p.full_name,
  p.phone,
  p.is_admin,
  p.created_at,
  u.email
FROM public.profiles p
LEFT JOIN auth.users u ON u.id = p.id
WHERE p.is_admin = true
ORDER BY p.created_at DESC;
```

---

## ➕ Créer un Nouvel Administrateur

### Méthode 1 : Via l'Interface Admin (Recommandé)

1. **Connectez-vous** avec un compte admin existant
2. Allez sur `/admin/users`
3. Trouvez l'utilisateur à promouvoir
4. Cliquez sur **"Voir détails"**
5. Cochez **"Accès administrateur"**
6. Cliquez sur **"Enregistrer"**

### Méthode 2 : Via Supabase Dashboard

1. **Créez d'abord un compte utilisateur normal** via `/auth/signup`
2. Allez dans **Table Editor** → **profiles**
3. Trouvez l'utilisateur (par ID ou nom)
4. Modifiez `is_admin` : `false` → `true`
5. Sauvegardez

### Méthode 3 : Via SQL

1. **Trouvez l'ID utilisateur** :
   - Allez dans **Authentication** → **Users**
   - Copiez l'ID de l'utilisateur

2. **Exécutez dans SQL Editor** :

```sql
UPDATE public.profiles
SET is_admin = true
WHERE id = 'ID_UTILISATEUR_ICI';
```

3. **Vérifiez** :

```sql
SELECT * FROM public.profiles WHERE id = 'ID_UTILISATEUR_ICI';
```

### Méthode 4 : Via le Script SQL

Utilisez le fichier `supabase/CREATE_ADMIN.sql` :

1. Ouvrez le fichier
2. Suivez les instructions
3. Exécutez dans Supabase SQL Editor

---

## 🔐 Créer un Admin Automatiquement

Pour créer automatiquement un admin lors de l'inscription avec un email spécifique, modifiez le trigger dans `supabase/schema.sql` :

```sql
-- Modifier la fonction handle_new_user()
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, is_admin)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', ''), 
    new.phone,
    -- Créer en admin si l'email correspond
    CASE 
      WHEN new.email = 'admin@nexustech.com' THEN true
      ELSE false
    END
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
```

> ⚠️ Remplacez `admin@nexustech.com` par l'email souhaité

---

## 📊 Voir les Statistiques

### Via l'Interface

1. Allez sur `/admin/users/stats`
2. Vous verrez :
   - Total utilisateurs
   - Nombre d'administrateurs
   - Utilisateurs réguliers
   - Nouveaux utilisateurs (30 derniers jours)
   - Liste détaillée des administrateurs

### Via le Script

```bash
node scripts/check-admin-users.js
```

---

## ⚠️ Sécurité

### Bonnes Pratiques

1. **Limitez le nombre d'admins** : Seulement les personnes de confiance
2. **Vérifiez régulièrement** : Utilisez le script pour voir qui est admin
3. **Protégez les comptes admin** : Utilisez des mots de passe forts
4. **Audit** : Vérifiez les logs dans Supabase Dashboard

### Vérification Régulière

Exécutez régulièrement :

```bash
node scripts/check-admin-users.js
```

---

## 🛠️ Scripts Disponibles

1. **`scripts/check-admin-users.js`**
   - Vérifie les comptes administrateurs
   - Affiche les statistiques
   - ✅ **Utilisez celui-ci pour vérifier**

2. **`scripts/create-admin.js`**
   - Guide pour créer un admin
   - Affiche les instructions

3. **`supabase/CREATE_ADMIN.sql`**
   - Scripts SQL pour gérer les admins
   - Plusieurs méthodes disponibles

---

## ✅ Checklist

- [x] Compte admin existant vérifié
- [ ] Compte admin peut accéder à `/admin`
- [ ] Interface de gestion des utilisateurs fonctionnelle
- [ ] Scripts de vérification fonctionnels
- [ ] Documentation complète

---

**Dernière vérification** : 22/01/2026
