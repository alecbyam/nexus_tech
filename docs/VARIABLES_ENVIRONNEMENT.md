# 🔐 Variables d'Environnement Supabase

## 📋 Variables Requises

### Pour le Développement Local (`.env.local`)

Créez un fichier `.env.local` à la racine du projet avec ces variables :

```env
# ============================================
# SUPABASE - Configuration Principale
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key_ici

# ============================================
# SUPABASE - Service Role (Optionnel - Admin uniquement)
# ============================================
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici

# ============================================
# AUTRES CONFIGURATIONS
# ============================================
WHATSAPP_PHONE=243818510311
```

---

## 🔍 Comment Obtenir les Clés Supabase

### 1. Allez sur Supabase Dashboard

1. **Connectez-vous** sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Sélectionnez votre projet**

### 2. Récupérez les Variables

1. **Allez dans** : **Settings** → **API**
2. **Vous verrez** :

#### **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
```
https://xxxxxxxxxxxxx.supabase.co
```

#### **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eHgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTg3NjgwMCwiZXhwIjoxOTYxNDUyODAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (Optionnel)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eHgiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQ1ODc2ODAwLCJleHAiOjE5NjE0NTI4MDB9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **ATTENTION** : La `service_role` key a des **permissions complètes**. Ne l'exposez **JAMAIS** côté client !

---

## 📝 Exemple de Fichier `.env.local`

```env
# ============================================
# SUPABASE - Configuration Principale
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://njgmuhrkbwdeijnbqync.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_oo2XgOSgK79l-Ywwr9DXxQ_8JEFTp_B

# ============================================
# SUPABASE - Service Role (Optionnel)
# ============================================
# SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici

# ============================================
# AUTRES CONFIGURATIONS
# ============================================
WHATSAPP_PHONE=243818510311
```

---

## 🚀 Pour Vercel (Déploiement)

Dans **Vercel Dashboard** → **Settings** → **Environment Variables**, ajoutez :

### Variables de Production

| Variable | Valeur | Environnement |
|----------|--------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://votre-projet.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `votre_anon_key` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `votre_service_role_key` | Production (optionnel) |
| `WHATSAPP_PHONE` | `243818510311` | Production, Preview, Development |

---

## ✅ Vérification

### Vérifier que les Variables sont Chargées

Créez un fichier de test (à supprimer après) :

```typescript
// test-env.ts (à supprimer après test)
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Définie' : '❌ Manquante')
```

### Erreurs Courantes

#### ❌ "Missing Supabase environment variables"

**Solution** :
1. Vérifiez que le fichier `.env.local` existe à la racine
2. Vérifiez que les noms des variables sont corrects (avec `NEXT_PUBLIC_` pour les variables client)
3. **Redémarrez le serveur** après avoir ajouté/modifié `.env.local`

#### ❌ "Invalid API key"

**Solution** :
1. Vérifiez que vous avez copié la **clé complète** (sans espaces)
2. Vérifiez que vous utilisez la bonne clé (`anon` pour le client, `service_role` pour le serveur)
3. Vérifiez que le projet Supabase est actif

---

## 🔒 Sécurité

### ✅ À FAIRE

- ✅ Utiliser `.env.local` pour le développement (déjà dans `.gitignore`)
- ✅ Utiliser les variables d'environnement Vercel pour la production
- ✅ Utiliser `NEXT_PUBLIC_` pour les variables accessibles côté client
- ✅ Ne jamais commiter les fichiers `.env*`

### ❌ À NE PAS FAIRE

- ❌ **Ne jamais** commiter `.env.local` ou `.env`
- ❌ **Ne jamais** exposer `SUPABASE_SERVICE_ROLE_KEY` côté client
- ❌ **Ne jamais** partager les clés publiquement
- ❌ **Ne jamais** utiliser `service_role` dans le code client

---

## 📚 Documentation

- **Supabase Docs** : [supabase.com/docs](https://supabase.com/docs)
- **Next.js Environment Variables** : [nextjs.org/docs/basic-features/environment-variables](https://nextjs.org/docs/basic-features/environment-variables)
- **Vercel Environment Variables** : [vercel.com/docs/concepts/projects/environment-variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## 🆘 Support

Si vous avez des problèmes :
1. Vérifiez que les variables sont bien définies
2. Redémarrez le serveur de développement
3. Vérifiez les logs dans la console du navigateur
4. Vérifiez les logs dans le terminal

---

**✅ Une fois configurées, ces variables permettront à l'application de se connecter à Supabase !**
