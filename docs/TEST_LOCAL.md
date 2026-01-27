# 🧪 Guide de Test Local - ONATECH

## 🚀 Démarrage du Serveur de Développement

### 1. Vérifier les Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet avec :

```env
NEXT_PUBLIC_SUPABASE_URL=https://njgmuhrkbwdeijnbqync.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_oo2XgOSgK79l-Ywwr9DXxQ_8JEFTp_B
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici
WHATSAPP_PHONE=243818510311
```

### 2. Installer les Dépendances (si nécessaire)

```bash
npm install
```

### 3. Lancer le Serveur

```bash
npm run dev
```

Le serveur sera accessible sur : **http://localhost:3000**

---

## ✅ Checklist de Test

### 🔐 Authentification

- [ ] **Page d'accueil** (`/`) - Affiche correctement
- [ ] **Page de connexion** (`/auth`) - S'affiche correctement
- [ ] **Connexion email** - Fonctionne
- [ ] **Connexion Google** - Fonctionne (si configuré)
- [ ] **Connexion GitHub** - Fonctionne (si configuré)
- [ ] **Inscription** (`/auth/signup`) - Fonctionne
- [ ] **Déconnexion** - Fonctionne

### 🛍️ Catalogue et Produits

- [ ] **Page catalogue** (`/catalog`) - S'affiche correctement
- [ ] **Recherche produits** - Fonctionne
- [ ] **Filtres produits** - Fonctionnent
- [ ] **Page détail produit** (`/products/[id]`) - S'affiche correctement
- [ ] **Ajout au panier** - Fonctionne
- [ ] **Images produits** - S'affichent correctement

### 🛒 Panier

- [ ] **Page panier** (`/cart`) - S'affiche correctement
- [ ] **Modification quantité** - Fonctionne
- [ ] **Suppression article** - Fonctionne
- [ ] **Code promo** - Fonctionne (si applicable)
- [ ] **Sélection méthode paiement** - Fonctionne
- [ ] **Adresse de livraison** - Peut être saisie
- [ ] **Bouton WhatsApp** - Ouvre WhatsApp avec message formaté
- [ ] **Checkout classique** - Fonctionne

### 📦 Commandes

- [ ] **Page commandes** (`/orders`) - S'affiche correctement
- [ ] **Détail commande** (`/orders/[id]`) - S'affiche correctement
- [ ] **Statut commande** - S'affiche correctement

### 👤 Profil Utilisateur

- [ ] **Page profil** (`/profile`) - S'affiche correctement
- [ ] **Modification profil** - Fonctionne
- [ ] **Historique** (`/history`) - S'affiche correctement
- [ ] **Favoris** (`/wishlist`) - Fonctionne
- [ ] **Comparaison** (`/compare`) - Fonctionne
- [ ] **Points fidélité** (`/loyalty`) - S'affiche correctement

### 🔧 Admin (si admin)

- [ ] **Dashboard admin** (`/admin`) - S'affiche correctement
- [ ] **Gestion produits** (`/admin/products`) - S'affiche correctement
- [ ] **Création produit** (`/admin/products/new`) - Fonctionne
- [ ] **Modification produit** (`/admin/products/[id]`) - Fonctionne
- [ ] **Gestion commandes** (`/admin/orders`) - S'affiche correctement
- [ ] **Gestion utilisateurs** (`/admin/users`) - S'affiche correctement
- [ ] **Création utilisateur** - Fonctionne (bouton + formulaire)
- [ ] **Modification rôle utilisateur** - Fonctionne
- [ ] **Gestion catégories** (`/admin/categories`) - Fonctionne
- [ ] **Gestion paiements** (`/admin/payments`) - S'affiche correctement
- [ ] **Statistiques** (`/admin/stats`) - S'affiche correctement
- [ ] **Intérêts clients** (`/admin/interests`) - S'affiche correctement
- [ ] **Codes promo** (`/admin/coupons`) - Fonctionne

### 📱 Fonctionnalités WhatsApp

- [ ] **Bouton contact WhatsApp** (header) - Ouvre WhatsApp
- [ ] **Commande via WhatsApp** (panier) - Génère message complet avec :
  - [ ] Informations client
  - [ ] Liste des articles (nom, quantité, prix)
  - [ ] Résumé financier (sous-total, réduction, total)
  - [ ] Méthode de paiement
  - [ ] Adresse de livraison

### 🎨 Interface

- [ ] **Design responsive** - Fonctionne sur mobile/tablette/desktop
- [ ] **Animations** - Fonctionnent correctement
- [ ] **Header** - S'affiche correctement avec logo ONATECH
- [ ] **Navigation** - Fonctionne correctement
- [ ] **Footer** (si présent) - S'affiche correctement

### ⚡ Performance

- [ ] **Chargement initial** - Rapide (< 3 secondes)
- [ ] **Navigation entre pages** - Fluide
- [ ] **Images** - Chargent correctement
- [ ] **Pas d'erreurs console** - Vérifier la console navigateur (F12)

---

## 🐛 Vérification des Erreurs

### Console Navigateur (F12)

1. Ouvrir les **Outils de développement** (F12)
2. Aller dans l'onglet **Console**
3. Vérifier qu'il n'y a **pas d'erreurs rouges**
4. Vérifier les **warnings** (jaunes) - peuvent être ignorés si mineurs

### Erreurs Courantes

#### ❌ "Missing Supabase environment variables"
**Solution** : Vérifier que `.env.local` existe et contient les bonnes variables

#### ❌ "Cannot access 'g' before initialization"
**Solution** : Déjà corrigé - redémarrer le serveur si nécessaire

#### ❌ "useSearchParams() should be wrapped in a suspense boundary"
**Solution** : Déjà corrigé - vérifier que `Suspense` est présent dans `/catalog`

#### ❌ Erreurs 404 (pages non trouvées)
**Solution** : Vérifier que toutes les routes existent dans `app/`

---

## 🔍 Tests Spécifiques

### Test Commande WhatsApp

1. Aller sur `/catalog`
2. Ajouter des produits au panier
3. Aller sur `/cart`
4. Remplir l'adresse de livraison (optionnel)
5. Sélectionner une méthode de paiement
6. Cliquer sur **"Commander via WhatsApp"**
7. Vérifier que le message contient :
   - Tous les articles avec quantités et prix
   - Le total
   - L'adresse de livraison (si fournie)
   - La méthode de paiement

### Test Création Utilisateur (Admin)

1. Se connecter en tant qu'admin
2. Aller sur `/admin/users`
3. Cliquer sur **"+ Créer un utilisateur"**
4. Remplir le formulaire :
   - Email
   - Mot de passe (min 6 caractères)
   - Nom complet (optionnel)
   - Téléphone (optionnel)
   - Rôle (client/staff/admin/tech)
5. Cliquer sur **"Créer"**
6. Vérifier que l'utilisateur apparaît dans la liste

### Test Modification Rôle

1. Aller sur `/admin/users`
2. Sélectionner un utilisateur
3. Changer le rôle dans le dropdown
4. Vérifier que le changement est sauvegardé

---

## 📊 Vérification Build

Avant de déployer, tester le build de production :

```bash
npm run build
```

Si le build réussit, vous pouvez déployer sur Vercel.

---

## ✅ Prêt pour le Déploiement

Une fois tous les tests passés :

1. ✅ Build local réussi (`npm run build`)
2. ✅ Pas d'erreurs dans la console
3. ✅ Toutes les fonctionnalités testées
4. ✅ Variables d'environnement configurées dans Vercel

**Vous pouvez maintenant déployer sur Vercel !** 🚀
