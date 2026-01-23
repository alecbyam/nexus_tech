# 🚀 Guide de Déploiement sur Vercel

## ✅ Prérequis

1. **Compte GitHub** : Le code doit être poussé sur GitHub
2. **Compte Vercel** : Créez un compte sur [vercel.com](https://vercel.com)
3. **Projet Supabase** : Votre projet Supabase doit être configuré

---

## 📋 Étapes de Déploiement

### 1. Connecter GitHub à Vercel

1. **Allez sur [vercel.com](https://vercel.com)**
2. **Cliquez sur "Add New Project"**
3. **Importez votre repository GitHub** : `alecbyam/nexus_tech`
4. **Sélectionnez le repository** et cliquez sur "Import"

### 2. Configuration du Projet

Vercel détectera automatiquement Next.js. Configurez :

#### **Framework Preset**
- ✅ Next.js (détecté automatiquement)

#### **Root Directory**
- Laissez vide (racine du projet)

#### **Build Command**
- `npm run build` (par défaut)

#### **Output Directory**
- `.next` (par défaut)

#### **Install Command**
- `npm install` (par défaut)

### 3. Variables d'Environnement

**⚠️ IMPORTANT** : Ajoutez ces variables dans Vercel :

1. **Allez dans "Environment Variables"**
2. **Ajoutez les variables suivantes** :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key (optionnel)
WHATSAPP_PHONE=243818510311
```

**Comment obtenir les clés Supabase :**
- Allez sur [supabase.com/dashboard](https://supabase.com/dashboard)
- Sélectionnez votre projet
- Allez dans **Settings** → **API**
- Copiez :
  - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (optionnel, pour les opérations admin)

### 4. Déploiement

1. **Cliquez sur "Deploy"**
2. **Attendez la fin du build** (2-5 minutes)
3. **Votre application sera accessible** sur `https://votre-projet.vercel.app`

---

## 🔧 Configuration Post-Déploiement

### 1. Exécuter les Migrations SQL

**⚠️ CRITIQUE** : Vous devez exécuter les migrations SQL dans Supabase :

1. **Ouvrez Supabase Dashboard** → **SQL Editor**
2. **Exécutez** : `supabase/COMPLETE_MIGRATION.sql`
3. **Vérifiez** que toutes les tables sont créées

### 2. Créer un Compte Admin

1. **Créez un compte** via `/auth/signup`
2. **Exécutez** dans Supabase SQL Editor :
   ```sql
   UPDATE profiles 
   SET is_admin = true 
   WHERE id = 'votre-user-id';
   ```

Ou utilisez `supabase/CREATE_ADMIN.sql` en remplaçant l'email.

### 3. Configurer les URLs de Redirection

Dans **Supabase Dashboard** → **Authentication** → **URL Configuration** :

**Site URL :**
```
https://votre-projet.vercel.app
```

**Redirect URLs :**
```
https://votre-projet.vercel.app/auth/callback
https://votre-projet.vercel.app/**
```

---

## 🔄 Déploiements Automatiques

Vercel déploie automatiquement :
- ✅ **Chaque push sur `main`** → Production
- ✅ **Chaque pull request** → Preview

---

## 🐛 Dépannage

### Erreur "Internal Server Error"

1. **Vérifiez les variables d'environnement** dans Vercel
2. **Vérifiez les logs** dans Vercel Dashboard → **Deployments** → **Functions**
3. **Vérifiez que les migrations SQL sont exécutées**

### Erreur "Missing Supabase credentials"

1. **Vérifiez** que `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont définis
2. **Redéployez** après avoir ajouté les variables

### Erreur de Build

1. **Vérifiez les logs** dans Vercel Dashboard
2. **Vérifiez** que `package.json` contient toutes les dépendances
3. **Vérifiez** que `next.config.js` est correct

### Les migrations ne sont pas exécutées

- ⚠️ **Les migrations SQL doivent être exécutées manuellement** dans Supabase Dashboard
- Vercel ne peut pas exécuter les migrations automatiquement

---

## 📊 Monitoring

### Vercel Analytics

1. **Allez dans** Vercel Dashboard → **Analytics**
2. **Activez** Vercel Analytics (optionnel, payant)

### Logs

1. **Allez dans** Vercel Dashboard → **Deployments**
2. **Cliquez sur un déploiement** → **Functions** pour voir les logs

---

## 🔐 Sécurité

### Variables d'Environnement

- ✅ **Ne jamais** commiter `.env.local` (déjà dans `.gitignore`)
- ✅ **Utiliser** les variables d'environnement Vercel pour les secrets
- ✅ **Ne jamais** exposer `SUPABASE_SERVICE_ROLE_KEY` côté client

### RLS (Row Level Security)

- ✅ **Vérifiez** que RLS est activé sur toutes les tables
- ✅ **Testez** les permissions avant le déploiement

---

## 🚀 URLs Importantes

Après le déploiement :

- **Production** : `https://votre-projet.vercel.app`
- **Admin Dashboard** : `https://votre-projet.vercel.app/admin`
- **Catalogue** : `https://votre-projet.vercel.app/catalog`
- **Authentification** : `https://votre-projet.vercel.app/auth`

---

## 📝 Checklist de Déploiement

- [ ] Code poussé sur GitHub
- [ ] Projet créé sur Vercel
- [ ] Variables d'environnement configurées
- [ ] Build réussi
- [ ] Migrations SQL exécutées dans Supabase
- [ ] Compte admin créé
- [ ] URLs de redirection configurées dans Supabase
- [ ] Application testée en production
- [ ] RLS et permissions vérifiées

---

## 🆘 Support

En cas de problème :
1. **Vérifiez les logs** Vercel
2. **Vérifiez les logs** Supabase
3. **Consultez** la documentation Vercel : [vercel.com/docs](https://vercel.com/docs)
4. **Consultez** la documentation Supabase : [supabase.com/docs](https://supabase.com/docs)

---

**🎉 Félicitations ! Votre application est maintenant en ligne !**
