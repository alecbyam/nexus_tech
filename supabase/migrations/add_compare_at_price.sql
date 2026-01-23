-- Migration: Ajouter le champ compare_at_price_cents pour le prix d'ancrage
-- Date: 2024

-- Ajouter la colonne compare_at_price_cents si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'compare_at_price_cents'
  ) THEN
    ALTER TABLE public.products 
    ADD COLUMN compare_at_price_cents int 
    CHECK (compare_at_price_cents >= 0);
    
    COMMENT ON COLUMN public.products.compare_at_price_cents IS 'Prix d''ancrage (comparaison) - Prix barré affiché pour montrer la réduction';
  END IF;
END $$;
