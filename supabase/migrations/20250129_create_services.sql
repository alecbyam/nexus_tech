-- Migration pour créer le système de services
-- Date: 2025-01-29

-- 1. Créer la table services
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'smartphone',
    'computer',
    'internet_accounts',
    'web_design',
    'technical',
    'training'
  )),
  description TEXT,
  price_estimate TEXT, -- Peut être un prix fixe ou une fourchette (ex: "5000-10000 CDF")
  duration_estimate TEXT, -- Durée estimée (ex: "30 minutes", "1-2 heures")
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Créer la table service_requests pour les demandes de services
CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  notes TEXT, -- Notes du client
  admin_notes TEXT, -- Notes internes (admin/staff)
  estimated_price TEXT,
  final_price TEXT,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(is_active);
CREATE INDEX IF NOT EXISTS idx_service_requests_service_id ON public.service_requests(service_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_user_id ON public.service_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_customer_phone ON public.service_requests(customer_phone);

-- 4. Créer le trigger pour updated_at
CREATE OR REPLACE FUNCTION public.set_services_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER services_set_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.set_services_updated_at();

CREATE TRIGGER service_requests_set_updated_at
BEFORE UPDATE ON public.service_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. Activer RLS (Row Level Security)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- 6. Politiques RLS pour services (lecture publique, écriture admin)
CREATE POLICY "Services are viewable by everyone" ON public.services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage services" ON public.services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 7. Politiques RLS pour service_requests
CREATE POLICY "Users can view their own service requests" ON public.service_requests
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'staff', 'tech')
    )
  );

CREATE POLICY "Anyone can create service requests" ON public.service_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins and staff can update service requests" ON public.service_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'staff', 'tech')
    )
  );

-- 8. Insérer les services par défaut
INSERT INTO public.services (title, category, description, price_estimate, duration_estimate, sort_order) VALUES
-- A) Smartphone Services
('Configuration téléphone', 'smartphone', 'Configuration complète de votre téléphone (paramètres, connexions, etc.)', '5000-10000 CDF', '30-45 min', 1),
('Configuration Internet/APN', 'smartphone', 'Configuration de la connexion Internet et APN pour votre opérateur', '3000-5000 CDF', '15-20 min', 2),
('Création compte Gmail', 'smartphone', 'Création et configuration d\'un compte Gmail', '2000-3000 CDF', '10-15 min', 3),
('Assistance compte iCloud', 'smartphone', 'Configuration et assistance pour compte iCloud (avec identifiants client)', '5000-8000 CDF', '20-30 min', 4),
('Transfert de données', 'smartphone', 'Transfert de données entre appareils (contacts, photos, fichiers)', '10000-15000 CDF', '1-2 heures', 5),
('Sauvegarde et restauration', 'smartphone', 'Sauvegarde complète et restauration de vos données', '8000-12000 CDF', '45-60 min', 6),
('Installation d\'applications', 'smartphone', 'Installation et configuration d\'applications', '3000-5000 CDF', '20-30 min', 7),
('Configuration WhatsApp/Facebook/TikTok', 'smartphone', 'Configuration et assistance pour réseaux sociaux', '5000-8000 CDF', '30-45 min', 8),
('Déverrouillage code/motif', 'smartphone', 'Déverrouillage de code PIN ou motif (si propriétaire)', '10000-20000 CDF', '30-60 min', 9),
('Réinitialisation usine', 'smartphone', 'Réinitialisation complète du téléphone aux paramètres d\'usine', '5000-8000 CDF', '20-30 min', 10),
('Mise à jour Android/iOS', 'smartphone', 'Mise à jour du système d\'exploitation', '5000-10000 CDF', '30-60 min', 11),
('Suppression virus et publicités', 'smartphone', 'Nettoyage et suppression de virus, malwares et publicités', '10000-15000 CDF', '45-60 min', 12),
('Optimisation stockage et vitesse', 'smartphone', 'Optimisation de l\'espace de stockage et de la vitesse', '8000-12000 CDF', '30-45 min', 13),

-- B) Computer Services
('Installation Windows/Linux', 'computer', 'Installation complète de Windows ou Linux', '20000-30000 CDF', '2-3 heures', 14),
('Réinstallation système', 'computer', 'Réinstallation complète du système d\'exploitation', '25000-35000 CDF', '2-4 heures', 15),
('Installation Microsoft Office', 'computer', 'Installation et activation de Microsoft Office', '15000-20000 CDF', '30-45 min', 16),
('Installation antivirus', 'computer', 'Installation et configuration d\'un antivirus', '10000-15000 CDF', '20-30 min', 17),
('Mise à jour pilotes', 'computer', 'Mise à jour de tous les pilotes système', '15000-20000 CDF', '1-2 heures', 18),
('Nettoyage PC (système lent)', 'computer', 'Nettoyage complet et optimisation d\'un PC lent', '20000-30000 CDF', '2-3 heures', 19),
('Suppression virus/malware', 'computer', 'Détection et suppression de virus et malwares', '25000-35000 CDF', '2-4 heures', 20),
('Diagnostic matériel/logiciel', 'computer', 'Diagnostic complet du matériel et des logiciels', '15000-25000 CDF', '1-2 heures', 21),
('Récupération de fichiers', 'computer', 'Récupération de fichiers supprimés ou perdus', '30000-50000 CDF', '2-6 heures', 22),
('Sauvegarde de données', 'computer', 'Sauvegarde complète de vos données importantes', '15000-20000 CDF', '1-2 heures', 23),
('Transfert PC vers USB', 'computer', 'Transfert de fichiers du PC vers clé USB', '5000-10000 CDF', '30-60 min', 24),

-- C) Internet & Accounts
('Configuration Wi-Fi', 'internet_accounts', 'Configuration de connexion Wi-Fi sur vos appareils', '5000-8000 CDF', '20-30 min', 25),
('Configuration routeur', 'internet_accounts', 'Configuration complète de votre routeur Internet', '15000-25000 CDF', '1-2 heures', 26),
('Création email professionnel', 'internet_accounts', 'Création d\'un email professionnel (Gmail, Outlook, etc.)', '10000-15000 CDF', '30-45 min', 27),
('Création comptes réseaux sociaux', 'internet_accounts', 'Création de comptes sur les réseaux sociaux', '8000-12000 CDF', '30-45 min', 28),
('Sécurité compte (2FA)', 'internet_accounts', 'Configuration de l\'authentification à deux facteurs', '5000-8000 CDF', '20-30 min', 29),

-- D) Web & Design
('Création site web', 'web_design', 'Création d\'un site web professionnel', '500000-2000000 CDF', 'Variable', 30),
('Création boutique en ligne', 'web_design', 'Création d\'une boutique e-commerce complète', '1000000-3000000 CDF', 'Variable', 31),
('Création application mobile', 'web_design', 'Développement d\'une application mobile', '2000000-5000000 CDF', 'Variable', 32),
('Design logo', 'web_design', 'Création d\'un logo professionnel', '50000-200000 CDF', '2-5 jours', 33),
('Flyers et affiches', 'web_design', 'Création de flyers et affiches publicitaires', '30000-100000 CDF', '1-3 jours', 34),
('Gestion page Facebook business', 'web_design', 'Création et gestion de page Facebook professionnelle', '50000-150000 CDF', 'Variable', 35),

-- E) Technical
('Installation protection écran', 'technical', 'Installation de protection d\'écran (film)', '5000-15000 CDF', '10-15 min', 36),
('Remplacement coque', 'technical', 'Remplacement de la coque de protection', '10000-20000 CDF', '15-20 min', 37),
('Remplacement batterie', 'technical', 'Remplacement de la batterie', '30000-80000 CDF', '30-60 min', 38),
('Remplacement écran', 'technical', 'Remplacement de l\'écran endommagé', '50000-200000 CDF', '1-2 heures', 39),
('Diagnostic appareil', 'technical', 'Diagnostic complet de votre appareil', '10000-20000 CDF', '30-45 min', 40),

-- F) Training
('Formation informatique de base', 'training', 'Formation aux bases de l\'informatique', '50000-100000 CDF', '10-20 heures', 41),
('Formation smartphone', 'training', 'Formation complète sur l\'utilisation d\'un smartphone', '30000-60000 CDF', '5-10 heures', 42),
('Formation Office', 'training', 'Formation Microsoft Office (Word, Excel, PowerPoint)', '60000-120000 CDF', '15-25 heures', 43),
('Coaching business digital', 'training', 'Coaching pour développer votre business en ligne', '100000-200000 CDF', 'Variable', 44);

-- 9. Créer une vue pour les statistiques de services
CREATE OR REPLACE VIEW public.service_stats AS
SELECT 
  s.category,
  COUNT(DISTINCT s.id) as total_services,
  COUNT(DISTINCT sr.id) as total_requests,
  COUNT(DISTINCT CASE WHEN sr.status = 'pending' THEN sr.id END) as pending_requests,
  COUNT(DISTINCT CASE WHEN sr.status = 'in_progress' THEN sr.id END) as in_progress_requests,
  COUNT(DISTINCT CASE WHEN sr.status = 'completed' THEN sr.id END) as completed_requests
FROM public.services s
LEFT JOIN public.service_requests sr ON s.id = sr.service_id
WHERE s.is_active = true
GROUP BY s.category;

-- 10. Commentaires pour documentation
COMMENT ON TABLE public.services IS 'Catalogue des services proposés par NEXUS TECH';
COMMENT ON TABLE public.service_requests IS 'Demandes de services des clients';
COMMENT ON COLUMN public.services.category IS 'Catégorie du service: smartphone, computer, internet_accounts, web_design, technical, training';
COMMENT ON COLUMN public.service_requests.status IS 'Statut: pending, in_progress, completed, cancelled';
