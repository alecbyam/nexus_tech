-- ============================================
-- SCRIPT DE VÉRIFICATION - SYSTÈME DE RÔLES
-- ============================================
-- Exécutez ce script pour vérifier que la migration a réussi
-- ============================================

-- 1. Vérifier que la colonne role existe
SELECT 
  '1. Colonne role' as test,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name = 'role'
    ) THEN '✅ OK - La colonne role existe'
    ELSE '❌ ERREUR - La colonne role n''existe pas'
  END as result;

-- 2. Vérifier que tous les utilisateurs ont un rôle
SELECT 
  '2. Utilisateurs sans rôle' as test,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ OK - Tous les utilisateurs ont un rôle'
    ELSE '⚠️ ATTENTION - ' || COUNT(*) || ' utilisateur(s) sans rôle'
  END as result
FROM profiles
WHERE role IS NULL;

-- 3. Vérifier la migration des admins
SELECT 
  '3. Migration des admins' as test,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ OK - Tous les admins ont role = ''admin'''
    ELSE '⚠️ ATTENTION - ' || COUNT(*) || ' admin(s) avec role != ''admin'''
  END as result
FROM profiles
WHERE is_admin = true AND role != 'admin';

-- 4. Vérifier les rôles valides
SELECT 
  '4. Rôles invalides' as test,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ OK - Tous les rôles sont valides'
    ELSE '❌ ERREUR - ' || COUNT(*) || ' utilisateur(s) avec un rôle invalide'
  END as result
FROM profiles
WHERE role IS NOT NULL 
  AND role NOT IN ('client', 'staff', 'admin', 'tech');

-- 5. Vérifier que les fonctions existent
SELECT 
  '5. Fonction is_admin()' as test,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'is_admin' 
      AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN '✅ OK - La fonction is_admin() existe'
    ELSE '❌ ERREUR - La fonction is_admin() n''existe pas'
  END as result;

SELECT 
  '6. Fonction has_role()' as test,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'has_role' 
      AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN '✅ OK - La fonction has_role() existe'
    ELSE '❌ ERREUR - La fonction has_role() n''existe pas'
  END as result;

-- 6. Statistiques par rôle
SELECT 
  '7. Statistiques par rôle' as test,
  'Voir les résultats ci-dessous' as result;

SELECT 
  role,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM profiles), 2) as percentage
FROM profiles
GROUP BY role
ORDER BY count DESC;

-- 7. Vérifier l'index
SELECT 
  '8. Index sur role' as test,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'profiles' 
      AND indexname = 'idx_profiles_role'
    ) THEN '✅ OK - L''index idx_profiles_role existe'
    ELSE '⚠️ ATTENTION - L''index idx_profiles_role n''existe pas'
  END as result;

-- 8. Résumé
SELECT 
  '9. Résumé' as test,
  'Migration ' || 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name = 'role'
    ) 
    AND NOT EXISTS (
      SELECT 1 FROM profiles WHERE role IS NULL
    )
    AND NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE is_admin = true AND role != 'admin'
    )
    THEN '✅ RÉUSSIE'
    ELSE '⚠️ À VÉRIFIER'
  END as result;
