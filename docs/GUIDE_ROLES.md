# 📋 Guide du Système de Rôles

## 🎯 Vue d'ensemble

Le système de rôles permet de gérer différents niveaux d'accès dans l'application :

- **client** : Utilisateur standard (par défaut)
- **staff** : Vendeur/Employé (peut gérer les commandes)
- **admin** : Administrateur (accès complet)
- **tech** : Technicien (accès technique/maintenance)

---

## 🚀 Migration

### 1. Exécuter la Migration SQL

```sql
-- Dans Supabase Dashboard > SQL Editor
-- Exécutez le fichier : supabase/ADD_ROLE_SYSTEM.sql
```

Cette migration :
- Ajoute la colonne `role` à la table `profiles`
- Migre les utilisateurs existants (`is_admin = true` → `role = 'admin'`)
- Crée des fonctions helper pour vérifier les rôles
- Met à jour les triggers

### 2. Vérifier la Migration

```sql
-- Vérifier que la colonne existe
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'role';

-- Vérifier les rôles actuels
SELECT id, full_name, role, is_admin 
FROM profiles 
ORDER BY role, full_name;
```

---

## 💻 Utilisation dans le Code

### Provider (useAuth)

```typescript
import { useAuth } from '@/components/providers'

function MyComponent() {
  const { user, role, isAdmin } = useAuth()
  
  // role peut être : 'client' | 'staff' | 'admin' | 'tech' | null
  // isAdmin est calculé automatiquement (role === 'admin')
  
  if (role === 'admin') {
    // Accès admin
  }
  
  if (role === 'staff' || role === 'admin') {
    // Accès staff ou admin
  }
}
```

### Guards de Protection

#### AdminGuard (Admin uniquement)
```typescript
import { AdminGuard } from '@/components/AdminGuard'

export default function AdminPage() {
  return (
    <AdminGuard>
      {/* Contenu accessible seulement aux admins */}
    </AdminGuard>
  )
}
```

#### RoleGuard (Rôles personnalisés)
```typescript
import { RoleGuard } from '@/components/RoleGuard'

// Accès pour staff et admin
export default function StaffPage() {
  return (
    <RoleGuard allowedRoles={['staff', 'admin']}>
      {/* Contenu accessible aux staff et admin */}
    </RoleGuard>
  )
}

// Accès pour tech et admin
export default function TechPage() {
  return (
    <RoleGuard allowedRoles={['tech', 'admin']}>
      {/* Contenu accessible aux tech et admin */}
    </RoleGuard>
  )
}
```

#### Guards Pré-définis
```typescript
import { StaffGuard, TechGuard } from '@/components/RoleGuard'

// StaffGuard = staff + admin
<StaffGuard>...</StaffGuard>

// TechGuard = tech + admin
<TechGuard>...</TechGuard>
```

---

## 🔐 Vérifications de Rôle

### Dans les Composants

```typescript
const { role } = useAuth()

// Vérifier un rôle spécifique
if (role === 'admin') {
  // Action admin
}

// Vérifier plusieurs rôles
if (role === 'staff' || role === 'admin') {
  // Action staff ou admin
}

// Utiliser un tableau
const allowedRoles = ['staff', 'admin']
if (role && allowedRoles.includes(role)) {
  // Action autorisée
}
```

### Dans les Requêtes Supabase

```typescript
// Vérifier le rôle avant une action
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', userId)
  .single()

if (profile?.role === 'admin') {
  // Action admin
}
```

---

## 🗄️ Fonctions SQL Helper

### is_admin()
```sql
-- Vérifie si l'utilisateur actuel est admin
SELECT public.is_admin();
```

### has_role(role)
```sql
-- Vérifie si l'utilisateur actuel a un rôle spécifique
SELECT public.has_role('staff');
SELECT public.has_role('admin');
```

### is_staff_or_admin()
```sql
-- Vérifie si l'utilisateur est staff ou admin
SELECT public.is_staff_or_admin();
```

### is_tech_or_admin()
```sql
-- Vérifie si l'utilisateur est tech ou admin
SELECT public.is_tech_or_admin();
```

---

## 👥 Gestion des Rôles

### Créer un Admin

```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = 'user-uuid-here';
```

### Créer un Staff

```sql
UPDATE public.profiles 
SET role = 'staff' 
WHERE id = 'user-uuid-here';
```

### Créer un Tech

```sql
UPDATE public.profiles 
SET role = 'tech' 
WHERE id = 'user-uuid-here';
```

### Réinitialiser à Client

```sql
UPDATE public.profiles 
SET role = 'client' 
WHERE id = 'user-uuid-here';
```

---

## 📊 Permissions par Rôle

### Client
- ✅ Voir les produits
- ✅ Passer des commandes
- ✅ Gérer son profil
- ✅ Voir ses commandes
- ❌ Accès admin

### Staff
- ✅ Toutes les permissions client
- ✅ Voir les commandes
- ✅ Modifier le statut des commandes
- ✅ Gérer les paiements
- ❌ Gérer les produits
- ❌ Gérer les catégories
- ❌ Gérer les utilisateurs

### Admin
- ✅ Toutes les permissions
- ✅ Gérer les produits
- ✅ Gérer les catégories
- ✅ Gérer les utilisateurs
- ✅ Gérer les commandes
- ✅ Gérer les paiements
- ✅ Statistiques

### Tech
- ✅ Toutes les permissions client
- ✅ Accès technique/maintenance
- ✅ Voir les logs
- ✅ Gérer les configurations
- ❌ Gérer les utilisateurs
- ❌ Gérer les produits

---

## 🔄 Migration depuis is_admin

### Ancien Code
```typescript
const { isAdmin } = useAuth()

if (isAdmin) {
  // Action admin
}
```

### Nouveau Code
```typescript
const { role, isAdmin } = useAuth()

// isAdmin est toujours disponible pour compatibilité
if (isAdmin) {
  // Action admin
}

// Ou utiliser role directement
if (role === 'admin') {
  // Action admin
}
```

---

## ⚠️ Notes Importantes

1. **Compatibilité** : Le champ `is_admin` est conservé mais ne doit plus être utilisé
2. **Par défaut** : Tous les nouveaux utilisateurs ont `role = 'client'`
3. **Migration automatique** : Les utilisateurs existants avec `is_admin = true` ont été migrés vers `role = 'admin'`
4. **Cache** : Le rôle est mis en cache pour améliorer les performances
5. **RLS** : Les policies RLS utilisent les nouvelles fonctions de rôle

---

## 🐛 Dépannage

### Le rôle ne s'affiche pas
1. Vérifiez que la migration SQL a été exécutée
2. Videz le cache : `localStorage.removeItem('role_cache')`
3. Rechargez la page

### Erreur "role is not defined"
1. Vérifiez que `components/providers.tsx` a été mis à jour
2. Vérifiez que le type `UserRole` est importé

### L'utilisateur n'a pas accès
1. Vérifiez le rôle dans Supabase : `SELECT role FROM profiles WHERE id = 'user-id'`
2. Vérifiez que le guard utilise les bons rôles
3. Vérifiez les logs de la console

---

## 📝 Exemples Complets

### Page Admin
```typescript
import { AdminGuard } from '@/components/AdminGuard'

export default function AdminPage() {
  return (
    <AdminGuard>
      <div>Contenu admin</div>
    </AdminGuard>
  )
}
```

### Page Staff
```typescript
import { StaffGuard } from '@/components/RoleGuard'

export default function StaffPage() {
  return (
    <StaffGuard>
      <div>Contenu staff</div>
    </StaffGuard>
  )
}
```

### Composant avec Vérification Conditionnelle
```typescript
import { useAuth } from '@/components/providers'

export default function MyComponent() {
  const { role } = useAuth()
  
  return (
    <div>
      {role === 'admin' && <AdminPanel />}
      {role === 'staff' && <StaffPanel />}
      {role === 'client' && <ClientPanel />}
    </div>
  )
}
```

---

**Note** : Pour toute question ou problème, consultez les logs ou contactez l'équipe de développement.
