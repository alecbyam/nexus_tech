# ONATECH - Application Web Next.js

Application e-commerce **100% web** construite avec Next.js, TypeScript et Supabase.

## 🚀 Stack Technique

- **Frontend**: Next.js 14 (App Router) + React + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage, Realtime)
- **State Management**: Zustand
- **Déploiement**: Vercel

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Supabase

## 🛠️ Installation

1. **Cloner le projet**
```bash
git clone <repo-url>
cd nexus-tech
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**

Créez un fichier `.env.local` à la racine :

```env
NEXT_PUBLIC_SUPABASE_URL=https://njgmuhrkbwdeijnbqync.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_oo2XgOSgK79l-Ywwr9DXxQ_8JEFTp_B
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
WHATSAPP_PHONE=243818510311
```

4. **Configurer Supabase**

Exécutez le script SQL dans votre projet Supabase :
- `supabase/schema.sql` (tables, RLS, storage)

5. **Lancer en développement**
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🏗️ Structure du Projet

```
├── app/                    # App Router (Next.js 14)
│   ├── auth/              # Pages d'authentification
│   ├── catalog/           # Catalogue produits
│   ├── products/          # Détail produit
│   ├── cart/              # Panier
│   ├── orders/            # Commandes
│   ├── admin/             # Dashboard admin
│   └── layout.tsx         # Layout principal
├── components/            # Composants React réutilisables
├── lib/                   # Utilitaires et clients
│   └── supabase/          # Configuration Supabase
├── store/                 # Zustand stores
├── types/                 # Types TypeScript
└── public/                # Assets statiques
```

## 🎯 Fonctionnalités

- ✅ Authentification (Email + Google OAuth)
- ✅ Catalogue produits avec recherche et filtres
- ✅ Panier persistant (localStorage)
- ✅ Système de commandes
- ✅ Dashboard admin (gestion produits + commandes)
- ✅ Design responsive mobile-first
- ✅ SEO optimisé (SSR/SSG)

## 🚢 Déploiement sur Vercel

1. **Connecter le repo GitHub à Vercel**

2. **Configurer les variables d'environnement dans Vercel** :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (optionnel, pour admin)
   - `WHATSAPP_PHONE`

3. **Déployer** : Vercel détecte automatiquement Next.js et déploie

## 📝 Scripts Disponibles

- `npm run dev` - Développement local
- `npm run build` - Build production
- `npm run start` - Démarrer en production
- `npm run lint` - Linter ESLint
- `npm run type-check` - Vérification TypeScript

## 🔒 Sécurité

- Row Level Security (RLS) activé sur toutes les tables Supabase
- Variables d'environnement pour les clés API
- Authentification sécurisée via Supabase Auth

## 📱 Responsive

L'application est optimisée pour :
- Mobile (< 640px)
- Tablette (640px - 1024px)
- Desktop (> 1024px)

## 🎨 Design

- Couleurs principales : Bleu (#0B5FFF) et Blanc
- Typographie : Inter (Google Fonts)
- Composants : Tailwind CSS

## 📄 Licence

Propriétaire - ONATECH
