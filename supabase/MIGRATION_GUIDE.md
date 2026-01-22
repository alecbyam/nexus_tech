# Guide de Migration - Système de Catégories Hiérarchiques

## 📋 Instructions étape par étape

### Étape 1 : Sauvegarder les données existantes (si nécessaire)

Si tu as déjà des catégories dans la table `categories`, sauvegarde-les d'abord :

```sql
-- Créer une table de sauvegarde
CREATE TABLE categories_backup AS SELECT * FROM categories;

-- Vérifier la sauvegarde
SELECT COUNT(*) FROM categories_backup;
```

### Étape 2 : Supprimer l'ancienne structure (si elle existe)

```sql
-- Supprimer les contraintes et dépendances
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Note: Si tu as des produits, tu devras les recréer après
```

### Étape 3 : Créer la nouvelle table categories

Copie et exécute ce code dans Supabase SQL Editor :

```sql
-- ============================================
-- Création de la table categories hiérarchique
-- ============================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  icon VARCHAR(50),
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);
CREATE INDEX idx_categories_active ON categories(is_active) WHERE is_active = true;

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER trigger_update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();

-- Fonction pour obtenir le chemin complet d'une catégorie
CREATE OR REPLACE FUNCTION get_category_path(category_id UUID)
RETURNS TEXT AS $$
DECLARE
  path TEXT;
  current_id UUID;
  current_name VARCHAR;
BEGIN
  path := '';
  current_id := category_id;
  
  WHILE current_id IS NOT NULL LOOP
    SELECT name, parent_id INTO current_name, current_id
    FROM categories
    WHERE id = current_id;
    
    IF path = '' THEN
      path := current_name;
    ELSE
      path := current_name || ' > ' || path;
    END IF;
  END LOOP;
  
  RETURN path;
END;
$$ LANGUAGE plpgsql;

-- Vue pour faciliter les requêtes hiérarchiques
CREATE OR REPLACE VIEW categories_tree AS
SELECT 
  c.id,
  c.name,
  c.slug,
  c.parent_id,
  c.icon,
  c.description,
  c.sort_order,
  c.is_active,
  c.created_at,
  c.updated_at,
  get_category_path(c.id) AS full_path,
  CASE 
    WHEN c.parent_id IS NULL THEN 0
    ELSE 1
  END AS level
FROM categories c;
```

### Étape 4 : Insérer les données (catégories et sous-catégories)

Copie et exécute ce code :

```sql
-- ============================================
-- Insertion des catégories principales
-- ============================================

INSERT INTO categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0001-000000000001', 'Téléphones', 'telephones', NULL, '📱', 'Smartphones et téléphones portables', 1),
('00000000-0000-0000-0002-000000000001', 'Ordinateurs', 'ordinateurs', NULL, '💻', 'Ordinateurs portables et de bureau', 2),
('00000000-0000-0000-0003-000000000001', 'Accessoires', 'accessoires', NULL, '🎧', 'Accessoires pour téléphones et ordinateurs', 3),
('00000000-0000-0000-0004-000000000001', 'Pièces détachées', 'pieces-detachees', NULL, '🔧', 'Composants et pièces de rechange', 4),
('00000000-0000-0000-0005-000000000001', 'Appareils électroniques', 'appareils-electroniques', NULL, '⚡', 'Électronique grand public', 5),
('00000000-0000-0000-0006-000000000001', 'Services', 'services', NULL, '🛠️', 'Services techniques et réparations', 6);

-- ============================================
-- Insertion des sous-catégories : TÉLÉPHONES
-- ============================================

INSERT INTO categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0001-000000000002', 'Android', 'telephones-android', '00000000-0000-0000-0001-000000000001', '🤖', 'Smartphones Android', 1),
('00000000-0000-0000-0001-000000000003', 'iPhone', 'telephones-iphone', '00000000-0000-0000-0001-000000000001', '🍎', 'iPhone et appareils Apple', 2),
('00000000-0000-0000-0001-000000000004', 'Basique', 'telephones-basique', '00000000-0000-0000-0001-000000000001', '📞', 'Téléphones basiques et feature phones', 3);

-- ============================================
-- Insertion des sous-catégories : ORDINATEURS
-- ============================================

INSERT INTO categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0002-000000000002', 'Laptop', 'ordinateurs-laptop', '00000000-0000-0000-0002-000000000001', '💻', 'Ordinateurs portables', 1),
('00000000-0000-0000-0002-000000000003', 'Desktop', 'ordinateurs-desktop', '00000000-0000-0000-0002-000000000001', '🖥️', 'Ordinateurs de bureau', 2),
('00000000-0000-0000-0002-000000000004', 'PC Gamer', 'ordinateurs-pc-gamer', '00000000-0000-0000-0002-000000000001', '🎮', 'PC Gaming et stations de jeu', 3),
('00000000-0000-0000-0002-000000000005', 'Tablettes', 'ordinateurs-tablettes', '00000000-0000-0000-0002-000000000001', '📱', 'Tablettes et iPad', 4);

-- ============================================
-- Insertion des sous-catégories : ACCESSOIRES
-- ============================================

INSERT INTO categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0003-000000000002', 'Coques', 'accessoires-coques', '00000000-0000-0000-0003-000000000001', '🛡️', 'Coques et étuis de protection', 1),
('00000000-0000-0000-0003-000000000003', 'Chargeurs', 'accessoires-chargeurs', '00000000-0000-0000-0003-000000000001', '🔌', 'Chargeurs et adaptateurs', 2),
('00000000-0000-0000-0003-000000000004', 'Power banks', 'accessoires-power-banks', '00000000-0000-0000-0003-000000000001', '🔋', 'Batteries externes et power banks', 3),
('00000000-0000-0000-0003-000000000005', 'Casques', 'accessoires-casques', '00000000-0000-0000-0003-000000000001', '🎧', 'Casques audio et écouteurs', 4),
('00000000-0000-0000-0003-000000000006', 'Câbles', 'accessoires-cables', '00000000-0000-0000-0003-000000000001', '🔌', 'Câbles USB, Lightning, etc.', 5);

-- ============================================
-- Insertion des sous-catégories : PIÈCES DÉTACHÉES
-- ============================================

INSERT INTO categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0004-000000000002', 'Écrans', 'pieces-detachees-ecrans', '00000000-0000-0000-0004-000000000001', '📺', 'Écrans LCD, OLED et pièces d''affichage', 1),
('00000000-0000-0000-0004-000000000003', 'Batteries', 'pieces-detachees-batteries', '00000000-0000-0000-0004-000000000001', '🔋', 'Batteries de remplacement', 2),
('00000000-0000-0000-0004-000000000004', 'Connecteurs', 'pieces-detachees-connecteurs', '00000000-0000-0000-0004-000000000001', '🔌', 'Connecteurs et ports de charge', 3),
('00000000-0000-0000-0004-000000000005', 'Caméras', 'pieces-detachees-cameras', '00000000-0000-0000-0004-000000000001', '📷', 'Modules caméra et objectifs', 4);

-- ============================================
-- Insertion des sous-catégories : APPAREILS ÉLECTRONIQUES
-- ============================================

INSERT INTO categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0005-000000000002', 'TV', 'appareils-electroniques-tv', '00000000-0000-0000-0005-000000000001', '📺', 'Téléviseurs et écrans TV', 1),
('00000000-0000-0000-0005-000000000003', 'Caméras', 'appareils-electroniques-cameras', '00000000-0000-0000-0005-000000000001', '📷', 'Appareils photo et caméras', 2),
('00000000-0000-0000-0005-000000000004', 'Montres connectées', 'appareils-electroniques-montres', '00000000-0000-0000-0005-000000000001', '⌚', 'Smartwatches et montres intelligentes', 3),
('00000000-0000-0000-0005-000000000005', 'Imprimantes', 'appareils-electroniques-imprimantes', '00000000-0000-0000-0005-000000000001', '🖨️', 'Imprimantes et scanners', 4),
('00000000-0000-0000-0005-000000000006', 'Routeurs', 'appareils-electroniques-routeurs', '00000000-0000-0000-0005-000000000001', '📡', 'Routeurs WiFi et réseaux', 5),
('00000000-0000-0000-0005-000000000007', 'Consoles', 'appareils-electroniques-consoles', '00000000-0000-0000-0005-000000000001', '🎮', 'Consoles de jeu', 6),
('00000000-0000-0000-0005-000000000008', 'Enceintes', 'appareils-electroniques-enceintes', '00000000-0000-0000-0005-000000000001', '🔊', 'Enceintes et systèmes audio', 7);

-- ============================================
-- Insertion des sous-catégories : SERVICES
-- ============================================

INSERT INTO categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0006-000000000002', 'Réparation', 'services-reparation', '00000000-0000-0000-0006-000000000001', '🔧', 'Services de réparation et maintenance', 1),
('00000000-0000-0000-0006-000000000003', 'Installation', 'services-installation', '00000000-0000-0000-0006-000000000001', '⚙️', 'Installation et configuration', 2),
('00000000-0000-0000-0006-000000000004', 'Support technique', 'services-support', '00000000-0000-0000-0006-000000000001', '💬', 'Support et assistance technique', 3),
('00000000-0000-0000-0006-000000000005', 'Formation', 'services-formation', '00000000-0000-0000-0006-000000000001', '📚', 'Formation et cours', 4);
```

### Étape 5 : Vérifier l'installation

```sql
-- Vérifier le nombre total de catégories (devrait être 34)
SELECT COUNT(*) as total_categories FROM categories;

-- Vérifier les catégories principales (devrait être 6)
SELECT * FROM categories WHERE parent_id IS NULL ORDER BY sort_order;

-- Vérifier les sous-catégories d'une catégorie principale
SELECT * FROM categories 
WHERE parent_id = '00000000-0000-0000-0001-000000000001' 
ORDER BY sort_order;

-- Tester la fonction get_category_path
SELECT name, get_category_path(id) as full_path 
FROM categories 
WHERE parent_id IS NOT NULL 
LIMIT 5;

-- Tester la vue categories_tree
SELECT * FROM categories_tree WHERE level = 0; -- Catégories principales
SELECT * FROM categories_tree WHERE level = 1; -- Sous-catégories
```

### Étape 6 : Mettre à jour la table products (si elle existe)

Si tu as déjà une table `products` avec une colonne `category_id`, tu dois la mettre à jour :

```sql
-- Vérifier la structure actuelle de products
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products';

-- Si products.category_id référence l'ancienne table, mettre à jour :
-- Option 1: Supprimer et recréer products avec la nouvelle référence
-- Option 2: Migrer les données vers les nouvelles catégories

-- Exemple: Ajouter la colonne category_id si elle n'existe pas
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- Mettre à jour les produits existants (exemple)
-- UPDATE products SET category_id = '00000000-0000-0000-0001-000000000002' WHERE ...;
```

## ✅ Checklist de vérification

- [ ] Table `categories` créée avec succès
- [ ] Index créés
- [ ] Fonction `get_category_path()` créée
- [ ] Vue `categories_tree` créée
- [ ] 6 catégories principales insérées
- [ ] 28 sous-catégories insérées
- [ ] Total de 34 catégories dans la table
- [ ] Requêtes de vérification fonctionnent

## 🚨 En cas d'erreur

Si tu rencontres une erreur, vérifie :

1. **Erreur de contrainte** : Vérifie que les `parent_id` référencent des IDs valides
2. **Erreur de slug unique** : Vérifie qu'il n'y a pas de doublons
3. **Erreur de référence** : Vérifie que la table `categories` existe avant d'insérer

## 📝 Notes importantes

- Les UUIDs sont fixes pour faciliter les références
- Tu peux modifier les `sort_order` pour changer l'ordre d'affichage
- Tu peux ajouter `is_active = false` pour désactiver une catégorie sans la supprimer
- Le système supporte n'importe quel niveau de profondeur (sous-sous-catégories, etc.)

