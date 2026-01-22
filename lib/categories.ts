/**
 * Utilitaires pour le système de catégories hiérarchiques
 */

import type { Database } from '@/types/database.types'

export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryWithChildren = Category & {
  children?: Category[]
}

/**
 * Construit un arbre hiérarchique de catégories
 */
export function buildCategoryTree(categories: Category[]): CategoryWithChildren[] {
  const categoryMap = new Map<string, CategoryWithChildren>()
  const rootCategories: CategoryWithChildren[] = []

  // Créer un map de toutes les catégories
  categories.forEach((cat) => {
    categoryMap.set(cat.id, { ...cat, children: [] })
  })

  // Construire l'arbre
  categories.forEach((cat) => {
    const categoryWithChildren = categoryMap.get(cat.id)!
    
    if (cat.parent_id === null) {
      // Catégorie principale
      rootCategories.push(categoryWithChildren)
    } else {
      // Sous-catégorie : ajouter au parent
      const parent = categoryMap.get(cat.parent_id)
      if (parent) {
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(categoryWithChildren)
      }
    }
  })

  // Trier par sort_order
  const sortCategories = (cats: CategoryWithChildren[]) => {
    cats.sort((a, b) => a.sort_order - b.sort_order)
    cats.forEach((cat) => {
      if (cat.children) {
        sortCategories(cat.children)
      }
    })
  }

  sortCategories(rootCategories)
  return rootCategories
}

/**
 * Trouve une catégorie par son slug
 */
export function findCategoryBySlug(
  categories: Category[],
  slug: string
): Category | undefined {
  return categories.find((cat) => cat.slug === slug)
}

/**
 * Obtient toutes les sous-catégories d'une catégorie (récursif)
 */
export function getAllSubcategories(
  categories: Category[],
  parentId: string
): Category[] {
  const subcategories: Category[] = []
  
  const findChildren = (id: string) => {
    categories.forEach((cat) => {
      if (cat.parent_id === id) {
        subcategories.push(cat)
        findChildren(cat.id) // Récursif pour les sous-sous-catégories
      }
    })
  }
  
  findChildren(parentId)
  return subcategories
}

/**
 * Obtient le chemin complet d'une catégorie (ex: "Téléphones > Android")
 */
export function getCategoryPath(
  categories: Category[],
  categoryId: string
): string {
  const category = categories.find((c) => c.id === categoryId)
  if (!category) return ''

  const path: string[] = [category.name]
  let currentId = category.parent_id

  while (currentId) {
    const parent = categories.find((c) => c.id === currentId)
    if (parent) {
      path.unshift(parent.name)
      currentId = parent.parent_id
    } else {
      break
    }
  }

  return path.join(' > ')
}

/**
 * Filtre les catégories actives
 */
export function filterActiveCategories(categories: Category[]): Category[] {
  return categories.filter((cat) => cat.is_active)
}

/**
 * Obtient uniquement les catégories principales
 */
export function getMainCategories(categories: Category[]): Category[] {
  return categories.filter((cat) => cat.parent_id === null)
}

/**
 * Obtient les sous-catégories directes d'une catégorie
 */
export function getDirectSubcategories(
  categories: Category[],
  parentId: string
): Category[] {
  return categories
    .filter((cat) => cat.parent_id === parentId)
    .sort((a, b) => a.sort_order - b.sort_order)
}

