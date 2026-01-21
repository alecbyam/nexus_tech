-- NEXUS TECH - Schéma PostgreSQL (Supabase)
-- Inclut: tables, contraintes, triggers, RLS, policies, storage bucket + policies

-- Extensions utiles
create extension if not exists pgcrypto;

-- 1) Profils utilisateurs (lié à auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Auto-créer un profil à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.phone)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 2) Catégories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  key text not null unique, -- Phones / Computers / Accessories / Services
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 3) Produits
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  sku text unique,
  name text not null,
  description text,
  price_cents int not null check (price_cents >= 0),
  currency text not null default 'USD',
  stock int not null default 0 check (stock >= 0),
  is_refurbished boolean not null default false,
  condition text not null default 'new' check (condition in ('new','refurbished')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

-- 4) Images produits (référence Storage)
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null, -- ex: products/<product_id>/<file>.jpg
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_images_product on public.product_images(product_id);

-- 5) Commandes
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  total_cents int not null default 0 check (total_cents >= 0),
  currency text not null default 'USD',
  customer_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

-- 6) Lignes de commande
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name_snapshot text not null,
  price_cents_snapshot int not null check (price_cents_snapshot >= 0),
  quantity int not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_order_items_order on public.order_items(order_id);

-- 7) Fonction de recalcul total
create or replace function public.recompute_order_total(p_order_id uuid)
returns void
language sql
as $$
  update public.orders o
  set total_cents = coalesce((
    select sum(oi.price_cents_snapshot * oi.quantity)
    from public.order_items oi
    where oi.order_id = p_order_id
  ), 0),
  updated_at = now()
  where o.id = p_order_id;
$$;

create or replace function public.on_order_items_changed()
returns trigger
language plpgsql
as $$
begin
  perform public.recompute_order_total(coalesce(new.order_id, old.order_id));
  return null;
end;
$$;

drop trigger if exists order_items_changed on public.order_items;
create trigger order_items_changed
after insert or update or delete on public.order_items
for each row execute function public.on_order_items_changed();

-- =========================
-- RLS + Policies
-- =========================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Helper: is_admin()
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  );
$$;

-- profiles: user peut voir/éditer son profil
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

-- categories: lecture publique, écriture admin
drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public"
on public.categories for select
using (true);

drop policy if exists "categories_write_admin" on public.categories;
create policy "categories_write_admin"
on public.categories for all
using (public.is_admin())
with check (public.is_admin());

-- products: lecture publique (actifs), admin full
drop policy if exists "products_select_public_active" on public.products;
create policy "products_select_public_active"
on public.products for select
using (is_active = true or public.is_admin());

drop policy if exists "products_write_admin" on public.products;
create policy "products_write_admin"
on public.products for all
using (public.is_admin())
with check (public.is_admin());

-- product_images: lecture publique (si produit actif), admin full
drop policy if exists "product_images_select_public" on public.product_images;
create policy "product_images_select_public"
on public.product_images for select
using (
  exists (
    select 1
    from public.products p
    where p.id = product_id and (p.is_active = true or public.is_admin())
  )
);

drop policy if exists "product_images_write_admin" on public.product_images;
create policy "product_images_write_admin"
on public.product_images for all
using (public.is_admin())
with check (public.is_admin());

-- orders: user voit ses commandes, admin voit tout
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
on public.orders for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own"
on public.orders for insert
with check (auth.uid() = user_id);

drop policy if exists "orders_update_admin" on public.orders;
create policy "orders_update_admin"
on public.orders for update
using (public.is_admin())
with check (public.is_admin());

-- order_items: lecture si appartient à order, insertion pour owner, admin full
drop policy if exists "order_items_select_owner" on public.order_items;
create policy "order_items_select_owner"
on public.order_items for select
using (
  exists (
    select 1 from public.orders o
    where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists "order_items_insert_owner" on public.order_items;
create policy "order_items_insert_owner"
on public.order_items for insert
with check (
  exists (
    select 1 from public.orders o
    where o.id = order_id and o.user_id = auth.uid()
  )
);

drop policy if exists "order_items_write_admin" on public.order_items;
create policy "order_items_write_admin"
on public.order_items for update
using (public.is_admin())
with check (public.is_admin());

-- =========================
-- Storage: bucket + policies
-- =========================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Lecture publique des images
drop policy if exists "public_read_product_images" on storage.objects;
create policy "public_read_product_images"
on storage.objects for select
using (bucket_id = 'product-images');

-- Écriture admin seulement
drop policy if exists "admin_write_product_images" on storage.objects;
create policy "admin_write_product_images"
on storage.objects for all
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());


