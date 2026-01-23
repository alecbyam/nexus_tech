# 🔗 Configuration Redirect URLs - Votre Projet

## 📍 Votre URL Vercel

**URL de Preview** :
```
https://nexus-tech-368hztajk-alecbyams-projects.vercel.app
```

**URL de Production** (si vous avez un domaine personnalisé) :
```
https://nexus-tech.vercel.app
```
*(ou votre domaine personnalisé)*

---

## ⚙️ Configuration dans Supabase

### Étape 1 : Accéder à la Configuration

1. **Allez sur** [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Sélectionnez votre projet** Supabase
3. **Allez dans** : **Authentication** → **URL Configuration**
   - Ou : **Settings** → **Authentication** → **URL Configuration**

### Étape 2 : Configurer le Site URL

**Dans "Site URL"**, ajoutez votre URL de production principale :

```
https://nexus-tech.vercel.app
```

*(Si vous n'avez pas encore de domaine personnalisé, utilisez l'URL de preview pour l'instant)*

### Étape 3 : Configurer les Redirect URLs

**Dans "Redirect URLs"**, ajoutez ces URLs (une par ligne) :

```
https://nexus-tech-368hztajk-alecbyams-projects.vercel.app/auth/callback
https://nexus-tech-368hztajk-alecbyams-projects.vercel.app/**
https://nexus-tech.vercel.app/auth/callback
https://nexus-tech.vercel.app/**
http://localhost:3000/auth/callback
http://localhost:3000/**
```

### Étape 4 : Sauvegarder

1. **Cliquez sur "Save"** ou "Update"
2. **Attendez** quelques secondes pour que les changements soient appliqués

---

## 📋 Configuration Complète

### Site URL
```
https://nexus-tech.vercel.app
```
*(Ou votre URL de preview si vous n'avez pas encore de domaine personnalisé)*

### Redirect URLs (à copier-coller)
```
https://nexus-tech-368hztajk-alecbyams-projects.vercel.app/auth/callback
https://nexus-tech-368hztajk-alecbyams-projects.vercel.app/**
https://nexus-tech.vercel.app/auth/callback
https://nexus-tech.vercel.app/**
http://localhost:3000/auth/callback
http://localhost:3000/**
```

---

## 🔍 Explication

### Pourquoi plusieurs URLs ?

1. **URL de Preview** (`nexus-tech-368hztajk-alecbyams-projects.vercel.app`)
   - URL générée automatiquement par Vercel pour les previews
   - Utile pour tester les déploiements

2. **URL de Production** (`nexus-tech.vercel.app`)
   - URL principale de votre application
   - Utilisée en production

3. **Localhost** (`localhost:3000`)
   - Pour le développement local
   - Permet de tester l'authentification en local

### Que signifie `/**` ?

- `/**` autorise **toutes les sous-routes** du domaine
- Par exemple : `/auth/callback`, `/admin`, `/products/123`, etc.
- Plus pratique que d'ajouter chaque URL individuellement

---

## ✅ Vérification

### Test 1 : Authentification en Production

1. **Allez sur** : `https://nexus-tech-368hztajk-alecbyams-projects.vercel.app/auth`
2. **Cliquez sur "Se connecter avec Google"** ou **"Se connecter avec GitHub"**
3. **Vérifiez** que vous êtes redirigé vers `/auth/callback`
4. **Vérifiez** que vous êtes ensuite redirigé vers la page d'accueil

### Test 2 : Authentification en Local

1. **Lancez** : `npm run dev`
2. **Allez sur** : `http://localhost:3000/auth`
3. **Testez** l'authentification
4. **Vérifiez** que la redirection fonctionne

---

## 🐛 Dépannage

### Erreur : "redirect_uri_mismatch"

**Cause** : L'URL de redirection n'est pas dans la liste

**Solution** :
1. Vérifiez que l'URL exacte est dans les Redirect URLs
2. Vérifiez qu'il n'y a pas d'espace ou de `/` à la fin
3. Vérifiez que l'URL commence par `https://` (pas `http://`)

### Erreur : "Invalid redirect URL"

**Cause** : Format d'URL incorrect

**Solution** :
1. Vérifiez que l'URL est correctement formatée
2. Vérifiez qu'il n'y a pas de typo
3. Vérifiez que le domaine correspond

### L'authentification ne fonctionne pas

**Vérifications** :
1. ✅ Les Redirect URLs sont bien sauvegardées dans Supabase
2. ✅ L'URL dans le code correspond à une des Redirect URLs
3. ✅ Les variables d'environnement sont configurées dans Vercel
4. ✅ Les providers OAuth (Google, GitHub) sont configurés dans Supabase

---

## 🔐 Sécurité

### Bonnes Pratiques

- ✅ **Utilisez HTTPS** pour la production (obligatoire)
- ✅ **Limitez les Redirect URLs** aux domaines que vous contrôlez
- ✅ **Testez** les URLs après configuration
- ✅ **Mettez à jour** les URLs si vous changez de domaine

### URLs à Éviter

- ❌ **Ne pas utiliser** `http://` pour la production
- ❌ **Ne pas autoriser** tous les domaines (`*`)
- ❌ **Ne pas oublier** de mettre à jour après changement de domaine

---

## 📝 Notes Importantes

### URL de Preview vs Production

- **URL de Preview** : Générée automatiquement par Vercel, change à chaque déploiement
- **URL de Production** : URL principale, stable

**Recommandation** : Configurez les deux pour être sûr que l'authentification fonctionne dans tous les cas.

### Mise à Jour des URLs

Si vous changez de domaine ou d'URL Vercel :
1. **Mettez à jour** les Redirect URLs dans Supabase
2. **Mettez à jour** le Site URL si nécessaire
3. **Testez** l'authentification après les changements

---

## 🚀 Prochaines Étapes

Après avoir configuré les Redirect URLs :

1. ✅ **Testez l'authentification** sur votre site Vercel
2. ✅ **Vérifiez** que les redirections fonctionnent
3. ✅ **Créez un compte admin** si nécessaire
4. ✅ **Testez** toutes les fonctionnalités d'authentification

---

**✅ Une fois configuré, l'authentification devrait fonctionner correctement !**
