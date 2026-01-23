-- ============================================
-- MIGRATION COMPLÈTE - NEXUS TECH
-- ============================================
-- Instructions: 
-- 1. Ouvrez Supabase Dashboard > SQL Editor
-- 2. Copiez-collez TOUT ce fichier
-- 3. Cliquez sur "Run"
-- ============================================

-- Extensions utiles
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- 1. PROFILS UTILISATEURS
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fonction pour updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger pour profiles
DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-créer un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.phone)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. CATÉGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS categories_set_updated_at ON public.categories;
CREATE TRIGGER categories_set_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_categories_parent ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- ============================================
-- 3. PRODUITS
-- ============================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  sku TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INT NOT NULL CHECK (price_cents >= 0),
  compare_at_price_cents INT CHECK (compare_at_price_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_refurbished BOOLEAN NOT NULL DEFAULT false,
  condition TEXT NOT NULL DEFAULT 'new' CHECK (condition IN ('new','refurbished')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS products_set_updated_at ON public.products;
CREATE TRIGGER products_set_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================
-- 4. IMAGES PRODUITS
-- ============================================
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);

-- ============================================
-- 5. COMMANDES
-- ============================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
  total_cents INT NOT NULL DEFAULT 0 CHECK (total_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  customer_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS orders_set_updated_at ON public.orders;
CREATE TRIGGER orders_set_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================
-- 6. ARTICLES DE COMMANDE
-- ============================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  name_snapshot TEXT NOT NULL,
  price_cents_snapshot INT NOT NULL CHECK (price_cents_snapshot >= 0),
  quantity INT NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- Fonction pour recalculer le total de la commande
DROP FUNCTION IF EXISTS public.recompute_order_total(UUID);
CREATE FUNCTION public.recompute_order_total(p_order_id UUID)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE public.orders o
  SET total_cents = COALESCE((
    SELECT SUM(oi.price_cents_snapshot * oi.quantity)
    FROM public.order_items oi
    WHERE oi.order_id = p_order_id
  ), 0),
  updated_at = NOW()
  WHERE o.id = p_order_id;
$$;

-- Trigger pour recalculer le total
CREATE OR REPLACE FUNCTION public.on_order_items_changed()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM public.recompute_order_total(COALESCE(NEW.order_id, OLD.order_id));
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS order_items_changed ON public.order_items;
CREATE TRIGGER order_items_changed
AFTER INSERT OR UPDATE OR DELETE ON public.order_items
FOR EACH ROW EXECUTE FUNCTION public.on_order_items_changed();

-- ============================================
-- 7. RLS + POLICIES
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Helper: is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.is_admin = true
  );
$$;

-- Policies pour profiles
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

-- Policies pour categories
DROP POLICY IF EXISTS "categories_select_public" ON public.categories;
CREATE POLICY "categories_select_public"
ON public.categories FOR SELECT
USING (true);

DROP POLICY IF EXISTS "categories_write_admin" ON public.categories;
CREATE POLICY "categories_write_admin"
ON public.categories FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Policies pour products
DROP POLICY IF EXISTS "products_select_public_active" ON public.products;
CREATE POLICY "products_select_public_active"
ON public.products FOR SELECT
USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "products_write_admin" ON public.products;
CREATE POLICY "products_write_admin"
ON public.products FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Policies pour product_images
DROP POLICY IF EXISTS "product_images_select_public" ON public.product_images;
CREATE POLICY "product_images_select_public"
ON public.product_images FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.products p
    WHERE p.id = product_id AND (p.is_active = true OR public.is_admin())
  )
);

DROP POLICY IF EXISTS "product_images_write_admin" ON public.product_images;
CREATE POLICY "product_images_write_admin"
ON public.product_images FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Policies pour orders
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
CREATE POLICY "orders_select_own"
ON public.orders FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
CREATE POLICY "orders_insert_own"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_update_admin" ON public.orders;
CREATE POLICY "orders_update_admin"
ON public.orders FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Policies pour order_items
DROP POLICY IF EXISTS "order_items_select_owner" ON public.order_items;
CREATE POLICY "order_items_select_owner"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin())
  )
);

DROP POLICY IF EXISTS "order_items_insert_owner" ON public.order_items;
CREATE POLICY "order_items_insert_owner"
ON public.order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_id AND o.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "order_items_write_admin" ON public.order_items;
CREATE POLICY "order_items_write_admin"
ON public.order_items FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================
-- 8. STORAGE: BUCKET + POLICIES
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Lecture publique des images
DROP POLICY IF EXISTS "public_read_product_images" ON storage.objects;
CREATE POLICY "public_read_product_images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Écriture admin seulement
DROP POLICY IF EXISTS "admin_write_product_images" ON storage.objects;
CREATE POLICY "admin_write_product_images"
ON storage.objects FOR ALL
USING (bucket_id = 'product-images' AND public.is_admin())
WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

-- ============================================
-- 9. FONCTIONNALITÉS AVANCÉES
-- ============================================

-- Wishlist
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlists_user ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product ON public.wishlists(product_id);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wishlists_select_own" ON public.wishlists;
CREATE POLICY "wishlists_select_own"
ON public.wishlists FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "wishlists_insert_own" ON public.wishlists;
CREATE POLICY "wishlists_insert_own"
ON public.wishlists FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "wishlists_delete_own" ON public.wishlists;
CREATE POLICY "wishlists_delete_own"
ON public.wishlists FOR DELETE
USING (auth.uid() = user_id);

-- Reviews
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.product_reviews(user_id);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_select_approved" ON public.product_reviews;
CREATE POLICY "reviews_select_approved"
ON public.product_reviews FOR SELECT
USING (is_approved = true OR auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "reviews_insert_own" ON public.product_reviews;
CREATE POLICY "reviews_insert_own"
ON public.product_reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_update_own" ON public.product_reviews;
CREATE POLICY "reviews_update_own"
ON public.product_reviews FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_admin_all" ON public.product_reviews;
CREATE POLICY "reviews_admin_all"
ON public.product_reviews FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Stock Notifications
CREATE TABLE IF NOT EXISTS public.stock_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_stock_notifications_user ON public.stock_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_notifications_product ON public.stock_notifications(product_id);

ALTER TABLE public.stock_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stock_notifications_select_own" ON public.stock_notifications;
CREATE POLICY "stock_notifications_select_own"
ON public.stock_notifications FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "stock_notifications_insert_own" ON public.stock_notifications;
CREATE POLICY "stock_notifications_insert_own"
ON public.stock_notifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "stock_notifications_admin_all" ON public.stock_notifications;
CREATE POLICY "stock_notifications_admin_all"
ON public.stock_notifications FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Coupons
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value_cents INT NOT NULL CHECK (discount_value_cents > 0),
  min_purchase_cents INT DEFAULT 0,
  max_uses INT,
  used_count INT NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(is_active) WHERE is_active = true;

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coupons_select_public" ON public.coupons;
CREATE POLICY "coupons_select_public"
ON public.coupons FOR SELECT
USING (is_active = true AND (valid_until IS NULL OR valid_until > NOW()));

DROP POLICY IF EXISTS "coupons_admin_all" ON public.coupons;
CREATE POLICY "coupons_admin_all"
ON public.coupons FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Coupon Usage
CREATE TABLE IF NOT EXISTS public.coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON public.coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user ON public.coupon_usage(user_id);

ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coupon_usage_select_own" ON public.coupon_usage;
CREATE POLICY "coupon_usage_select_own"
ON public.coupon_usage FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "coupon_usage_insert_own" ON public.coupon_usage;
CREATE POLICY "coupon_usage_insert_own"
ON public.coupon_usage FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Loyalty Points
CREATE TABLE IF NOT EXISTS public.loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INT NOT NULL DEFAULT 0 CHECK (points >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_loyalty_points_user ON public.loyalty_points(user_id);

ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "loyalty_select_own" ON public.loyalty_points;
CREATE POLICY "loyalty_select_own"
ON public.loyalty_points FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "loyalty_admin_all" ON public.loyalty_points;
CREATE POLICY "loyalty_admin_all"
ON public.loyalty_points FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Loyalty Transactions
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points_change INT NOT NULL,
  reason TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user ON public.loyalty_transactions(user_id);

ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "loyalty_transactions_select_own" ON public.loyalty_transactions;
CREATE POLICY "loyalty_transactions_select_own"
ON public.loyalty_transactions FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

-- Browsing History
CREATE TABLE IF NOT EXISTS public.browsing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  session_id TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_browsing_history_user ON public.browsing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_browsing_history_product ON public.browsing_history(product_id);
CREATE INDEX IF NOT EXISTS idx_browsing_history_viewed_at ON public.browsing_history(viewed_at DESC);

ALTER TABLE public.browsing_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "browsing_history_select_own" ON public.browsing_history;
CREATE POLICY "browsing_history_select_own"
ON public.browsing_history FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "browsing_history_insert_own" ON public.browsing_history;
CREATE POLICY "browsing_history_insert_own"
ON public.browsing_history FOR INSERT
WITH CHECK (auth.uid() = user_id OR session_id IS NOT NULL);

-- Product Views (Intérêts clients)
CREATE TABLE IF NOT EXISTS public.product_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_id TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_views_user ON public.product_views(user_id);
CREATE INDEX IF NOT EXISTS idx_product_views_product ON public.product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_viewed_at ON public.product_views(viewed_at DESC);

ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_views_select_own" ON public.product_views;
CREATE POLICY "product_views_select_own"
ON public.product_views FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "product_views_insert_own" ON public.product_views;
CREATE POLICY "product_views_insert_own"
ON public.product_views FOR INSERT
WITH CHECK (auth.uid() = user_id OR session_id IS NOT NULL);

DROP POLICY IF EXISTS "product_views_admin_all" ON public.product_views;
CREATE POLICY "product_views_admin_all"
ON public.product_views FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Search Queries
CREATE TABLE IF NOT EXISTS public.search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  query TEXT NOT NULL,
  category_slug TEXT,
  results_count INT DEFAULT 0,
  session_id TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_queries_user ON public.search_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_search_queries_created_at ON public.search_queries(created_at DESC);

ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "search_queries_select_own" ON public.search_queries;
CREATE POLICY "search_queries_select_own"
ON public.search_queries FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "search_queries_insert_own" ON public.search_queries;
CREATE POLICY "search_queries_insert_own"
ON public.search_queries FOR INSERT
WITH CHECK (auth.uid() = user_id OR session_id IS NOT NULL);

DROP POLICY IF EXISTS "search_queries_admin_all" ON public.search_queries;
CREATE POLICY "search_queries_admin_all"
ON public.search_queries FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================
-- FIN DE LA MIGRATION
-- ============================================
SELECT '✅ Migration complète terminée!' as status;
