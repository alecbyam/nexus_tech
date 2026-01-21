-- NEXUS TECH - Données d'exemple

insert into public.categories (key, name, sort_order)
values
  ('Phones', 'Téléphones', 1),
  ('Computers', 'Ordinateurs', 2),
  ('Accessories', 'Accessoires', 3),
  ('Wearables', 'Montres & Bracelets', 4),
  ('Cameras', 'Caméras', 5),
  ('Storage', 'Cartes mémoire & Stockage', 6),
  ('Electronics', 'Appareils électroniques', 7),
  ('Services', 'Services', 8)
on conflict (key) do update set name = excluded.name, sort_order = excluded.sort_order;

-- Produits demo
with c as (
  select id, key from public.categories
)
insert into public.products (category_id, sku, name, description, price_cents, currency, stock, is_refurbished, condition, is_active)
select
  (select id from c where key = 'Phones'),
  'PHONE-001',
  'Smartphone Nexus A1 (Neuf)',
  'Smartphone neuf, excellent rapport qualité/prix.',
  19900, 'USD', 12, false, 'new', true
union all
select
  (select id from c where key = 'Phones'),
  'PHONE-002',
  'Smartphone Nexus R2 (Reconditionné)',
  'Reconditionné, testé, garanti.',
  12900, 'USD', 5, true, 'refurbished', true
union all
select
  (select id from c where key = 'Computers'),
  'LAPTOP-001',
  'Laptop Pro 14',
  'Ordinateur portable performant pour travail/études.',
  59900, 'USD', 7, false, 'new', true
union all
select
  (select id from c where key = 'Accessories'),
  'ACC-001',
  'Coque anti-choc (universelle)',
  'Coque solide, protection renforcée.',
  1200, 'USD', 50, false, 'new', true
union all
select
  (select id from c where key = 'Services'),
  'SERV-001',
  'Installation Windows + Drivers',
  'Service: installation complète + optimisation.',
  2500, 'USD', 999, false, 'new', true
union all
select
  (select id from c where key = 'Wearables'),
  'WATCH-001',
  'Montre intelligente (Smartwatch)',
  'Montre connectée: notifications, sport, autonomie optimisée.',
  3500, 'USD', 20, false, 'new', true
union all
select
  (select id from c where key = 'Accessories'),
  'BRACELET-001',
  'Bracelet premium (montre / accessoire)',
  'Bracelet confortable et durable.',
  900, 'USD', 40, false, 'new', true
union all
select
  (select id from c where key = 'Cameras'),
  'CAM-001',
  'Caméra de sécurité Wi‑Fi',
  'Caméra HD, vision nocturne, détection de mouvement.',
  4500, 'USD', 15, false, 'new', true
union all
select
  (select id from c where key = 'Storage'),
  'MEM-001',
  'Carte mémoire 64GB',
  'Carte microSD 64GB, rapide et fiable.',
  800, 'USD', 100, false, 'new', true
union all
select
  (select id from c where key = 'Electronics'),
  'ATT-001',
  'Appareil d’enregistrement de présence',
  'Enregistre la présence (empreinte/QR selon modèle), export des rapports.',
  12000, 'USD', 8, false, 'new', true
on conflict (sku) do nothing;


