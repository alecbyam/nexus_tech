# Guide d'ajout de produits

## 1. Ajouter des produits de test via SQL

### Script SQL à exécuter dans Supabase

1. Ouvrez votre projet Supabase
2. Allez dans **SQL Editor**
3. Cliquez sur **New Query**
4. Copiez-collez le contenu du fichier `supabase/SEED_PRODUCTS_USD.sql`
5. Cliquez sur **Run**

Ce script va :
- Créer les catégories de base (Smartphones, Ordinateurs, Tablettes, etc.)
- Ajouter 30+ produits de test avec prix en USD
- Configurer les prix d'ancrage pour certains produits

## 2. Ajouter des produits via l'interface admin

### Prérequis
- Vous devez être connecté avec un compte administrateur
- Les catégories doivent exister dans la base de données

### Étapes

1. Connectez-vous avec votre compte admin
2. Allez sur **Dashboard Admin** → **Gérer les produits**
3. Cliquez sur **+ Ajouter un produit**
4. Remplissez le formulaire :
   - **Nom du produit** (requis)
   - **Catégorie** (requis) - Sélectionnez une catégorie existante
   - **SKU** (optionnel) - Référence unique du produit
   - **Prix de vente (USD)** (requis) - Exemple: 999.99
   - **Prix d'ancrage (USD)** (optionnel) - Prix barré pour comparaison
   - **Stock** (requis) - Quantité disponible
   - **Images** (recommandé) - Ajoutez au moins 3 images
   - **Produit reconditionné** (case à cocher)
   - **Produit actif** (case à cocher)
5. Cliquez sur **Créer le produit**

### Résolution de problèmes

#### Erreur : "Permission refusée"
- Vérifiez que votre compte a `is_admin = true` dans la table `profiles`
- Exécutez ce SQL pour vous donner les droits admin :
```sql
UPDATE profiles 
SET is_admin = true 
WHERE id = 'VOTRE_USER_ID';
```

#### Erreur : "La catégorie sélectionnée n'existe pas"
- Exécutez d'abord le script `SEED_PRODUCTS_USD.sql` pour créer les catégories
- Ou créez manuellement des catégories via l'interface admin

#### Erreur : "Un produit avec ce SKU existe déjà"
- Changez le SKU du produit ou laissez-le vide (SKU optionnel)

#### Les catégories n'apparaissent pas dans le formulaire
- Vérifiez que des catégories existent avec `is_active = true`
- Exécutez le script de seed pour créer les catégories de base

## 3. Vérifier que tout fonctionne

Après avoir ajouté des produits :
1. Vérifiez dans **Gérer les produits** que les produits apparaissent
2. Vérifiez dans le **Catalogue** que les produits sont visibles
3. Testez l'ajout d'un produit au panier
