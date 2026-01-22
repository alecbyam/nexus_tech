/**
 * Service pour récupérer les catégories depuis Supabase
 */

import { createServerClient } from '@/lib/supabase/server'
import type { Category } from '@/lib/categories'
import { buildCategoryTree, getMainCategories, filterActiveCategories } from '@/lib/categories'

/**
 * Récupère toutes les catégories actives depuis Supabase (server-side)
 */
export async function getCategories(): Promise<Category[]> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    throw error
  }

  return (data || []) as Category[]
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
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Aucun résultat trouvé
      return null
    }
    console.error('Error fetching category by slug:', error)
    throw error
  }

  return data as Category
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
    throw error
  }

  return (data || []) as Category[]
}

