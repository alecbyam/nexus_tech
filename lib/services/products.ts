/**
 * Service pour récupérer les produits depuis Supabase
 */

import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

type Product = Database['public']['Tables']['products']['Row']
type ProductImage = Database['public']['Tables']['product_images']['Row']
type ProductWithImages = Product & {
  product_images?: ProductImage[]
  categories?: Database['public']['Tables']['categories']['Row']
}

export interface ProductFilters {
  categoryId?: string
  categoryKey?: string
  query?: string
  isActive?: boolean
  limit?: number
  offset?: number
}

/**
 * Récupère les produits avec filtres optionnels (server-side)
 */
export async function getProducts(filters: ProductFilters = {}): Promise<ProductWithImages[]> {
  const supabase = await createServerClient()
  
  const {
    categoryId,
    categoryKey,
    query,
    isActive = true,
    limit = 50,
    offset = 0,
  } = filters

  let queryBuilder = supabase
    .from('products')
    .select(`
      *,
      categories (*),
      product_images (*)
    `)

  if (isActive !== undefined) {
    queryBuilder = queryBuilder.eq('is_active', isActive)
  }

  if (categoryId) {
    queryBuilder = queryBuilder.eq('category_id', categoryId)
  }

  if (categoryKey) {
    queryBuilder = queryBuilder.eq('categories.key', categoryKey)
  }

  if (query && query.trim()) {
    queryBuilder = queryBuilder.ilike('name', `%${query.trim()}%`)
  }

  const { data, error } = await queryBuilder
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching products:', error)
    throw new Error(`Failed to fetch products: ${error.message}`)
  }

  return (data || []) as ProductWithImages[]
}

/**
 * Récupère un produit par son ID (server-side)
 */
export async function getProductById(id: string): Promise<ProductWithImages | null> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (*),
      product_images (*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Aucun résultat trouvé
      return null
    }
    console.error('Error fetching product by id:', error)
    throw new Error(`Failed to fetch product: ${error.message}`)
  }

  return data as ProductWithImages
}

/**
 * Récupère les images d'un produit (server-side)
 */
export async function getProductImages(productId: string): Promise<ProductImage[]> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching product images:', error)
    throw new Error(`Failed to fetch product images: ${error.message}`)
  }

  return (data || []) as ProductImage[]
}

/**
 * Récupère l'image principale d'un produit (server-side)
 */
export async function getPrimaryProductImage(productId: string): Promise<ProductImage | null> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .eq('is_primary', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Aucune image principale trouvée, récupérer la première
      const { data: firstImage } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()
      
      return firstImage as ProductImage | null
    }
    console.error('Error fetching primary product image:', error)
    return null
  }

  return data as ProductImage
}
