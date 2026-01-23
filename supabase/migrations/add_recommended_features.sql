-- Migration: Ajouter toutes les fonctionnalités recommandées
-- Date: 2024

-- ============================================
-- 1. WISHLIST / LISTE DE SOUHAITS
-- ============================================
create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

create index if not exists idx_wishlists_user on public.wishlists(user_id);
create index if not exists idx_wishlists_product on public.wishlists(product_id);

-- RLS pour wishlists
drop policy if exists "wishlists_select_own" on public.wishlists;
create policy "wishlists_select_own"
on public.wishlists for select
using (auth.uid() = user_id);

drop policy if exists "wishlists_insert_own" on public.wishlists;
create policy "wishlists_insert_own"
on public.wishlists for insert
with check (auth.uid() = user_id);

drop policy if exists "wishlists_delete_own" on public.wishlists;
create policy "wishlists_delete_own"
on public.wishlists for delete
using (auth.uid() = user_id);

-- ============================================
-- 2. AVIS ET NOTES PRODUITS
-- ============================================
create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, product_id)
);

create index if not exists idx_reviews_product on public.product_reviews(product_id);
create index if not exists idx_reviews_user on public.product_reviews(user_id);
create index if not exists idx_reviews_approved on public.product_reviews(is_approved) where is_approved = true;

drop trigger if exists reviews_set_updated_at on public.product_reviews;
create trigger reviews_set_updated_at
before update on public.product_reviews
for each row execute function public.set_updated_at();

-- RLS pour reviews
drop policy if exists "reviews_select_approved" on public.product_reviews;
create policy "reviews_select_approved"
on public.product_reviews for select
using (is_approved = true or auth.uid() = user_id or public.is_admin());

drop policy if exists "reviews_insert_own" on public.product_reviews;
create policy "reviews_insert_own"
on public.product_reviews for insert
with check (auth.uid() = user_id);

drop policy if exists "reviews_update_own" on public.product_reviews;
create policy "reviews_update_own"
on public.product_reviews for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "reviews_admin_all" on public.product_reviews;
create policy "reviews_admin_all"
on public.product_reviews for all
using (public.is_admin())
with check (public.is_admin());

-- ============================================
-- 3. NOTIFICATIONS DE STOCK
-- ============================================
create table if not exists public.stock_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  email text,
  phone text,
  is_notified boolean not null default false,
  notified_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_stock_notifications_product on public.stock_notifications(product_id);
create index if not exists idx_stock_notifications_user on public.stock_notifications(user_id);
create index if not exists idx_stock_notifications_pending on public.stock_notifications(is_notified) where is_notified = false;

-- RLS pour stock_notifications
drop policy if exists "stock_notifications_select_own" on public.stock_notifications;
create policy "stock_notifications_select_own"
on public.stock_notifications for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "stock_notifications_insert_own" on public.stock_notifications;
create policy "stock_notifications_insert_own"
on public.stock_notifications for insert
with check (auth.uid() = user_id or auth.uid() is null);

drop policy if exists "stock_notifications_admin_all" on public.stock_notifications;
create policy "stock_notifications_admin_all"
on public.stock_notifications for all
using (public.is_admin())
with check (public.is_admin());

-- ============================================
-- 4. CODES PROMO / COUPONS
-- ============================================
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value int not null check (discount_value > 0),
  min_purchase_cents int default 0,
  max_discount_cents int,
  usage_limit int,
  used_count int not null default 0,
  is_active boolean not null default true,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_coupons_code on public.coupons(code);
create index if not exists idx_coupons_active on public.coupons(is_active) where is_active = true;

drop trigger if exists coupons_set_updated_at on public.coupons;
create trigger coupons_set_updated_at
before update on public.coupons
for each row execute function public.set_updated_at();

create table if not exists public.coupon_usage (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  discount_amount_cents int not null,
  used_at timestamptz not null default now()
);

create index if not exists idx_coupon_usage_coupon on public.coupon_usage(coupon_id);
create index if not exists idx_coupon_usage_user on public.coupon_usage(user_id);

-- RLS pour coupons
drop policy if exists "coupons_select_public" on public.coupons;
create policy "coupons_select_public"
on public.coupons for select
using (is_active = true and (valid_until is null or valid_until > now()));

drop policy if exists "coupons_admin_all" on public.coupons;
create policy "coupons_admin_all"
on public.coupons for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "coupon_usage_select_own" on public.coupon_usage;
create policy "coupon_usage_select_own"
on public.coupon_usage for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "coupon_usage_insert_own" on public.coupon_usage;
create policy "coupon_usage_insert_own"
on public.coupon_usage for insert
with check (auth.uid() = user_id);

-- ============================================
-- 5. PROGRAMME DE FIDÉLITÉ
-- ============================================
create table if not exists public.loyalty_points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  points int not null default 0 check (points >= 0),
  total_earned int not null default 0,
  total_redeemed int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  points int not null,
  transaction_type text not null check (transaction_type in ('earned', 'redeemed', 'expired', 'adjusted')),
  description text,
  order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_loyalty_user on public.loyalty_points(user_id);
create index if not exists idx_loyalty_transactions_user on public.loyalty_transactions(user_id);

drop trigger if exists loyalty_set_updated_at on public.loyalty_points;
create trigger loyalty_set_updated_at
before update on public.loyalty_points
for each row execute function public.set_updated_at();

-- RLS pour loyalty
drop policy if exists "loyalty_select_own" on public.loyalty_points;
create policy "loyalty_select_own"
on public.loyalty_points for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "loyalty_transactions_select_own" on public.loyalty_transactions;
create policy "loyalty_transactions_select_own"
on public.loyalty_transactions for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "loyalty_admin_all" on public.loyalty_points;
create policy "loyalty_admin_all"
on public.loyalty_points for all
using (public.is_admin())
with check (public.is_admin());

-- ============================================
-- 6. NOTIFICATIONS ADMIN
-- ============================================
create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('new_order', 'low_stock', 'new_review', 'stock_alert')),
  title text not null,
  message text not null,
  data jsonb,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_notifications_read on public.admin_notifications(is_read) where is_read = false;
create index if not exists idx_admin_notifications_created on public.admin_notifications(created_at desc);

-- RLS pour admin_notifications
drop policy if exists "admin_notifications_admin_only" on public.admin_notifications;
create policy "admin_notifications_admin_only"
on public.admin_notifications for all
using (public.is_admin())
with check (public.is_admin());

-- ============================================
-- 7. HISTORIQUE DE NAVIGATION
-- ============================================
create table if not exists public.browsing_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  session_id text,
  viewed_at timestamptz not null default now()
);

create index if not exists idx_browsing_history_user on public.browsing_history(user_id);
create index if not exists idx_browsing_history_session on public.browsing_history(session_id);
create index if not exists idx_browsing_history_viewed on public.browsing_history(viewed_at desc);

-- RLS pour browsing_history
drop policy if exists "browsing_history_select_own" on public.browsing_history;
create policy "browsing_history_select_own"
on public.browsing_history for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "browsing_history_insert_own" on public.browsing_history;
create policy "browsing_history_insert_own"
on public.browsing_history for insert
with check (auth.uid() = user_id or auth.uid() is null);

-- Fonction pour nettoyer l'historique ancien (plus de 90 jours)
create or replace function public.cleanup_old_browsing_history()
returns void
language plpgsql
as $$
begin
  delete from public.browsing_history
  where viewed_at < now() - interval '90 days';
end;
$$;
