# Guide de Déploiement Vercel

## 1. Préparer le projet

Assurez-vous que tous les fichiers sont commités :

```bash
git add .
git commit -m "Initial Next.js setup"
git push
```

## 2. Connecter à Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Connectez votre compte GitHub
3. Cliquez sur "New Project"
4. Importez votre repository `nexus-tech`

## 3. Configurer les variables d'environnement

Dans les paramètres du projet Vercel, ajoutez :

```
NEXT_PUBLIC_SUPABASE_URL=https://njgmuhrkbwdeijnbqync.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_oo2XgOSgK79l-Ywwr9DXxQ_8JEFTp_B
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (optionnel, pour admin)
WHATSAPP_PHONE=243818510311
```

## 4. Déployer

Vercel détecte automatiquement Next.js et configure :
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

Cliquez sur "Deploy" et attendez la fin du build.

## 5. Configurer Supabase Auth (Google OAuth)

1. Dans Supabase Dashboard → Authentication → Providers
2. Activez "Google"
3. Ajoutez les credentials Google OAuth
4. Dans "Redirect URLs", ajoutez :
   - `https://votre-domaine.vercel.app/auth/callback`

## 6. Vérifier le déploiement

Une fois déployé, votre app sera accessible sur :
`https://votre-projet.vercel.app`

## Notes

- Le fichier `vercel.json` est optionnel (Next.js est auto-détecté)
- Les variables d'environnement sont injectées automatiquement
- Les builds sont automatiques à chaque push sur `main`

