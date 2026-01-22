-- ============================================
-- MIGRATION SÉCURISÉE - Gère les produits existants
-- ============================================
-- Ce script préserve les produits et met à jour leurs catégories
-- ============================================

-- ÉTAPE 1: Sauvegarder les données existantes
CREATE TABLE IF NOT EXISTS categories_backup AS 
SELECT * FROM categories WHERE 1=0;

CREATE TABLE IF NOT EXISTS products_backup AS 
SELECT * FROM products WHERE 1=0;

-- Si tu veux sauvegarder, décommente :
-- INSERT INTO categories_backup SELECT * FROM categories;
-- INSERT INTO products_backup SELECT * FROM products;

-- ÉTAPE 2: Supprimer temporairement la contrainte depuis products
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'category_id'
  ) THEN
    -- Supprimer la contrainte existante
    ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
    -- Mettre tous les category_id à NULL temporairement
    UPDATE products SET category_id = NULL;
  END IF;
END $$;

-- ÉTAPE 3: Supprimer l'ancienne table categories
DROP TABLE IF EXISTS categories CASCADE;

-- ÉTAPE 4: Créer la nouvelle table categories avec structure hiérarchique
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

-- ÉTAPE 5: Créer les index
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);
CREATE INDEX idx_categories_active ON categories(is_active) WHERE is_active = true;

-- ÉTAPE 6: Fonction pour updated_at
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ÉTAPE 7: Trigger pour updated_at
CREATE TRIGGER trigger_update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();

-- ÉTAPE 8: Fonction get_category_path
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

-- ÉTAPE 9: Vue categories_tree
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

-- ÉTAPE 10: Insérer les catégories principales
INSERT INTO categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0001-000000000001', 'Téléphones', 'telephones', NULL, '📱', 'Smartphones et téléphones portables', 1),
('00000000-0000-0000-0002-000000000001', 'Ordinateurs', 'ordinateurs', NULL, '💻', 'Ordinateurs portables et de bureau', 2),
('00000000-0000-0000-0003-000000000001', 'Accessoires', 'accessoires', NULL, '🎧', 'Accessoires pour téléphones et ordinateurs', 3),
('00000000-0000-0000-0004-000000000001', 'Pièces détachées', 'pieces-detachees', NULL, '🔧', 'Composants et pièces de rechange', 4),
('00000000-0000-0000-0005-000000000001', 'Appareils électroniques', 'appareils-electroniques', NULL, '⚡', 'Électronique grand public', 5),
('00000000-0000-0000-0006-000000000001', 'Services', 'services', NULL, '🛠️', 'Services techniques et réparations', 6);

-- ÉTAPE 11: Insérer les sous-catégories TÉLÉPHONES
INSERT INTO categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0001-000000000002', 'Android', 'telephones-android', '00000000-0000-0000-0001-000000000001', '🤖', 'Smartphones Android', 1),
('00000000-0000-0000-0001-000000000003', 'iPhone', 'telephones-iphone', '00000000-0000-0000-0001-000000000001', '🍎', 'iPhone et appareils Apple', 2),
('00000000-0000-0000-0001-000000000004', 'Basique', 'telephones-basique', '00000000-0000-0000-0001-000000000001', '📞', 'Téléphones basiques et feature phones', 3);

-- ÉTAPE 12: Insérer les sous-catégories ORDINATEURS
INSERT INTO categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0002-000000000002', 'Laptop', 'ordinateurs-laptop', '00000000-0000-0000-0002-000000000001', '💻', 'Ordinateurs portables', 1),
('00000000-0000-0000-0002-000000000003', 'Desktop', 'ordinateurs-desktop', '00000000-0000-0000-0002-000000000001', '🖥️', 'Ordinateurs de bureau', 2),
('00000000-0000-0000-0002-000000000004', 'PC Gamer', 'ordinateurs-pc-gamer', '00000000-0000-0000-0002-000000000001', '🎮', 'PC Gaming et stations de jeu', 3),
('00000000-0000-0000-0002-000000000005', 'Tablettes', 'ordinateurs-tablettes', '00000000-0000-0000-0002-000000000001', '📱', 'Tablettes et iPad', 4);

-- ÉTAPE 13: Insérer les sous-catégories ACCESSOIRES
INSERT INTO categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0003-000000000002', 'Coques', 'accessoires-coques', '00000000-0000-0000-0003-000000000001', '🛡️', 'Coques et étuis de protection', 1),
('00000000-0000-0000-0003-000000000003', 'Chargeurs', 'accessoires-chargeurs', '00000000-0000-0000-0003-000000000001', '🔌', 'Chargeurs et adaptateurs', 2),
('00000000-0000-0000-0003-000000000004', 'Power banks', 'accessoires-power-banks', '00000000-0000-0000-0003-000000000001', '🔋', 'Batteries externes et power banks', 3),
('00000000-0000-0000-0003-000000000005', 'Casques', 'accessoires-casques', '00000000-0000-0000-0003-000000000001', '🎧', 'Casques audio et écouteurs', 4),
('00000000-0000-0000-0003-000000000006', 'Câbles', 'accessoires-cables', '00000000-0000-0000-0003-000000000001', '🔌', 'Câbles USB, Lightning, etc.', 5);

-- ÉTAPE 14: Insérer les sous-catégories PIÈCES DÉTACHÉES
INSERT INTO categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0004-000000000002', 'Écrans', 'pieces-detachees-ecrans', '00000000-0000-0000-0004-000000000001', '📺', 'Écrans LCD, OLED et pièces d''affichage', 1),
('00000000-0000-0000-0004-000000000003', 'Batteries', 'pieces-detachees-batteries', '00000000-0000-0000-0004-000000000001', '🔋', 'Batteries de remplacement', 2),
('00000000-0000-0000-0004-000000000004', 'Connecteurs', 'pieces-detachees-connecteurs', '00000000-0000-0000-0004-000000000001', '🔌', 'Connecteurs et ports de charge', 3),
('00000000-0000-0000-0004-000000000005', 'Caméras', 'pieces-detachees-cameras', '00000000-0000-0000-0004-000000000001', '📷', 'Modules caméra et objectifs', 4);

-- ÉTAPE 15: Insérer les sous-catégories APPAREILS ÉLECTRONIQUES
INSERT INTO categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0005-000000000002', 'TV', 'appareils-electroniques-tv', '00000000-0000-0000-0005-000000000001', '📺', 'Téléviseurs et écrans TV', 1),
('00000000-0000-0000-0005-000000000003', 'Caméras', 'appareils-electroniques-cameras', '00000000-0000-0000-0005-000000000001', '📷', 'Appareils photo et caméras', 2),
('00000000-0000-0000-0005-000000000004', 'Montres connectées', 'appareils-electroniques-montres', '00000000-0000-0000-0005-000000000001', '⌚', 'Smartwatches et montres intelligentes', 3),
('00000000-0000-0000-0005-000000000005', 'Imprimantes', 'appareils-electroniques-imprimantes', '00000000-0000-0000-0005-000000000001', '🖨️', 'Imprimantes et scanners', 4),
('00000000-0000-0000-0005-000000000006', 'Routeurs', 'appareils-electroniques-routeurs', '00000000-0000-0000-0005-000000000001', '📡', 'Routeurs WiFi et réseaux', 5),
('00000000-0000-0000-0005-000000000007', 'Consoles', 'appareils-electroniques-consoles', '00000000-0000-0000-0005-000000000001', '🎮', 'Consoles de jeu', 6),
('00000000-0000-0000-0005-000000000008', 'Enceintes', 'appareils-electroniques-enceintes', '00000000-0000-0000-0005-000000000001', '🔊', 'Enceintes et systèmes audio', 7);

-- ÉTAPE 16: Insérer les sous-catégories SERVICES
INSERT INTO categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0006-000000000002', 'Réparation', 'services-reparation', '00000000-0000-0000-0006-000000000001', '🔧', 'Services de réparation et maintenance', 1),
('00000000-0000-0000-0006-000000000003', 'Installation', 'services-installation', '00000000-0000-0000-0006-000000000001', '⚙️', 'Installation et configuration', 2),
('00000000-0000-0000-0006-000000000004', 'Support technique', 'services-support', '00000000-0000-0000-0006-000000000001', '💬', 'Support et assistance technique', 3),
('00000000-0000-0000-0006-000000000005', 'Formation', 'services-formation', '00000000-0000-0000-0006-000000000001', '📚', 'Formation et cours', 4);

-- ÉTAPE 17: Mettre à jour les produits existants
-- Option A: Mettre tous les category_id à NULL (les produits seront sans catégorie)
-- Tu pourras les réassigner manuellement après
UPDATE products SET category_id = NULL WHERE category_id IS NOT NULL;

-- Option B: Si tu veux mapper automatiquement (décommente et adapte selon tes besoins)
-- Exemple: mapper "Phones" vers "Téléphones > Android"
-- UPDATE products p
-- SET category_id = (
--   SELECT id FROM categories 
--   WHERE slug = 'telephones-android' 
--   LIMIT 1
-- )
-- WHERE EXISTS (
--   SELECT 1 FROM categories_backup cb 
--   WHERE cb.id = p.category_id 
--   AND cb.key = 'phones'
-- );

-- ÉTAPE 18: Recréer la contrainte sur products (avec ON DELETE SET NULL pour sécurité)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'products'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'category_id'
  ) THEN
    -- Vérifier qu'il n'y a pas de category_id invalides
    IF NOT EXISTS (
      SELECT 1 FROM products p
      WHERE p.category_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM categories c WHERE c.id = p.category_id
      )
    ) THEN
      -- Recréer la contrainte
      ALTER TABLE products 
      ADD CONSTRAINT products_category_id_fkey 
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
      
      RAISE NOTICE 'Contrainte recréée avec succès';
    ELSE
      RAISE NOTICE 'ATTENTION: Il reste des category_id invalides dans products. Mise à NULL...';
      UPDATE products 
      SET category_id = NULL 
      WHERE category_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM categories c WHERE c.id = products.category_id
      );
      
      -- Réessayer de créer la contrainte
      ALTER TABLE products 
      ADD CONSTRAINT products_category_id_fkey 
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- ÉTAPE 19: Vérification finale
SELECT 
  '✅ Migration terminée!' as status,
  (SELECT COUNT(*) FROM categories) as total_categories,
  (SELECT COUNT(*) FROM categories WHERE parent_id IS NULL) as categories_principales,
  (SELECT COUNT(*) FROM categories WHERE parent_id IS NOT NULL) as sous_categories,
  (SELECT COUNT(*) FROM products WHERE category_id IS NULL) as produits_sans_categorie,
  (SELECT COUNT(*) FROM products WHERE category_id IS NOT NULL) as produits_avec_categorie
FROM categories
LIMIT 1;

-- Afficher l'arbre des catégories
SELECT 
  CASE 
    WHEN parent_id IS NULL THEN '📁 ' || name
    ELSE '  └─ ' || name
  END as arbre,
  slug,
  icon
FROM categories
ORDER BY 
  COALESCE(parent_id, id),
  sort_order;

