# 🔧 Guide de Correction des Erreurs de Déploiement

## ✅ Checklist Rapide

### 1. Variables d'Environnement Vercel

**⚠️ CRITIQUE** : Ces variables DOIVENT être configurées dans Vercel Dashboard :

1. Allez dans **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Ajoutez pour **Production, Preview, Development** :

```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
WHATSAPP_PHONE=243818510311
```

### 2. Build Local Réussi

Vérifiez que le build fonctionne localement :

```bash
npm run build
```

Si le build échoue localement, il échouera aussi sur Vercel.

### 3. Migrations SQL

**⚠️ IMPORTANT** : Les migrations SQL doivent être exécutées dans Supabase :

1. Allez dans **Supabase Dashboard** → **SQL Editor**
2. Exécutez : `supabase/COMPLETE_MIGRATION.sql`
3. Vérifiez que toutes les tables sont créées

---

## 🐛 Erreurs Courantes et Solutions

### Erreur : "Missing environment variables"

**Symptômes** :
```
Error: Missing Supabase environment variables
```

**Solution** :
1. Vérifiez que `NEXT_PUBLIC_SUPABASE_URL` est défini dans Vercel
2. Vérifiez que `NEXT_PUBLIC_SUPABASE_ANON_KEY` est défini dans Vercel
3. Redéployez après avoir ajouté les variables

### Erreur : "Build failed - Syntax Error"

**Symptômes** :
```
Syntax Error at line X
Build failed because of webpack errors
```

**Solution** :
1. Vérifiez les logs de build dans Vercel
2. Testez le build localement : `npm run build`
3. Vérifiez que tous les fichiers sont correctement formatés
4. Vérifiez qu'il n'y a pas de caractères invisibles

### Erreur : "Module not found"

**Symptômes** :
```
Error: Cannot find module 'xxx'
```

**Solution** :
1. Vérifiez que `package.json` contient toutes les dépendances
2. Vérifiez que `node_modules` n'est pas commité (normal)
3. Vérifiez que `npm install` fonctionne localement

### Erreur : "Failed to connect to Supabase"

**Symptômes** :
```
Error: Failed to fetch
Network error
```

**Solution** :
1. Vérifiez que les variables d'environnement Supabase sont correctes
2. Vérifiez que le projet Supabase est actif
3. Vérifiez les URLs de redirection dans Supabase Dashboard

### Erreur : "Internal Server Error"

**Symptômes** :
```
500 Internal Server Error
```

**Solution** :
1. Vérifiez les logs dans Vercel Dashboard → **Deployments** → **Functions**
2. Vérifiez que les migrations SQL sont exécutées
3. Vérifiez que les tables existent dans Supabase
4. Vérifiez que RLS policies sont correctement configurées

### Erreur : "useSearchParams() should be wrapped in a suspense boundary"

**Symptômes** :
```
Error: useSearchParams() should be wrapped in a suspense boundary
```

**Solution** :
✅ **Déjà corrigé** dans `app/auth/page.tsx`

### Erreur : "Cannot find module 'critters'"

**Symptômes** :
```
Error: Cannot find module 'critters'
```

**Solution** :
✅ **Déjà corrigé** - `optimizeCss` désactivé dans `next.config.js`

---

## 🔍 Diagnostic

### Vérifier les Logs Vercel

1. Allez dans **Vercel Dashboard** → **Deployments**
2. Cliquez sur le déploiement qui a échoué
3. Consultez les **Build Logs** et **Function Logs**

### Vérifier le Build Local

```bash
# Nettoyer le cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Vérifier les Variables d'Environnement

```bash
# Vérifier que les variables sont définies
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Vérifier Supabase

1. Allez dans **Supabase Dashboard** → **Table Editor**
2. Vérifiez que toutes les tables existent :
   - `profiles`
   - `products`
   - `categories`
   - `orders`
   - `order_items`
   - etc.

---

## 📋 Checklist de Déploiement

Avant de déployer, vérifiez :

- [ ] Build local réussi : `npm run build`
- [ ] Variables d'environnement configurées dans Vercel
- [ ] Migrations SQL exécutées dans Supabase
- [ ] URLs de redirection configurées dans Supabase
- [ ] Code poussé sur GitHub
- [ ] Projet Vercel créé et connecté à GitHub
- [ ] Framework détecté : Next.js
- [ ] Build Command : `npm run build`
- [ ] Output Directory : `.next`

---

## 🚀 Commandes Utiles

### Build Local
```bash
npm run build
```

### Type Check
```bash
npm run type-check
```

### Linter
```bash
npm run lint
```

### Nettoyer le Cache
```bash
rm -rf .next
rm -rf node_modules
npm install
```

---

## 📞 Support

Si les erreurs persistent :

1. **Consultez les logs complets** dans Vercel Dashboard
2. **Vérifiez** que le build local fonctionne
3. **Vérifiez** que toutes les variables d'environnement sont configurées
4. **Vérifiez** que les migrations SQL sont exécutées
5. **Consultez** la documentation :
   - [Vercel Docs](https://vercel.com/docs)
   - [Next.js Docs](https://nextjs.org/docs)
   - [Supabase Docs](https://supabase.com/docs)

---

**✅ Si toutes ces étapes sont suivies, le déploiement devrait réussir !**
