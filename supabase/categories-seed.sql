-- ============================================
-- Données seed : Catégories & Sous-catégories
-- Système hiérarchique complet
-- ============================================

-- Nettoyer les données existantes (optionnel, commenté pour sécurité)
-- TRUNCATE TABLE categories CASCADE;

-- ============================================
-- CATÉGORIES PRINCIPALES (parent_id = NULL)
-- ============================================

-- 1. TÉLÉPHONES
INSERT INTO categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0001-000000000001', 'Téléphones', 'telephones', NULL, '📱', 'Smartphones et téléphones portables', 1);

-- 2. ORDINATEURS
INSERT INTO categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0002-000000000001', 'Ordinateurs', 'ordinateurs', NULL, '💻', 'Ordinateurs portables et de bureau', 2);

-- 3. ACCESSOIRES
INSERT INTO categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0003-000000000001', 'Accessoires', 'accessoires', NULL, '🎧', 'Accessoires pour téléphones et ordinateurs', 3);

-- 4. PIÈCES DÉTACHÉES
INSERT INTO categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0004-000000000001', 'Pièces détachées', 'pieces-detachees', NULL, '🔧', 'Composants et pièces de rechange', 4);

-- 5. APPAREILS ÉLECTRONIQUES
INSERT INTO categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0005-000000000001', 'Appareils électroniques', 'appareils-electroniques', NULL, '⚡', 'Électronique grand public', 5);

-- 6. SERVICES
INSERT INTO categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0006-000000000001', 'Services', 'services', NULL, '🛠️', 'Services techniques et réparations', 6);

-- ============================================
-- SOUS-CATÉGORIES : TÉLÉPHONES
-- ============================================
INSERT INTO categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0001-000000000002', 'Android', 'telephones-android', '00000000-0000-0000-0001-000000000001', '🤖', 'Smartphones Android', 1),
('00000000-0000-0000-0001-000000000003', 'iPhone', 'telephones-iphone', '00000000-0000-0000-0001-000000000001', '🍎', 'iPhone et appareils Apple', 2),
('00000000-0000-0000-0001-000000000004', 'Basique', 'telephones-basique', '00000000-0000-0000-0001-000000000001', '📞', 'Téléphones basiques et feature phones', 3);

-- ============================================
-- SOUS-CATÉGORIES : ORDINATEURS
-- ============================================
INSERT INTO categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0002-000000000002', 'Laptop', 'ordinateurs-laptop', '00000000-0000-0000-0002-000000000001', '💻', 'Ordinateurs portables', 1),
('00000000-0000-0000-0002-000000000003', 'Desktop', 'ordinateurs-desktop', '00000000-0000-0000-0002-000000000001', '🖥️', 'Ordinateurs de bureau', 2),
('00000000-0000-0000-0002-000000000004', 'PC Gamer', 'ordinateurs-pc-gamer', '00000000-0000-0000-0002-000000000001', '🎮', 'PC Gaming et stations de jeu', 3),
('00000000-0000-0000-0002-000000000005', 'Tablettes', 'ordinateurs-tablettes', '00000000-0000-0000-0002-000000000001', '📱', 'Tablettes et iPad', 4);

-- ============================================
-- SOUS-CATÉGORIES : ACCESSOIRES
-- ============================================
INSERT INTO categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0003-000000000002', 'Coques', 'accessoires-coques', '00000000-0000-0000-0003-000000000001', '🛡️', 'Coques et étuis de protection', 1),
('00000000-0000-0000-0003-000000000003', 'Chargeurs', 'accessoires-chargeurs', '00000000-0000-0000-0003-000000000001', '🔌', 'Chargeurs et adaptateurs', 2),
('00000000-0000-0000-0003-000000000004', 'Power banks', 'accessoires-power-banks', '00000000-0000-0000-0003-000000000001', '🔋', 'Batteries externes et power banks', 3),
('00000000-0000-0000-0003-000000000005', 'Casques', 'accessoires-casques', '00000000-0000-0000-0003-000000000001', '🎧', 'Casques audio et écouteurs', 4),
('00000000-0000-0000-0003-000000000006', 'Câbles', 'accessoires-cables', '00000000-0000-0000-0003-000000000001', '🔌', 'Câbles USB, Lightning, etc.', 5);

-- ============================================
-- SOUS-CATÉGORIES : PIÈCES DÉTACHÉES
-- ============================================
INSERT INTO categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0004-000000000002', 'Écrans', 'pieces-detachees-ecrans', '00000000-0000-0000-0004-000000000001', '📺', 'Écrans LCD, OLED et pièces d''affichage', 1),
('00000000-0000-0000-0004-000000000003', 'Batteries', 'pieces-detachees-batteries', '00000000-0000-0000-0004-000000000001', '🔋', 'Batteries de remplacement', 2),
('00000000-0000-0000-0004-000000000004', 'Connecteurs', 'pieces-detachees-connecteurs', '00000000-0000-0000-0004-000000000001', '🔌', 'Connecteurs et ports de charge', 3),
('00000000-0000-0000-0004-000000000005', 'Caméras', 'pieces-detachees-cameras', '00000000-0000-0000-0004-000000000001', '📷', 'Modules caméra et objectifs', 4);

-- ============================================
-- SOUS-CATÉGORIES : APPAREILS ÉLECTRONIQUES
-- ============================================
INSERT INTO categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0005-000000000002', 'TV', 'appareils-electroniques-tv', '00000000-0000-0000-0005-000000000001', '📺', 'Téléviseurs et écrans TV', 1),
('00000000-0000-0000-0005-000000000003', 'Caméras', 'appareils-electroniques-cameras', '00000000-0000-0000-0005-000000000001', '📷', 'Appareils photo et caméras', 2),
('00000000-0000-0000-0005-000000000004', 'Montres connectées', 'appareils-electroniques-montres', '00000000-0000-0000-0005-000000000001', '⌚', 'Smartwatches et montres intelligentes', 3),
('00000000-0000-0000-0005-000000000005', 'Imprimantes', 'appareils-electroniques-imprimantes', '00000000-0000-0000-0005-000000000001', '🖨️', 'Imprimantes et scanners', 4),
('00000000-0000-0000-0005-000000000006', 'Routeurs', 'appareils-electroniques-routeurs', '00000000-0000-0000-0005-000000000001', '📡', 'Routeurs WiFi et réseaux', 5),
('00000000-0000-0000-0005-000000000007', 'Consoles', 'appareils-electroniques-consoles', '00000000-0000-0000-0005-000000000001', '🎮', 'Consoles de jeu', 6),
('00000000-0000-0000-0005-000000000008', 'Enceintes', 'appareils-electroniques-enceintes', '00000000-0000-0000-0005-000000000001', '🔊', 'Enceintes et systèmes audio', 7);

-- ============================================
-- SOUS-CATÉGORIES : SERVICES
-- ============================================
INSERT INTO categories (id, name, slug, parent_id, icon, description, sort_order) VALUES
('00000000-0000-0000-0006-000000000002', 'Réparation', 'services-reparation', '00000000-0000-0000-0006-000000000001', '🔧', 'Services de réparation et maintenance', 1),
('00000000-0000-0000-0006-000000000003', 'Installation', 'services-installation', '00000000-0000-0000-0006-000000000001', '⚙️', 'Installation et configuration', 2),
('00000000-0000-0000-0006-000000000004', 'Support technique', 'services-support', '00000000-0000-0000-0006-000000000001', '💬', 'Support et assistance technique', 3),
('00000000-0000-0000-0006-000000000005', 'Formation', 'services-formation', '00000000-0000-0000-0006-000000000001', '📚', 'Formation et cours', 4);

-- ============================================
-- VÉRIFICATION : Afficher l'arbre complet
-- ============================================
-- SELECT 
--   CASE WHEN parent_id IS NULL THEN name ELSE '  └─ ' || name END AS category_tree,
--   slug,
--   icon,
--   sort_order
-- FROM categories
-- ORDER BY 
--   COALESCE(parent_id, id),
--   sort_order;

