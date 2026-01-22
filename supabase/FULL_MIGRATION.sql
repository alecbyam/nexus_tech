-- ============================================
-- MIGRATION COMPLÈTE - Supprime tout et recrée
-- ============================================
-- ATTENTION: Ce script supprime TOUTES les données existantes
-- ============================================

-- ÉTAPE 1: Supprimer toutes les tables existantes (dans l'ordre des dépendances)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ÉTAPE 2: Supprimer les fonctions et triggers existants
DROP FUNCTION IF EXISTS update_categories_updated_at() CASCADE;
DROP FUNCTION IF EXISTS get_category_path(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS recompute_order_total() CASCADE;

-- ÉTAPE 3: Supprimer les vues
DROP VIEW IF EXISTS categories_tree CASCADE;

-- ÉTAPE 4: Créer les extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- CRÉATION DES TABLES
-- ============================================

-- 1) PROFILS UTILISATEURS
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  full_name TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger updated_at pour profiles
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Auto-créer un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.phone
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2) CATÉGORIES (Structure hiérarchique)
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  icon VARCHAR(50),
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour categories
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_sort_order ON public.categories(sort_order);
CREATE INDEX idx_categories_active ON public.categories(is_active) WHERE is_active = true;

-- Fonction updated_at pour categories
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();

-- Fonction get_category_path
CREATE OR REPLACE FUNCTION get_category_path(category_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  path TEXT;
  current_id UUID;
  current_name VARCHAR;
BEGIN
  path := '';
  current_id := category_id;
  
  WHILE current_id IS NOT NULL LOOP
    SELECT name, parent_id INTO current_name, current_id
    FROM public.categories
    WHERE id = current_id;
    
    IF path = '' THEN
      path := current_name;
    ELSE
      path := current_name || ' > ' || path;
    END IF;
  END LOOP;
  
  RETURN path;
END;
$$;

-- Vue categories_tree
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
FROM public.categories c;

-- 3) PRODUITS
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sku TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_refurbished BOOLEAN NOT NULL DEFAULT false,
  condition TEXT NOT NULL DEFAULT 'new' CHECK (condition IN ('new', 'refurbished')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_active ON public.products(is_active) WHERE is_active = true;

CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 4) IMAGES PRODUITS
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON public.product_images(product_id);

-- 5) COMMANDES
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  total_cents INTEGER NOT NULL DEFAULT 0 CHECK (total_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  customer_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);

CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 6) ITEMS DE COMMANDE
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_cents_snapshot INTEGER NOT NULL CHECK (price_cents_snapshot >= 0),
  name_snapshot TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_order_items_product ON public.order_items(product_id);

-- Fonction pour recalculer le total d'une commande
CREATE OR REPLACE FUNCTION recompute_order_total()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.orders
  SET total_cents = (
    SELECT COALESCE(SUM(price_cents_snapshot * quantity), 0)
    FROM public.order_items
    WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
  )
  WHERE id = COALESCE(NEW.order_id, OLD.order_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trigger_recompute_order_total
  AFTER INSERT OR UPDATE OR DELETE ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION recompute_order_total();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- PROFILES: Lecture publique, écriture pour soi-même, admin pour tout
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- CATEGORIES: Lecture publique, écriture admin seulement
CREATE POLICY "Categories are viewable by everyone" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify categories" ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- PRODUCTS: Lecture publique, écriture admin seulement
CREATE POLICY "Products are viewable by everyone" ON public.products
  FOR SELECT USING (is_active = true OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Only admins can modify products" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- PRODUCT_IMAGES: Lecture publique, écriture admin seulement
CREATE POLICY "Product images are viewable by everyone" ON public.product_images
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify product images" ON public.product_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ORDERS: Utilisateurs voient leurs commandes, admins voient tout
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Users can create own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any order" ON public.orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ORDER_ITEMS: Même logique que orders
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_items.order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Users can create order items for own orders" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_items.order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can modify any order items" ON public.order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================
-- STORAGE BUCKET: product-images
-- ============================================

-- Supprimer le bucket existant s'il existe
DELETE FROM storage.buckets WHERE id = 'product-images';

-- Créer le bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- Policy: Lecture publique
CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Policy: Upload admin seulement
CREATE POLICY "Admins can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Policy: Suppression admin seulement
CREATE POLICY "Admins can delete product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ============================================
-- INSÉRER LES CATÉGORIES
-- ============================================

-- Catégories principales
INSERT INTO public.categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0001-000000000001', 'Téléphones', 'telephones', NULL, '📱', 'Smartphones et téléphones portables', 1),
('00000000-0000-0000-0002-000000000001', 'Ordinateurs', 'ordinateurs', NULL, '💻', 'Ordinateurs portables et de bureau', 2),
('00000000-0000-0000-0003-000000000001', 'Accessoires', 'accessoires', NULL, '🎧', 'Accessoires pour téléphones et ordinateurs', 3),
('00000000-0000-0000-0004-000000000001', 'Pièces détachées', 'pieces-detachees', NULL, '🔧', 'Composants et pièces de rechange', 4),
('00000000-0000-0000-0005-000000000001', 'Appareils électroniques', 'appareils-electroniques', NULL, '⚡', 'Électronique grand public', 5),
('00000000-0000-0000-0006-000000000001', 'Services', 'services', NULL, '🛠️', 'Services techniques et réparations', 6);

-- Sous-catégories TÉLÉPHONES
INSERT INTO public.categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0001-000000000002', 'Android', 'telephones-android', '00000000-0000-0000-0001-000000000001', '🤖', 'Smartphones Android', 1),
('00000000-0000-0000-0001-000000000003', 'iPhone', 'telephones-iphone', '00000000-0000-0000-0001-000000000001', '🍎', 'iPhone et appareils Apple', 2),
('00000000-0000-0000-0001-000000000004', 'Basique', 'telephones-basique', '00000000-0000-0000-0001-000000000001', '📞', 'Téléphones basiques et feature phones', 3);

-- Sous-catégories ORDINATEURS
INSERT INTO public.categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0002-000000000002', 'Laptop', 'ordinateurs-laptop', '00000000-0000-0000-0002-000000000001', '💻', 'Ordinateurs portables', 1),
('00000000-0000-0000-0002-000000000003', 'Desktop', 'ordinateurs-desktop', '00000000-0000-0000-0002-000000000001', '🖥️', 'Ordinateurs de bureau', 2),
('00000000-0000-0000-0002-000000000004', 'PC Gamer', 'ordinateurs-pc-gamer', '00000000-0000-0000-0002-000000000001', '🎮', 'PC Gaming et stations de jeu', 3),
('00000000-0000-0000-0002-000000000005', 'Tablettes', 'ordinateurs-tablettes', '00000000-0000-0000-0002-000000000001', '📱', 'Tablettes et iPad', 4);

-- Sous-catégories ACCESSOIRES
INSERT INTO public.categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0003-000000000002', 'Coques', 'accessoires-coques', '00000000-0000-0000-0003-000000000001', '🛡️', 'Coques et étuis de protection', 1),
('00000000-0000-0000-0003-000000000003', 'Chargeurs', 'accessoires-chargeurs', '00000000-0000-0000-0003-000000000001', '🔌', 'Chargeurs et adaptateurs', 2),
('00000000-0000-0000-0003-000000000004', 'Power banks', 'accessoires-power-banks', '00000000-0000-0000-0003-000000000001', '🔋', 'Batteries externes et power banks', 3),
('00000000-0000-0000-0003-000000000005', 'Casques', 'accessoires-casques', '00000000-0000-0000-0003-000000000001', '🎧', 'Casques audio et écouteurs', 4),
('00000000-0000-0000-0003-000000000006', 'Câbles', 'accessoires-cables', '00000000-0000-0000-0003-000000000001', '🔌', 'Câbles USB, Lightning, etc.', 5);

-- Sous-catégories PIÈCES DÉTACHÉES
INSERT INTO public.categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0004-000000000002', 'Écrans', 'pieces-detachees-ecrans', '00000000-0000-0000-0004-000000000001', '📺', 'Écrans LCD, OLED et pièces d''affichage', 1),
('00000000-0000-0000-0004-000000000003', 'Batteries', 'pieces-detachees-batteries', '00000000-0000-0000-0004-000000000001', '🔋', 'Batteries de remplacement', 2),
('00000000-0000-0000-0004-000000000004', 'Connecteurs', 'pieces-detachees-connecteurs', '00000000-0000-0000-0004-000000000001', '🔌', 'Connecteurs et ports de charge', 3),
('00000000-0000-0000-0004-000000000005', 'Caméras', 'pieces-detachees-cameras', '00000000-0000-0000-0004-000000000001', '📷', 'Modules caméra et objectifs', 4);

-- Sous-catégories APPAREILS ÉLECTRONIQUES
INSERT INTO public.categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0005-000000000002', 'TV', 'appareils-electroniques-tv', '00000000-0000-0000-0005-000000000001', '📺', 'Téléviseurs et écrans TV', 1),
('00000000-0000-0000-0005-000000000003', 'Caméras', 'appareils-electroniques-cameras', '00000000-0000-0000-0005-000000000001', '📷', 'Appareils photo et caméras', 2),
('00000000-0000-0000-0005-000000000004', 'Montres connectées', 'appareils-electroniques-montres', '00000000-0000-0000-0005-000000000001', '⌚', 'Smartwatches et montres intelligentes', 3),
('00000000-0000-0000-0005-000000000005', 'Imprimantes', 'appareils-electroniques-imprimantes', '00000000-0000-0000-0005-000000000001', '🖨️', 'Imprimantes et scanners', 4),
('00000000-0000-0000-0005-000000000006', 'Routeurs', 'appareils-electroniques-routeurs', '00000000-0000-0000-0005-000000000001', '📡', 'Routeurs WiFi et réseaux', 5),
('00000000-0000-0000-0005-000000000007', 'Consoles', 'appareils-electroniques-consoles', '00000000-0000-0000-0005-000000000001', '🎮', 'Consoles de jeu', 6),
('00000000-0000-0000-0005-000000000008', 'Enceintes', 'appareils-electroniques-enceintes', '00000000-0000-0000-0005-000000000001', '🔊', 'Enceintes et systèmes audio', 7);

-- Sous-catégories SERVICES
INSERT INTO public.categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0006-000000000002', 'Réparation', 'services-reparation', '00000000-0000-0000-0006-000000000001', '🔧', 'Services de réparation et maintenance', 1),
('00000000-0000-0000-0006-000000000003', 'Installation', 'services-installation', '00000000-0000-0000-0006-000000000001', '⚙️', 'Installation et configuration', 2),
('00000000-0000-0000-0006-000000000004', 'Support technique', 'services-support', '00000000-0000-0000-0006-000000000001', '💬', 'Support et assistance technique', 3),
('00000000-0000-0000-0006-000000000005', 'Formation', 'services-formation', '00000000-0000-0000-0006-000000000001', '📚', 'Formation et cours', 4);

-- ============================================
-- VÉRIFICATION FINALE
-- ============================================

SELECT 
  '✅ Migration complète terminée!' as status,
  (SELECT COUNT(*) FROM public.categories) as total_categories,
  (SELECT COUNT(*) FROM public.categories WHERE parent_id IS NULL) as categories_principales,
  (SELECT COUNT(*) FROM public.categories WHERE parent_id IS NOT NULL) as sous_categories;

-- Afficher l'arbre des catégories
SELECT 
  CASE 
    WHEN parent_id IS NULL THEN '📁 ' || name
    ELSE '  └─ ' || name
  END as arbre,
  slug,
  icon
FROM public.categories
ORDER BY 
  COALESCE(parent_id, id),
  sort_order;

