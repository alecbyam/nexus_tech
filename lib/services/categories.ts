/**
 * Service pour récupérer les catégories depuis Supabase
 */

import { createServerClient } from '@/lib/supabase/server'
import type { Category } from '@/lib/categories'
import { buildCategoryTree, getMainCategories, filterActiveCategories } from '@/lib/categories'

/**
 * Récupère toutes les catégories actives depuis Supabase (server-side)
 */
export async function getCategories(includeInactive = false): Promise<Category[]> {
  try {
    const supabase = await createServerClient()
    
    let queryBuilder = supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (!includeInactive) {
      queryBuilder = queryBuilder.eq('is_active', true)
    }

    const { data, error } = await queryBuilder

    if (error) {
      console.error('Error fetching categories:', error)
      // Retourner un tableau vide au lieu de throw pour éviter de casser la page
      return []
    }

    return (data || []) as Category[]
  } catch (error) {
    console.error('Error in getCategories:', error)
    // Retourner un tableau vide en cas d'erreur
    return []
  }
}

/**
 * Récupère uniquement les catégories principales (server-side)
 */
export async function getMainCategoriesOnly(): Promise<Category[]> {
  const allCategories = await getCategories()
  return getMainCategories(filterActiveCategories(allCategories))
}

/**
 * Récupère l'arbre complet des catégories (server-side)
 */
export async function getCategoryTree() {
  const allCategories = await getCategories()
  const activeCategories = filterActiveCategories(allCategories)
  return buildCategoryTree(activeCategories)
}

/**
 * Récupère une catégorie par son slug (server-side)
 * Gère la fusion smartphones/telephones -> phones
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createServerClient()
  
  // Si on cherche "phones", chercher aussi "smartphones" et "telephones"
  const searchSlugs = slug === 'phones' 
    ? ['phones', 'smartphones', 'telephones']
    : [slug]
  
  // Essayer chaque slug
  for (const searchSlug of searchSlugs) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', searchSlug)
      .eq('is_active', true)
      .maybeSingle()

    if (!error && data) {
      const category = data as Category
      // Si on a trouvé une catégorie téléphone/smartphone mais qu'on cherche "phones",
      // retourner une catégorie normalisée
      if (slug === 'phones' && (searchSlug === 'smartphones' || searchSlug === 'telephones')) {
        return {
          ...category,
          slug: 'phones',
          key: 'phones',
          name: 'Téléphones & Smartphones',
        }
      }
      return category
    }
  }

  // Aucun résultat trouvé
  return null
}

/**
 * Récupère toutes les sous-catégories d'une catégorie parente (server-side)
 */
export async function getSubcategoriesByParentId(parentId: string): Promise<Category[]> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', parentId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching subcategories:', error)
    throw new Error(`Failed to fetch subcategories: ${error.message}`)
  }

  return (data || []) as Category[]
}

