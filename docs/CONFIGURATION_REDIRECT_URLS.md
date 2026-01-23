# 🔗 Configuration des Redirect URLs dans Supabase

## 📍 Où Configurer les Redirect URLs

### 1. Accéder à la Configuration

1. **Allez sur [supabase.com/dashboard](https://supabase.com/dashboard)**
2. **Sélectionnez votre projet** Supabase
3. **Allez dans** : **Authentication** → **URL Configuration**
   - Ou directement : **Settings** → **Authentication** → **URL Configuration**

### 2. URLs à Configurer

#### **Site URL** (URL principale de votre site)

```
https://votre-projet.vercel.app
```

**Exemple** :
```
https://nexus-tech.vercel.app
```

#### **Redirect URLs** (URLs autorisées pour les redirections)

Ajoutez ces URLs (une par ligne) :

```
https://votre-projet.vercel.app/auth/callback
https://votre-projet.vercel.app/**
http://localhost:3000/auth/callback
http://localhost:3000/**
```

**Exemple complet** :
```
https://nexus-tech.vercel.app/auth/callback
https://nexus-tech.vercel.app/**
http://localhost:3000/auth/callback
http://localhost:3000/**
```

---

## 📝 Explication des URLs

### Site URL
- **C'est l'URL principale** de votre application en production
- Utilisée comme URL par défaut pour les redirections
- **Une seule URL** autorisée

### Redirect URLs
- **Liste des URLs autorisées** pour les redirections après authentification
- **Plusieurs URLs** peuvent être ajoutées (une par ligne)
- Utilisez `**` pour autoriser toutes les sous-routes

### URLs Recommandées

#### Pour la Production (Vercel)
```
https://votre-projet.vercel.app/auth/callback
https://votre-projet.vercel.app/**
```

#### Pour le Développement Local
```
http://localhost:3000/auth/callback
http://localhost:3000/**
```

#### Si vous avez un Domaine Personnalisé
```
https://votre-domaine.com/auth/callback
https://votre-domaine.com/**
```

---

## 🔧 Étapes Détaillées

### Étape 1 : Trouver votre URL Vercel

1. **Allez sur [vercel.com/dashboard](https://vercel.com/dashboard)**
2. **Sélectionnez votre projet**
3. **Copiez l'URL** de déploiement (ex: `https://nexus-tech.vercel.app`)

### Étape 2 : Configurer dans Supabase

1. **Ouvrez Supabase Dashboard**
2. **Allez dans** : **Authentication** → **URL Configuration**
3. **Dans "Site URL"** :
   - Collez votre URL Vercel : `https://votre-projet.vercel.app`
4. **Dans "Redirect URLs"** :
   - Cliquez sur **"Add URL"** ou ajoutez une URL par ligne
   - Ajoutez :
     ```
     https://votre-projet.vercel.app/auth/callback
     https://votre-projet.vercel.app/**
     http://localhost:3000/auth/callback
     http://localhost:3000/**
     ```
5. **Cliquez sur "Save"**

---

## ✅ Vérification

### Vérifier que la Configuration est Correcte

1. **Testez l'authentification** sur votre site Vercel
2. **Connectez-vous** avec Google ou GitHub
3. **Vérifiez** que vous êtes redirigé vers `/auth/callback`
4. **Vérifiez** que vous êtes ensuite redirigé vers la page d'accueil

### Erreurs Courantes

#### ❌ Erreur : "redirect_uri_mismatch"

**Cause** : L'URL de redirection n'est pas dans la liste des Redirect URLs autorisées

**Solution** :
1. Vérifiez que l'URL exacte est dans la liste des Redirect URLs
2. Vérifiez qu'il n'y a pas d'espace ou de caractère supplémentaire
3. Vérifiez que l'URL commence par `https://` (pas `http://` pour la production)

#### ❌ Erreur : "Invalid redirect URL"

**Cause** : L'URL de redirection n'est pas valide

**Solution** :
1. Vérifiez que l'URL est correctement formatée
2. Vérifiez que le domaine correspond à votre Site URL
3. Vérifiez qu'il n'y a pas de typo

---

## 🔐 Sécurité

### Bonnes Pratiques

- ✅ **Utilisez HTTPS** pour la production (obligatoire)
- ✅ **Limitez les Redirect URLs** aux domaines que vous contrôlez
- ✅ **N'utilisez pas `**`** pour tous les domaines (sécurité)
- ✅ **Testez** les URLs de redirection après configuration

### URLs à Éviter

- ❌ **Ne pas utiliser** `http://` pour la production
- ❌ **Ne pas autoriser** tous les domaines (`*`)
- ❌ **Ne pas oublier** de mettre à jour les URLs après changement de domaine

---

## 📋 Exemple Complet

### Configuration pour Production + Développement

**Site URL** :
```
https://nexus-tech.vercel.app
```

**Redirect URLs** :
```
https://nexus-tech.vercel.app/auth/callback
https://nexus-tech.vercel.app/**
http://localhost:3000/auth/callback
http://localhost:3000/**
```

### Configuration pour Domaine Personnalisé

**Site URL** :
```
https://nexustech.com
```

**Redirect URLs** :
```
https://nexustech.com/auth/callback
https://nexustech.com/**
https://www.nexustech.com/auth/callback
https://www.nexustech.com/**
http://localhost:3000/auth/callback
http://localhost:3000/**
```

---

## 🆘 Dépannage

### Comment Trouver l'URL Exacte de Redirection

1. **Ouvrez la console du navigateur** (F12)
2. **Tentez de vous connecter**
3. **Regardez l'erreur** dans la console
4. **Copiez l'URL** mentionnée dans l'erreur
5. **Ajoutez-la** dans les Redirect URLs

### Vérifier les URLs Actuelles

Dans votre code (`app/auth/page.tsx`), vérifiez :

```typescript
redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
```

Cette URL doit correspondre à une des Redirect URLs configurées.

---

## 📚 Documentation

- **Supabase Auth Docs** : [supabase.com/docs/guides/auth](https://supabase.com/docs/guides/auth)
- **OAuth Configuration** : [supabase.com/docs/guides/auth/social-login](https://supabase.com/docs/guides/auth/social-login)

---

**✅ Une fois configuré, l'authentification devrait fonctionner correctement !**
