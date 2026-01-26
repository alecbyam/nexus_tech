-- ============================================
-- AJOUT DU SYSTÈME DE PAIEMENT MOBILE MONEY
-- M-Pesa, Orange Money, Airtel Money
-- ============================================

-- Table pour les paiements
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mpesa', 'orange_money', 'airtel_money', 'card', 'cash')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
  
  -- Informations spécifiques mobile money
  phone_number TEXT,
  transaction_id TEXT, -- ID de transaction du fournisseur mobile money
  provider_reference TEXT, -- Référence fournie par le provider
  
  -- Informations supplémentaires
  payment_data JSONB, -- Données supplémentaires (code PIN, etc. - non stocké en clair)
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Index pour performance
  CONSTRAINT payments_order_id_unique UNIQUE (order_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON public.payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS payments_set_updated_at ON public.payments;
CREATE TRIGGER payments_set_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Fonction pour mettre à jour le statut de la commande quand le paiement est complété
CREATE OR REPLACE FUNCTION public.update_order_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Si le paiement est complété, mettre la commande en "confirmed"
  IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
    UPDATE public.orders
    SET status = 'confirmed',
        updated_at = NOW()
    WHERE id = NEW.order_id;
    
    NEW.completed_at = NOW();
  END IF;
  
  -- Si le paiement échoue, laisser la commande en "pending"
  IF NEW.payment_status = 'failed' THEN
    -- La commande reste en "pending" pour permettre un nouveau paiement
    NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger pour mettre à jour la commande
DROP TRIGGER IF EXISTS trigger_update_order_on_payment ON public.payments;
CREATE TRIGGER trigger_update_order_on_payment
AFTER UPDATE OF payment_status ON public.payments
FOR EACH ROW
WHEN (OLD.payment_status IS DISTINCT FROM NEW.payment_status)
EXECUTE FUNCTION public.update_order_on_payment();

-- Ajouter une colonne payment_method à orders (optionnel, pour compatibilité)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('mpesa', 'orange_money', 'airtel_money', 'card', 'cash', 'pending'));

-- RLS pour payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent voir leurs propres paiements
DROP POLICY IF EXISTS "payments_select_own" ON public.payments;
CREATE POLICY "payments_select_own"
ON public.payments FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

-- Policy: Les utilisateurs peuvent créer leurs propres paiements
DROP POLICY IF EXISTS "payments_insert_own" ON public.payments;
CREATE POLICY "payments_insert_own"
ON public.payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent mettre à jour leurs propres paiements (pour statut)
DROP POLICY IF EXISTS "payments_update_own" ON public.payments;
CREATE POLICY "payments_update_own"
ON public.payments FOR UPDATE
USING (auth.uid() = user_id OR public.is_admin())
WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Policy: Admin peut tout voir
DROP POLICY IF EXISTS "payments_admin_all" ON public.payments;
CREATE POLICY "payments_admin_all"
ON public.payments FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Commentaires
COMMENT ON TABLE public.payments IS 'Table pour gérer les paiements (mobile money, carte, cash)';
COMMENT ON COLUMN public.payments.payment_method IS 'Méthode de paiement: mpesa, orange_money, airtel_money, card, cash';
COMMENT ON COLUMN public.payments.payment_status IS 'Statut: pending, processing, completed, failed, cancelled, refunded';
COMMENT ON COLUMN public.payments.phone_number IS 'Numéro de téléphone pour mobile money';
COMMENT ON COLUMN public.payments.transaction_id IS 'ID de transaction du fournisseur mobile money';
COMMENT ON COLUMN public.payments.payment_data IS 'Données supplémentaires (JSON) - ne pas stocker de codes PIN en clair';
