# 🚀 Quick Start - NEXUS TECH Next.js

## Installation locale

```bash
# 1. Installer les dépendances
npm install

# 2. Créer .env.local
cp .env.local.example .env.local
# Puis éditer .env.local avec vos valeurs Supabase

# 3. Lancer en développement
npm run dev
```

L'app sera sur [http://localhost:3000](http://localhost:3000)

## Déploiement Vercel

1. **Push sur GitHub**
```bash
git add .
git commit -m "Next.js app ready"
git push
```

2. **Connecter à Vercel**
   - Allez sur vercel.com
   - Importez le repo GitHub
   - Ajoutez les variables d'environnement (voir DEPLOYMENT.md)
   - Déployez !

## Structure

- `app/` - Pages Next.js (App Router)
- `components/` - Composants React réutilisables
- `lib/` - Utilitaires (Supabase client)
- `store/` - Zustand stores (panier)
- `types/` - Types TypeScript

## Fonctionnalités

✅ Authentification (Email + Google)  
✅ Catalogue avec recherche  
✅ Panier persistant  
✅ Commandes  
✅ Dashboard Admin  
✅ Responsive mobile-first  

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase
- Zustand

