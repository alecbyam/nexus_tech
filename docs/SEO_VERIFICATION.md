# Configuration SEO - Codes de Vérification

Ce guide explique comment configurer les codes de vérification pour les différents moteurs de recherche et outils de webmaster.

## 🎯 Moteurs de Recherche Supportés

L'application supporte les codes de vérification pour :
- ✅ **Google Search Console**
- ✅ **Bing Webmaster Tools** (Yahoo)
- ✅ **Yandex Webmaster**
- ✅ **Baidu** (Chine)
- ✅ **Pinterest**
- ✅ **Facebook Domain Verification**

## 📋 Configuration

### 1. Variables d'Environnement

Ajoutez les codes de vérification dans votre fichier `.env.local` :

```env
# Google Search Console
NEXT_PUBLIC_GOOGLE_VERIFICATION=votre_code_google_ici

# Bing Webmaster Tools (Yahoo)
NEXT_PUBLIC_BING_VERIFICATION=votre_code_bing_ici

# Yandex Webmaster
NEXT_PUBLIC_YANDEX_VERIFICATION=votre_code_yandex_ici

# Baidu (optionnel)
NEXT_PUBLIC_BAIDU_VERIFICATION=votre_code_baidu_ici

# Pinterest (optionnel)
NEXT_PUBLIC_PINTEREST_VERIFICATION=votre_code_pinterest_ici

# Facebook Domain Verification (optionnel)
NEXT_PUBLIC_FACEBOOK_VERIFICATION=votre_code_facebook_ici
```

### 2. Configuration sur Vercel

Pour la production, ajoutez ces variables dans **Vercel** :
1. Allez dans **Settings** → **Environment Variables**
2. Ajoutez chaque variable avec le préfixe `NEXT_PUBLIC_`
3. Sélectionnez **Production**, **Preview**, et **Development**

## 🔍 Obtenir les Codes de Vérification

### Google Search Console

1. Allez sur [Google Search Console](https://search.google.com/search-console)
2. Ajoutez votre propriété (URL de votre site)
3. Choisissez **"Balise meta"** comme méthode de vérification
4. Copiez le code de vérification (ex: `abc123def456...`)
5. Ajoutez-le à `NEXT_PUBLIC_GOOGLE_VERIFICATION`

**Exemple :**
```html
<meta name="google-site-verification" content="abc123def456..." />
```

### Bing Webmaster Tools (Yahoo)

1. Allez sur [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Ajoutez votre site
3. Choisissez **"Meta tag"** comme méthode de vérification
4. Copiez le code de vérification
5. Ajoutez-le à `NEXT_PUBLIC_BING_VERIFICATION`

**Exemple :**
```html
<meta name="msvalidate.01" content="xyz789..." />
```

### Yandex Webmaster

1. Allez sur [Yandex Webmaster](https://webmaster.yandex.com)
2. Ajoutez votre site
3. Choisissez **"Meta tag"** comme méthode de vérification
4. Copiez le code de vérification
5. Ajoutez-le à `NEXT_PUBLIC_YANDEX_VERIFICATION`

**Exemple :**
```html
<meta name="yandex-verification" content="yandex123..." />
```

### Baidu (Chine)

1. Allez sur [Baidu Webmaster](https://ziyuan.baidu.com)
2. Ajoutez votre site
3. Choisissez **"Meta tag"** comme méthode de vérification
4. Copiez le code de vérification
5. Ajoutez-le à `NEXT_PUBLIC_BAIDU_VERIFICATION`

**Exemple :**
```html
<meta name="baidu-site-verification" content="baidu456..." />
```

### Pinterest

1. Allez sur [Pinterest Business](https://business.pinterest.com)
2. Accédez aux paramètres de vérification
3. Choisissez **"Meta tag"** comme méthode
4. Copiez le code de vérification
5. Ajoutez-le à `NEXT_PUBLIC_PINTEREST_VERIFICATION`

**Exemple :**
```html
<meta name="p:domain_verify" content="pinterest789..." />
```

### Facebook Domain Verification

1. Allez sur [Facebook Business Manager](https://business.facebook.com)
2. Accédez aux paramètres de domaine
3. Choisissez **"Meta tag"** comme méthode de vérification
4. Copiez le code de vérification
5. Ajoutez-le à `NEXT_PUBLIC_FACEBOOK_VERIFICATION`

**Exemple :**
```html
<meta name="facebook-domain-verification" content="facebook123..." />
```

## ✅ Vérification

### Comment Vérifier

1. **Déployez votre application** avec les codes de vérification
2. **Retournez dans l'outil de webmaster** correspondant
3. **Cliquez sur "Vérifier"** ou "Verify"
4. Le statut devrait passer à **"Vérifié"** ou **"Verified"**

### Vérification Manuelle

Vous pouvez vérifier que les meta tags sont présents en :
1. Ouvrant votre site en production
2. Faisant un clic droit → **"Afficher le code source"** (View Page Source)
3. Recherchant les meta tags de vérification dans le `<head>`

**Exemple de ce que vous devriez voir :**
```html
<head>
  ...
  <meta name="google-site-verification" content="votre_code" />
  <meta name="msvalidate.01" content="votre_code" />
  <meta name="yandex-verification" content="votre_code" />
  ...
</head>
```

## 🔧 Dépannage

### Les codes ne s'affichent pas

1. **Vérifiez les variables d'environnement** :
   - Les variables doivent commencer par `NEXT_PUBLIC_`
   - Elles doivent être définies dans `.env.local` (local) ou Vercel (production)

2. **Redéployez l'application** :
   - Les variables d'environnement nécessitent un redéploiement
   - Sur Vercel, allez dans **Deployments** → **Redeploy**

3. **Vérifiez la console** :
   - Ouvrez les outils de développement
   - Vérifiez qu'il n'y a pas d'erreurs

### La vérification échoue

1. **Vérifiez que le code est correct** :
   - Copiez-collez exactement le code fourni
   - Pas d'espaces supplémentaires

2. **Vérifiez que le site est accessible** :
   - Le site doit être en ligne et accessible publiquement
   - Pas de redirections qui bloquent les robots

3. **Attendez quelques minutes** :
   - La vérification peut prendre quelques minutes
   - Rafraîchissez la page de vérification

## 📊 Avantages

Une fois vérifiés, vous pourrez :
- ✅ **Soumettre des sitemaps** pour un meilleur référencement
- ✅ **Voir les statistiques de recherche** (impressions, clics)
- ✅ **Identifier les erreurs d'indexation**
- ✅ **Optimiser votre référencement** avec des données précises
- ✅ **Surveiller les performances** de votre site

## 🔐 Sécurité

- Les codes de vérification sont **publiques** (préfixe `NEXT_PUBLIC_`)
- Ils ne présentent **aucun risque de sécurité**
- Ils servent uniquement à prouver que vous êtes propriétaire du site

## 📝 Notes

- Vous n'êtes **pas obligé** de configurer tous les moteurs de recherche
- Configurez uniquement ceux qui sont pertinents pour votre marché
- Pour la RDC, **Google** et **Bing** sont les plus importants
- **Yandex** peut être utile si vous ciblez les pays russophones
- **Baidu** est essentiel si vous ciblez la Chine

## 🚀 Prochaines Étapes

Après avoir configuré les codes de vérification :

1. **Soumettez un sitemap** dans chaque outil de webmaster
2. **Configurez les paramètres de recherche** (pays cible, langue)
3. **Surveillez les performances** régulièrement
4. **Optimisez** en fonction des données fournies
