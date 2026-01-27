# 🔐 Variables d'Environnement Vercel - ONATECH

## 📋 Liste Complète des Variables

### ✅ Variables OBLIGATOIRES (Production)

Ces variables **DOIVENT** être configurées dans Vercel pour que l'application fonctionne :

| Variable | Description | Exemple | Environnements |
|----------|-------------|---------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de votre projet Supabase | `https://xxxxx.supabase.co` | **Production, Preview, Development** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique anonyme Supabase | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | **Production, Preview, Development** |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role (pour création utilisateurs admin) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | **Production** (optionnel mais recommandé) |
| `WHATSAPP_PHONE` | Numéro WhatsApp pour les commandes | `243818510311` | **Production, Preview, Development** |

---

### 🔍 Variables OPTIONNELLES (SEO)

Ces variables sont pour la vérification SEO des moteurs de recherche :

| Variable | Description | Exemple | Environnements |
|----------|-------------|---------|----------------|
| `NEXT_PUBLIC_GOOGLE_VERIFICATION` | Code de vérification Google Search Console | `abc123def456` | **Production** (optionnel) |
| `NEXT_PUBLIC_BING_VERIFICATION` | Code de vérification Bing Webmaster | `xyz789` | **Production** (optionnel) |
| `NEXT_PUBLIC_YANDEX_VERIFICATION` | Code de vérification Yandex Webmaster | `yandex123` | **Production** (optionnel) |
| `NEXT_PUBLIC_BAIDU_VERIFICATION` | Code de vérification Baidu Webmaster | `baidu456` | **Production** (optionnel) |
| `NEXT_PUBLIC_PINTEREST_VERIFICATION` | Code de vérification Pinterest | `pinterest789` | **Production** (optionnel) |
| `NEXT_PUBLIC_FACEBOOK_VERIFICATION` | Code de vérification Facebook | `facebook123` | **Production** (optionnel) |

---

## 🚀 Configuration dans Vercel

### Étape 1 : Accéder aux Variables d'Environnement

1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet **ONATECH**
4. Allez dans **Settings** → **Environment Variables**

### Étape 2 : Ajouter les Variables

Pour chaque variable, cliquez sur **"Add New"** et remplissez :

#### ✅ Variables OBLIGATOIRES

**1. `NEXT_PUBLIC_SUPABASE_URL`**
- **Value** : `https://njgmuhrkbwdeijnbqync.supabase.co` (remplacez par votre URL)
- **Environments** : ✅ Production, ✅ Preview, ✅ Development

**2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`**
- **Value** : `sb_publishable_oo2XgOSgK79l-Ywwr9DXxQ_8JEFTp_B` (remplacez par votre clé)
- **Environments** : ✅ Production, ✅ Preview, ✅ Development

**3. `SUPABASE_SERVICE_ROLE_KEY`**
- **Value** : Votre clé service role (trouvable dans Supabase Dashboard → Settings → API)
- **Environments** : ✅ Production uniquement
- ⚠️ **IMPORTANT** : Cette clé a des permissions complètes. Ne l'exposez JAMAIS côté client !

**4. `WHATSAPP_PHONE`**
- **Value** : `243818510311`
- **Environments** : ✅ Production, ✅ Preview, ✅ Development

#### 🔍 Variables OPTIONNELLES (SEO)

**5. `NEXT_PUBLIC_GOOGLE_VERIFICATION`**
- **Value** : Code de vérification Google (sans les balises `<meta>`)
- **Environments** : ✅ Production uniquement
- **Comment obtenir** : [Google Search Console](https://search.google.com/search-console)

**6. `NEXT_PUBLIC_BING_VERIFICATION`**
- **Value** : Code de vérification Bing
- **Environments** : ✅ Production uniquement
- **Comment obtenir** : [Bing Webmaster Tools](https://www.bing.com/webmasters)

**7. `NEXT_PUBLIC_YANDEX_VERIFICATION`**
- **Value** : Code de vérification Yandex
- **Environments** : ✅ Production uniquement
- **Comment obtenir** : [Yandex Webmaster](https://webmaster.yandex.com)

**8. `NEXT_PUBLIC_BAIDU_VERIFICATION`**
- **Value** : Code de vérification Baidu
- **Environments** : ✅ Production uniquement
- **Comment obtenir** : [Baidu Webmaster](https://ziyuan.baidu.com)

**9. `NEXT_PUBLIC_PINTEREST_VERIFICATION`**
- **Value** : Code de vérification Pinterest
- **Environments** : ✅ Production uniquement
- **Comment obtenir** : [Pinterest Business](https://business.pinterest.com)

**10. `NEXT_PUBLIC_FACEBOOK_VERIFICATION`**
- **Value** : Code de vérification Facebook
- **Environments** : ✅ Production uniquement
- **Comment obtenir** : [Facebook Business](https://business.facebook.com)

---

## 📝 Exemple de Configuration Complète

### Configuration Minimale (Production)

```env
NEXT_PUBLIC_SUPABASE_URL=https://njgmuhrkbwdeijnbqync.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_oo2XgOSgK79l-Ywwr9DXxQ_8JEFTp_B
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
WHATSAPP_PHONE=243818510311
```

### Configuration Complète (avec SEO)

```env
# Supabase (Obligatoire)
NEXT_PUBLIC_SUPABASE_URL=https://njgmuhrkbwdeijnbqync.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_oo2XgOSgK79l-Ywwr9DXxQ_8JEFTp_B
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# WhatsApp (Obligatoire)
WHATSAPP_PHONE=243818510311

# SEO (Optionnel)
NEXT_PUBLIC_GOOGLE_VERIFICATION=abc123def456
NEXT_PUBLIC_BING_VERIFICATION=xyz789
NEXT_PUBLIC_YANDEX_VERIFICATION=yandex123
NEXT_PUBLIC_BAIDU_VERIFICATION=baidu456
NEXT_PUBLIC_PINTEREST_VERIFICATION=pinterest789
NEXT_PUBLIC_FACEBOOK_VERIFICATION=facebook123
```

---

## 🔍 Comment Obtenir les Clés Supabase

### 1. Allez sur Supabase Dashboard

1. **Connectez-vous** sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Sélectionnez votre projet**

### 2. Récupérez les Variables

1. **Allez dans** : **Settings** → **API**

#### **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
```
https://xxxxxxxxxxxxx.supabase.co
```

#### **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eHgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTg3NjgwMCwiZXhwIjoxOTYxNDUyODAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eHgiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQ1ODc2ODAwLCJleHAiOjE5NjE0NTI4MDB9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **ATTENTION** : La `service_role` key a des **permissions complètes**. Ne l'exposez **JAMAIS** côté client !

---

## ✅ Vérification Post-Configuration

### 1. Redéployer l'Application

Après avoir ajouté/modifié les variables :
1. Allez dans **Deployments**
2. Cliquez sur **"Redeploy"** sur le dernier déploiement
3. Ou poussez un nouveau commit sur GitHub

### 2. Vérifier les Logs

1. Allez dans **Deployments** → Sélectionnez un déploiement
2. Cliquez sur **"View Function Logs"**
3. Vérifiez qu'il n'y a pas d'erreurs liées aux variables d'environnement

### 3. Tester l'Application

1. Ouvrez votre application déployée
2. Testez la connexion (auth)
3. Testez l'ajout au panier
4. Testez la commande WhatsApp
5. Testez les fonctionnalités admin (si admin)

---

## 🐛 Dépannage

### ❌ Erreur : "Missing Supabase environment variables"

**Solution** :
1. Vérifiez que `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont bien définies
2. Vérifiez que les variables sont activées pour **Production, Preview, Development**
3. **Redéployez** l'application après avoir ajouté les variables

### ❌ Erreur : "Invalid API key"

**Solution** :
1. Vérifiez que vous avez copié la **clé complète** (sans espaces)
2. Vérifiez que vous utilisez la bonne clé (`anon` pour le client, `service_role` pour le serveur)
3. Vérifiez que le projet Supabase est actif

### ❌ Erreur : "Cannot create user" (admin)

**Solution** :
1. Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est bien définie dans **Production**
2. Vérifiez que la clé est correcte (copie complète, sans espaces)
3. **Redéployez** l'application

### ❌ Les modifications ne sont pas visibles

**Solution** :
1. Vérifiez que vous avez **redéployé** après avoir ajouté/modifié les variables
2. Videz le cache du navigateur (Ctrl+F5)
3. Vérifiez les logs de déploiement dans Vercel

---

## 🔒 Sécurité

### ✅ Bonnes Pratiques

- ✅ Utiliser des variables d'environnement pour toutes les clés sensibles
- ✅ Ne jamais commiter les fichiers `.env*` (déjà dans `.gitignore`)
- ✅ Utiliser `NEXT_PUBLIC_` uniquement pour les variables accessibles côté client
- ✅ Utiliser `SUPABASE_SERVICE_ROLE_KEY` uniquement côté serveur (API routes)

### ❌ À NE PAS FAIRE

- ❌ **Ne jamais** exposer `SUPABASE_SERVICE_ROLE_KEY` côté client
- ❌ **Ne jamais** commiter les clés dans le code source
- ❌ **Ne jamais** partager les clés publiquement
- ❌ **Ne jamais** utiliser `service_role` dans le code client

---

## 📚 Documentation

- **Vercel Environment Variables** : [vercel.com/docs/concepts/projects/environment-variables](https://vercel.com/docs/concepts/projects/environment-variables)
- **Next.js Environment Variables** : [nextjs.org/docs/basic-features/environment-variables](https://nextjs.org/docs/basic-features/environment-variables)
- **Supabase Docs** : [supabase.com/docs](https://supabase.com/docs)

---

## 🆘 Support

Si vous avez des problèmes :
1. Vérifiez que toutes les variables obligatoires sont définies
2. Vérifiez que les variables sont activées pour les bons environnements
3. Redéployez l'application
4. Vérifiez les logs dans Vercel
5. Vérifiez les logs dans la console du navigateur

---

**✅ Une fois toutes les variables configurées, votre application sera prête pour la production !**
