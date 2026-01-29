-- Migration pour permettre les commandes sans compte (guest orders)
-- Ajouter les champs nécessaires pour les commandes sans compte

-- Modifier la table orders pour permettre user_id nullable
ALTER TABLE public.orders 
  ALTER COLUMN user_id DROP NOT NULL;

-- Ajouter les champs pour les informations client (guest)
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT,
  ADD COLUMN IF NOT EXISTS session_id TEXT,
  ADD COLUMN IF NOT EXISTS delivery_address TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Créer un index pour session_id pour les recherches
CREATE INDEX IF NOT EXISTS idx_orders_session_id ON public.orders(session_id);

-- Créer un index pour customer_phone pour les recherches
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone);

-- Créer une table pour les notifications de commandes
CREATE TABLE IF NOT EXISTS public.order_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL DEFAULT 'new_order' CHECK (notification_type IN ('new_order', 'order_updated', 'order_cancelled')),
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  read_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_notifications_order ON public.order_notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_order_notifications_read ON public.order_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_order_notifications_created ON public.order_notifications(created_at DESC);

-- Fonction pour créer une notification lors de la création d'une commande
CREATE OR REPLACE FUNCTION public.create_order_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  customer_info TEXT;
  order_items_count INT;
BEGIN
  -- Construire le message de notification
  customer_info := COALESCE(NEW.customer_name, 'Client anonyme');
  IF NEW.customer_phone IS NOT NULL THEN
    customer_info := customer_info || ' (' || NEW.customer_phone || ')';
  END IF;
  
  -- Compter les articles
  SELECT COUNT(*) INTO order_items_count
  FROM public.order_items
  WHERE order_id = NEW.id;
  
  -- Créer la notification
  INSERT INTO public.order_notifications (
    order_id,
    notification_type,
    message
  ) VALUES (
    NEW.id,
    'new_order',
    'Nouvelle commande #' || SUBSTRING(NEW.id::TEXT, 1, 8) || ' de ' || customer_info || ' - ' || 
    order_items_count || ' article(s) - Total: ' || 
    (NEW.total_cents::FLOAT / 100) || ' ' || NEW.currency
  );
  
  RETURN NEW;
END;
$$;

-- Trigger pour créer une notification lors de la création d'une commande
DROP TRIGGER IF EXISTS trigger_create_order_notification ON public.orders;
CREATE TRIGGER trigger_create_order_notification
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.create_order_notification();

-- Fonction pour mettre à jour la notification lors d'un changement de statut
CREATE OR REPLACE FUNCTION public.update_order_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO public.order_notifications (
      order_id,
      notification_type,
      message
    ) VALUES (
      NEW.id,
      'order_updated',
      'Commande #' || SUBSTRING(NEW.id::TEXT, 1, 8) || ' - Statut: ' || NEW.status
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger pour mettre à jour la notification lors d'un changement de statut
DROP TRIGGER IF EXISTS trigger_update_order_notification ON public.orders;
CREATE TRIGGER trigger_update_order_notification
AFTER UPDATE ON public.orders
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.update_order_notification();

-- RLS pour order_notifications
ALTER TABLE public.order_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Les admins peuvent voir toutes les notifications
CREATE POLICY "Admins can view all notifications"
ON public.order_notifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy: Les admins peuvent marquer les notifications comme lues
CREATE POLICY "Admins can update notifications"
ON public.order_notifications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
