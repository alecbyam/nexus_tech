-- ============================================
-- Système de classement hiérarchique produits
-- Catégories & Sous-catégories
-- ============================================

-- Supprimer la table existante si elle existe (pour migration)
DROP TABLE IF EXISTS categories CASCADE;

-- Créer la table categories avec structure hiérarchique
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  icon VARCHAR(50), -- Emoji ou nom d'icône
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

-- Fonction pour obtenir le chemin complet d'une catégorie (ex: "Téléphones > Android")
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

-- Commentaires pour documentation
COMMENT ON TABLE categories IS 'Table hiérarchique des catégories de produits';
COMMENT ON COLUMN categories.parent_id IS 'Référence vers la catégorie parente (NULL pour catégories principales)';
COMMENT ON COLUMN categories.slug IS 'Identifiant unique URL-friendly';
COMMENT ON COLUMN categories.sort_order IS 'Ordre d''affichage (plus petit = affiché en premier)';

