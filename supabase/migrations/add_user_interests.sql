-- Migration: Ajouter le système de tracking des intérêts clients
-- Date: 2024

-- Table pour tracker les vues de produits
create table if not exists public.product_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  session_id text, -- Pour tracker les sessions anonymes
  ip_address text, -- Optionnel, pour analytics
  created_at timestamptz not null default now()
);

-- Table pour tracker les recherches
create table if not exists public.search_queries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  query text not null,
  category_slug text,
  results_count int default 0,
  session_id text,
  ip_address text,
  created_at timestamptz not null default now()
);

-- Index pour améliorer les performances
create index if not exists idx_product_views_user on public.product_views(user_id);
create index if not exists idx_product_views_product on public.product_views(product_id);
create index if not exists idx_product_views_viewed_at on public.product_views(viewed_at desc);
create index if not exists idx_search_queries_user on public.search_queries(user_id);
create index if not exists idx_search_queries_created_at on public.search_queries(created_at desc);

-- RLS Policies
-- Les utilisateurs peuvent voir leurs propres vues
drop policy if exists "product_views_select_own" on public.product_views;
create policy "product_views_select_own"
on public.product_views for select
using (auth.uid() = user_id or public.is_admin());

-- Les utilisateurs peuvent insérer leurs propres vues
drop policy if exists "product_views_insert_own" on public.product_views;
create policy "product_views_insert_own"
on public.product_views for insert
with check (auth.uid() = user_id or auth.uid() is null);

-- Les admins peuvent tout voir
drop policy if exists "product_views_admin_all" on public.product_views;
create policy "product_views_admin_all"
on public.product_views for all
using (public.is_admin())
with check (public.is_admin());

-- Recherches: utilisateurs voient leurs recherches, admins voient tout
drop policy if exists "search_queries_select_own" on public.search_queries;
create policy "search_queries_select_own"
on public.search_queries for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "search_queries_insert_own" on public.search_queries;
create policy "search_queries_insert_own"
on public.search_queries for insert
with check (auth.uid() = user_id or auth.uid() is null);

drop policy if exists "search_queries_admin_all" on public.search_queries;
create policy "search_queries_admin_all"
on public.search_queries for all
using (public.is_admin())
with check (public.is_admin());
