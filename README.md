# NEXUS TECH — E-commerce Flutter Web + Supabase

Application e-commerce **100% web** **NEXUS TECH** (accessible via nom de domaine, optimisée mobile-first) pour vendre :
- coques de téléphone
- accessoires téléphone
- ordinateurs
- accessoires ordinateur
- services tech

## 1) Prérequis

- Flutter (stable) + Dart
- Un projet Supabase (cloud ou self-host)

## 2) Configuration Supabase (SQL + Storage + RLS)

1. Ouvre le **SQL Editor** Supabase et exécute :
   - `supabase/schema.sql`
   - `supabase/seed.sql`

2. Vérifie que le bucket **`product-images`** existe (créé par le SQL) et que les policies sont OK.

## 3) Variables d’environnement (Flutter)

Crée un fichier `.env` à la racine (**ne jamais le committer**) :

```
SUPABASE_URL=https://njgmuhrkbwdeijnbqync.supabase.co
SUPABASE_ANON_KEY=sb_publishable_xxxxx
WHATSAPP_PHONE=243818510311
```

Notes :
- `WHATSAPP_PHONE` au format international (sans `+`).
- **Ne mets jamais `DATABASE_URL` / `DIRECT_URL` / mot de passe Postgres dans l’app Flutter** (c’est serveur uniquement).

Un exemple prêt à copier est fourni dans `config/env.example.txt`.

## 4) Lancer l’app (web)

Installer les dépendances :

```bash
flutter pub get
```

### Web

```bash
flutter run -d chrome
# Build production
flutter build web --release
# Le résultat est dans build/web
```

## 5) Optimisations mobile (Web)

L'app est **100% web** mais **optimisée mobile-first** pour une excellente expérience sur smartphones :
- **Touch targets** : minimum 56px (recommandation Material Design)
- **Responsive breakpoints** : mobile (<600px), tablette (600-1024px), desktop (>1024px)
- **Boutons grands** : facile à cliquer sur petits écrans
- **Spacing adaptatif** : padding/marges ajustés selon la taille d'écran
- **Low-bandwidth friendly** : images lazy-loaded, pas de ressources lourdes
- **PWA-ready** : peut être ajoutée à l'écran d'accueil mobile (via manifest.json)

## 6) Comptes & rôles admin

Dans cette base, un utilisateur est admin si `profiles.is_admin = true`.
Après inscription d’un compte, mets `is_admin=true` via SQL (ou Table Editor) pour activer le dashboard admin.

## 7) Structure (Clean Architecture + Riverpod)

- `lib/core`: config, thème, routing, erreurs, widgets communs
- `lib/features/auth`: auth (email + OTP téléphone)
- `lib/features/catalog`: catégories, listing, recherche, détail produit
- `lib/features/cart`: panier + création commande
- `lib/features/orders`: historique commandes
- `lib/features/admin`: CRUD produits + gestion commandes

## 8) Déploiement web (Vercel + nom de domaine)

Tout est compatible **static hosting** (Netlify, Vercel, Cloudflare Pages, GitHub Pages via actions, etc.).
Commande : `flutter build web --release` puis déployer le dossier `build/web`.

### Déploiement Vercel (recommandé)

- **Build Command**: `bash ./vercel-build.sh` (installe Flutter puis build web)
- **Output Directory**: `build/web`
- **SPA routing**: déjà configuré via `vercel.json` (rewrites vers `index.html`).


