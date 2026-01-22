# Système de Classement Hiérarchique - Catégories & Sous-catégories

## 📋 Vue d'ensemble

Système de classement hiérarchique extensible pour organiser les produits en catégories et sous-catégories.

## 🌳 Structure Hiérarchique

```
📱 Téléphones
  ├─ 🤖 Android
  ├─ 🍎 iPhone
  └─ 📞 Basique

💻 Ordinateurs
  ├─ 💻 Laptop
  ├─ 🖥️ Desktop
  ├─ 🎮 PC Gamer
  └─ 📱 Tablettes

🎧 Accessoires
  ├─ 🛡️ Coques
  ├─ 🔌 Chargeurs
  ├─ 🔋 Power banks
  ├─ 🎧 Casques
  └─ 🔌 Câbles

🔧 Pièces détachées
  ├─ 📺 Écrans
  ├─ 🔋 Batteries
  ├─ 🔌 Connecteurs
  └─ 📷 Caméras

⚡ Appareils électroniques
  ├─ 📺 TV
  ├─ 📷 Caméras
  ├─ ⌚ Montres connectées
  ├─ 🖨️ Imprimantes
  ├─ 📡 Routeurs
  ├─ 🎮 Consoles
  └─ 🔊 Enceintes

🛠️ Services
  ├─ 🔧 Réparation
  ├─ ⚙️ Installation
  ├─ 💬 Support technique
  └─ 📚 Formation
```

## 🗄️ Schéma de Base de Données

### Table `categories`

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  parent_id UUID REFERENCES categories(id),
  icon VARCHAR(50),
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Champs

- **id** : Identifiant unique (UUID)
- **name** : Nom de la catégorie
- **slug** : Identifiant URL-friendly (unique)
- **parent_id** : Référence vers la catégorie parente (NULL = catégorie principale)
- **icon** : Emoji ou nom d'icône
- **description** : Description optionnelle
- **sort_order** : Ordre d'affichage
- **is_active** : Actif/inactif
- **created_at** / **updated_at** : Timestamps

## 📊 Statistiques

- **6 catégories principales**
- **28 sous-catégories au total**
- **Structure extensible** (facile d'ajouter de nouveaux niveaux)

## 🔍 Requêtes Utiles

### Obtenir toutes les catégories principales

```sql
SELECT * FROM categories WHERE parent_id IS NULL ORDER BY sort_order;
```

### Obtenir les sous-catégories d'une catégorie

```sql
SELECT * FROM categories 
WHERE parent_id = '00000000-0000-0000-0001-000000000001' 
ORDER BY sort_order;
```

### Obtenir l'arbre complet d'une catégorie

```sql
WITH RECURSIVE category_tree AS (
  SELECT id, name, parent_id, 0 as level
  FROM categories
  WHERE id = '00000000-0000-0000-0001-000000000001'
  
  UNION ALL
  
  SELECT c.id, c.name, c.parent_id, ct.level + 1
  FROM categories c
  INNER JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree;
```

### Utiliser la vue `categories_tree`

```sql
SELECT * FROM categories_tree WHERE level = 0; -- Catégories principales
SELECT * FROM categories_tree WHERE level = 1; -- Sous-catégories
SELECT * FROM categories_tree WHERE full_path LIKE '%Téléphones%';
```

## 🚀 Installation

1. **Exécuter le schéma** :
   ```sql
   -- Dans Supabase SQL Editor
   \i supabase/categories-schema.sql
   ```

2. **Insérer les données** :
   ```sql
   \i supabase/categories-seed.sql
   ```

3. **Vérifier** :
   ```sql
   SELECT COUNT(*) FROM categories; -- Devrait retourner 34 (6 + 28)
   ```

## 🔧 Extension

### Ajouter une nouvelle catégorie principale

```sql
INSERT INTO categories (name, slug, parent_id, icon, sort_order) VALUES
('Nouvelle Catégorie', 'nouvelle-categorie', NULL, '📦', 7);
```

### Ajouter une sous-catégorie

```sql
INSERT INTO categories (name, slug, parent_id, icon, sort_order) VALUES
('Nouvelle Sous-catégorie', 'nouvelle-sous-categorie', 
 '00000000-0000-0000-0001-000000000001', '🔹', 4);
```

### Ajouter un 3ème niveau (sous-sous-catégorie)

Le système supporte n'importe quel niveau de profondeur :

```sql
-- Exemple : Android > Samsung
INSERT INTO categories (name, slug, parent_id, icon, sort_order) VALUES
('Samsung', 'telephones-android-samsung', 
 '00000000-0000-0000-0001-000000000002', '📱', 1);
```

## 📝 Notes

- Le système est **extensible** : supporte n'importe quel niveau de profondeur
- Les **slugs** doivent être uniques (contrainte UNIQUE)
- Les **UUIDs** sont fixes pour faciliter les références (mais peuvent être générés automatiquement)
- La fonction `get_category_path()` retourne le chemin complet (ex: "Téléphones > Android")
- La vue `categories_tree` facilite les requêtes hiérarchiques

## 🎯 Utilisation dans l'Application

### TypeScript Types

```typescript
interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  icon: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  full_path?: string; // Depuis la vue categories_tree
  level?: number; // Depuis la vue categories_tree
}
```

### Exemple d'utilisation React

```typescript
// Obtenir les catégories principales
const { data: mainCategories } = await supabase
  .from('categories')
  .select('*')
  .is('parent_id', null)
  .order('sort_order');

// Obtenir les sous-catégories
const { data: subCategories } = await supabase
  .from('categories')
  .select('*')
  .eq('parent_id', parentCategoryId)
  .order('sort_order');
```

