# ✅ Vérification des Erreurs de Déploiement

## 🔍 Checklist de Vérification

### 1. Variables d'Environnement Vercel

Assurez-vous que ces variables sont configurées dans **Vercel Dashboard** → **Settings** → **Environment Variables** :

#### Variables Requises

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de votre projet Supabase | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique anonyme Supabase | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `WHATSAPP_PHONE` | Numéro WhatsApp | `243818510311` |

#### Variables Optionnelles

| Variable | Description |
|----------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role (pour admin uniquement) |

### 2. Configuration Vercel

Vérifiez que :
- ✅ **Framework Preset** : Next.js
- ✅ **Build Command** : `npm run build`
- ✅ **Output Directory** : `.next`
- ✅ **Install Command** : `npm install`
- ✅ **Node.js Version** : 18.x ou 20.x

### 3. Erreurs Communes et Solutions

#### ❌ Erreur : "Missing environment variables"

**Solution** :
1. Allez dans Vercel Dashboard → Settings → Environment Variables
2. Ajoutez toutes les variables requises
3. Redéployez le projet

#### ❌ Erreur : "Build failed - Syntax Error"

**Solution** :
1. Vérifiez que le code est poussé sur GitHub
2. Vérifiez les logs de build dans Vercel
3. Testez le build localement : `npm run build`

#### ❌ Erreur : "Module not found"

**Solution** :
1. Vérifiez que `package.json` contient toutes les dépendances
2. Exécutez `npm install` localement pour vérifier
3. Vérifiez que `node_modules` n'est pas dans `.gitignore` (normalement il ne devrait pas être commité)

#### ❌ Erreur : "Failed to connect to Supabase"

**Solution** :
1. Vérifiez que les variables d'environnement Supabase sont correctes
2. Vérifiez que le projet Supabase est actif
3. Vérifiez les URLs de redirection dans Supabase Dashboard

### 4. Vérification Post-Déploiement

Après le déploiement, vérifiez :

1. **Page d'accueil** : `https://votre-projet.vercel.app`
2. **Authentification** : `https://votre-projet.vercel.app/auth`
3. **Admin** : `https://votre-projet.vercel.app/admin` (nécessite connexion admin)
4. **Catalogue** : `https://votre-projet.vercel.app/catalog`

### 5. Configuration Supabase Post-Déploiement

#### URLs de Redirection

Dans **Supabase Dashboard** → **Authentication** → **URL Configuration** :

1. **Site URL** : `https://votre-projet.vercel.app`
2. **Redirect URLs** : 
   - `https://votre-projet.vercel.app/auth/callback`
   - `https://votre-projet.vercel.app/**`

#### Migrations SQL

Exécutez les migrations dans **Supabase Dashboard** → **SQL Editor** :

1. Exécutez `supabase/COMPLETE_MIGRATION.sql`
2. Vérifiez que toutes les tables sont créées
3. Vérifiez que les RLS policies sont actives

### 6. Commandes de Diagnostic

#### Build Local
```bash
npm run build
```

#### Vérification TypeScript
```bash
npm run type-check
```

#### Vérification Linter
```bash
npm run lint
```

### 7. Logs Vercel

Pour voir les logs de déploiement :
1. Allez dans Vercel Dashboard → Deployments
2. Cliquez sur le déploiement
3. Consultez les logs de build

### 8. Support

Si les erreurs persistent :
1. Vérifiez les logs complets dans Vercel
2. Vérifiez que le build local fonctionne
3. Vérifiez que toutes les variables d'environnement sont configurées
4. Vérifiez que les migrations SQL sont exécutées

---

**✅ Si toutes ces étapes sont suivies, le déploiement devrait réussir !**
