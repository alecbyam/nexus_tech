-- Ajouter le champ d'adresse de livraison à la table orders
-- Exécutez ce script dans Supabase SQL Editor

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS delivery_address TEXT;

COMMENT ON COLUMN public.orders.delivery_address IS 'Adresse complète de livraison du client';
