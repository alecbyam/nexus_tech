-- Script SQL pour créer ou promouvoir un utilisateur en administrateur
-- Exécutez ce script dans Supabase SQL Editor

-- ============================================
-- MÉTHODE 1: Promouvoir un utilisateur existant
-- ============================================
-- Remplacez 'USER_ID_ICI' par l'ID de l'utilisateur à promouvoir
-- Vous pouvez trouver l'ID dans: Authentication → Users

UPDATE public.profiles
SET is_admin = true
WHERE id = 'USER_ID_ICI';

-- ============================================
-- MÉTHODE 2: Promouvoir par email (si vous connaissez l'email)
-- ============================================
-- Note: Cette méthode nécessite de connaître l'ID depuis auth.users
-- Vous pouvez le trouver dans: Authentication → Users

-- Exemple: Promouvoir l'utilisateur avec l'ID spécifique
-- UPDATE public.profiles
-- SET is_admin = true
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1);

-- ============================================
-- MÉTHODE 3: Vérifier les administrateurs existants
-- ============================================

SELECT 
  p.id,
  p.full_name,
  p.phone,
  p.is_admin,
  p.created_at,
  u.email
FROM public.profiles p
LEFT JOIN auth.users u ON u.id = p.id
WHERE p.is_admin = true
ORDER BY p.created_at DESC;

-- ============================================
-- MÉTHODE 4: Créer un admin lors de l'inscription (modification du trigger)
-- ============================================
-- Pour créer automatiquement un admin pour un email spécifique,
-- modifiez la fonction handle_new_user() dans schema.sql

-- Exemple: Si l'email est admin@nexustech.com, créer directement en admin
-- (Voir la modification dans le trigger)

-- ============================================
-- INSTRUCTIONS D'UTILISATION
-- ============================================
-- 1. Allez dans Supabase Dashboard → SQL Editor
-- 2. Copiez la méthode 1 ci-dessus
-- 3. Remplacez 'USER_ID_ICI' par l'ID réel de l'utilisateur
-- 4. Exécutez la requête
-- 5. Vérifiez avec la méthode 3
