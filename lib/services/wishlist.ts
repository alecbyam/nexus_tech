import { createSupabaseClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Wishlist = Database['public']['Tables']['wishlists']['Row']

/**
 * Ajouter un produit à la wishlist
 */
export async function addToWishlist(productId: string, userId: string): Promise<void> {
  const supabase = createSupabaseClient()

  const { error } = await supabase.from('wishlists').insert({
    user_id: userId,
    product_id: productId,
  })

  if (error) {
    if (error.code === '23505') {
      // Déjà dans la wishlist
      return
    }
    throw new Error(`Erreur lors de l'ajout à la wishlist: ${error.message}`)
  }
}

/**
 * Retirer un produit de la wishlist
 */
export async function removeFromWishlist(productId: string, userId: string): Promise<void> {
  const supabase = createSupabaseClient()

  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId)

  if (error) {
    throw new Error(`Erreur lors de la suppression de la wishlist: ${error.message}`)
  }
}

/**
 * Vérifier si un produit est dans la wishlist
 */
export async function isInWishlist(productId: string, userId: string): Promise<boolean> {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single()

    if (error) {
      // Table doesn't exist or no result
      if (error.code === 'PGRST116' || error.code === '42P01') {
        return false
      }
      throw new Error(`Erreur lors de la vérification: ${error.message}`)
    }

    return !!data
  } catch (error: any) {
    // Table might not exist yet
    if (error?.code === '42P01') {
      return false
    }
    throw error
  }
}

/**
 * Récupérer tous les produits de la wishlist d'un utilisateur
 */
export async function getWishlist(userId: string) {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('wishlists')
    .select(`
      *,
      products (
        id,
        name,
        price_cents,
        compare_at_price_cents,
        stock,
        is_active,
        product_images (storage_path, is_primary)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Erreur lors de la récupération de la wishlist: ${error.message}`)
  }

  return data || []
}
