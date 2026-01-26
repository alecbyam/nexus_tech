# ✅ Test du Système de Rôles

## 🔍 Vérification de la Migration

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

### 2. Vérifier les rôles actuels des utilisateurs

```sql
SELECT 
  id, 
  full_name, 
  role, 
  is_admin,
  created_at
FROM profiles 
ORDER BY role, full_name;
```

**Vérifications :**
- ✅ Tous les utilisateurs ont un `role` (pas de NULL)
- ✅ Les utilisateurs avec `is_admin = true` ont `role = 'admin'`
- ✅ Les nouveaux utilisateurs ont `role = 'client'` par défaut

### 3. Vérifier les fonctions helper

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

## 🧪 Tests dans l'Application

### 1. Test de Connexion

1. **Connectez-vous** à l'application
2. **Vérifiez votre rôle** dans la console du navigateur (F12) :
   ```javascript
   // Dans la console
   // Le rôle devrait être visible dans les logs
   ```

### 2. Test de la Page Admin

1. **Allez sur** `/admin`
2. **Vérifiez** :
   - ✅ Si vous êtes admin : accès autorisé
   - ✅ Si vous êtes client : redirection vers `/`

### 3. Test de la Gestion des Utilisateurs

1. **Allez sur** `/admin/users`
2. **Vérifiez** :
   - ✅ La liste des utilisateurs s'affiche
   - ✅ Les rôles sont affichés avec des badges colorés
   - ✅ Les statistiques par rôle s'affichent

### 4. Test de Modification de Rôle

1. **Allez sur** `/admin/users`
2. **Sélectionnez un utilisateur**
3. **Changez son rôle** via le sélecteur
4. **Vérifiez** :
   - ✅ Le rôle est mis à jour immédiatement
   - ✅ Le badge de rôle change de couleur
   - ✅ Les statistiques se mettent à jour

### 5. Test des Guards

#### Test AdminGuard
```typescript
// Dans un composant
import { AdminGuard } from '@/components/AdminGuard'

export default function TestAdminPage() {
  return (
    <AdminGuard>
      <div>Visible seulement pour les admins</div>
    </AdminGuard>
  )
}
```

#### Test RoleGuard
```typescript
// Dans un composant
import { RoleGuard } from '@/components/RoleGuard'

export default function TestStaffPage() {
  return (
    <RoleGuard allowedRoles={['staff', 'admin']}>
      <div>Visible pour staff et admin</div>
    </RoleGuard>
  )
}
```

---

## 🎯 Scénarios de Test

### Scénario 1 : Créer un Utilisateur Staff

1. **Créez un nouveau compte** (ou utilisez un compte existant)
2. **Connectez-vous en tant qu'admin**
3. **Allez sur** `/admin/users`
4. **Trouvez l'utilisateur** et changez son rôle en "Staff"
5. **Déconnectez-vous** et reconnectez-vous avec ce compte
6. **Vérifiez** :
   - ✅ Le compte a le rôle "Staff"
   - ✅ Accès aux pages staff (si configurées)
   - ❌ Pas d'accès aux pages admin complètes

### Scénario 2 : Créer un Utilisateur Tech

1. **Suivez les mêmes étapes** que le scénario 1
2. **Changez le rôle en "Tech"**
3. **Vérifiez** :
   - ✅ Le compte a le rôle "Tech"
   - ✅ Accès aux pages tech (si configurées)
   - ❌ Pas d'accès aux pages admin complètes

### Scénario 3 : Rétrograder un Admin

1. **Trouvez un utilisateur admin**
2. **Changez son rôle en "Client"**
3. **Vérifiez** :
   - ✅ Le rôle est mis à jour
   - ✅ `is_admin` est mis à `false`
   - ✅ L'utilisateur n'a plus accès aux pages admin

---

## 🐛 Dépannage

### Problème : La colonne `role` n'existe pas

**Solution :**
```sql
-- Vérifiez que la migration a été exécutée
SELECT * FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'role';

-- Si elle n'existe pas, réexécutez la migration
-- Fichier : supabase/ADD_ROLE_SYSTEM.sql
```

### Problème : Les utilisateurs ont `role = NULL`

**Solution :**
```sql
-- Mettre à jour les utilisateurs sans rôle
UPDATE profiles 
SET role = CASE 
  WHEN is_admin = true THEN 'admin'
  ELSE 'client'
END
WHERE role IS NULL;
```

### Problème : Le rôle ne s'affiche pas dans l'application

**Solution :**
1. **Videz le cache** :
   ```javascript
   // Dans la console du navigateur
   localStorage.removeItem('role_cache')
   ```
2. **Rechargez la page** (Ctrl+F5)
3. **Vérifiez les logs** de la console pour les erreurs

### Problème : Les guards ne fonctionnent pas

**Solution :**
1. **Vérifiez que le provider est mis à jour** :
   ```typescript
   const { role } = useAuth()
   console.log('Current role:', role)
   ```
2. **Vérifiez que le guard est correctement importé** :
   ```typescript
   import { RoleGuard } from '@/components/RoleGuard'
   // ou
   import { AdminGuard } from '@/components/AdminGuard'
   ```

---

## ✅ Checklist de Validation

- [ ] La colonne `role` existe dans la table `profiles`
- [ ] Tous les utilisateurs ont un rôle (pas de NULL)
- [ ] Les admins existants ont `role = 'admin'`
- [ ] Les fonctions helper fonctionnent (`is_admin()`, `has_role()`, etc.)
- [ ] La page `/admin/users` affiche les rôles
- [ ] Les badges de rôle sont colorés correctement
- [ ] Le sélecteur de rôle fonctionne
- [ ] Les statistiques par rôle s'affichent
- [ ] Les guards fonctionnent (AdminGuard, RoleGuard)
- [ ] Le cache du rôle fonctionne
- [ ] Les nouveaux utilisateurs ont `role = 'client'` par défaut

---

## 📊 Requêtes Utiles

### Compter les utilisateurs par rôle

```sql
SELECT 
  role,
  COUNT(*) as count
FROM profiles
GROUP BY role
ORDER BY count DESC;
```

### Trouver tous les admins

```sql
SELECT id, full_name, email, role, is_admin
FROM profiles
WHERE role = 'admin'
ORDER BY created_at DESC;
```

### Trouver les utilisateurs sans rôle

```sql
SELECT id, full_name, role, is_admin
FROM profiles
WHERE role IS NULL;
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

-- Mettre un utilisateur en client
UPDATE profiles 
SET role = 'client', is_admin = false
WHERE id = 'user-uuid-here';
```

---

## 🎉 Prochaines Étapes

Une fois les tests validés :

1. **Configurer les permissions par rôle** dans les policies RLS
2. **Créer des pages spécifiques** pour chaque rôle (si nécessaire)
3. **Documenter les permissions** de chaque rôle
4. **Former les utilisateurs** sur le nouveau système

---

**Note** : Si vous rencontrez des problèmes, consultez les logs de la console du navigateur et les logs Supabase.
