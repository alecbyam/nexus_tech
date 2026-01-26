-- ============================================
-- MIGRATION : SYSTÈME DE RÔLES
-- ============================================
-- Ajoute un système de rôles : client, staff, admin, tech
-- Remplace le champ is_admin par role
-- ============================================

-- 1. Ajouter la colonne role à la table profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'client' 
CHECK (role IN ('client', 'staff', 'admin', 'tech'));

-- 2. Migrer les données existantes : is_admin = true -> role = 'admin'
UPDATE public.profiles 
SET role = 'admin' 
WHERE is_admin = true AND role = 'client';

-- 3. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 4. Mettre à jour la fonction is_admin() pour utiliser role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  );
$$;

-- 5. Créer des fonctions helper pour vérifier les rôles
CREATE OR REPLACE FUNCTION public.has_role(p_role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = p_role
  );
$$;

-- 6. Fonction pour vérifier si l'utilisateur est staff ou admin
CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('staff', 'admin')
  );
$$;

-- 7. Fonction pour vérifier si l'utilisateur est tech ou admin
CREATE OR REPLACE FUNCTION public.is_tech_or_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('tech', 'admin')
  );
$$;

-- 8. Mettre à jour la fonction handle_new_user pour définir role = 'client' par défaut
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 
    NEW.phone,
    'client' -- Rôle par défaut pour les nouveaux utilisateurs
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 9. Commentaires pour documentation
COMMENT ON COLUMN public.profiles.role IS 'Rôle de l''utilisateur : client, staff, admin, tech';
COMMENT ON FUNCTION public.is_admin() IS 'Vérifie si l''utilisateur actuel est admin';
COMMENT ON FUNCTION public.has_role(TEXT) IS 'Vérifie si l''utilisateur actuel a un rôle spécifique';
COMMENT ON FUNCTION public.is_staff_or_admin() IS 'Vérifie si l''utilisateur est staff ou admin';
COMMENT ON FUNCTION public.is_tech_or_admin() IS 'Vérifie si l''utilisateur est tech ou admin';

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 1. Le champ is_admin est conservé pour compatibilité mais ne doit plus être utilisé
-- 2. Tous les nouveaux utilisateurs auront role = 'client' par défaut
-- 3. Les utilisateurs existants avec is_admin = true ont été migrés vers role = 'admin'
-- 4. Pour créer un admin : UPDATE profiles SET role = 'admin' WHERE id = 'user_id';
-- 5. Pour créer un staff : UPDATE profiles SET role = 'staff' WHERE id = 'user_id';
-- 6. Pour créer un tech : UPDATE profiles SET role = 'tech' WHERE id = 'user_id';
