import { createSupabaseClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Review = Database['public']['Tables']['product_reviews']['Row']

export interface ReviewWithUser extends Review {
  profiles: {
    full_name: string | null
  }
}

/**
 * Ajouter un avis produit
 */
export async function addReview(
  productId: string,
  userId: string,
  rating: number,
  comment?: string
): Promise<void> {
  const supabase = createSupabaseClient()

  const { error } = await supabase.from('product_reviews').insert({
    product_id: productId,
    user_id: userId,
    rating,
    comment: comment || null,
    is_approved: false, // Nécessite modération admin
  })

  if (error) {
    if (error.code === '23505') {
      throw new Error('Vous avez déjà laissé un avis pour ce produit')
    }
    throw new Error(`Erreur lors de l'ajout de l'avis: ${error.message}`)
  }
}

/**
 * Récupérer les avis approuvés d'un produit
 */
export async function getProductReviews(productId: string): Promise<ReviewWithUser[]> {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('product_reviews')
      .select(`
        *,
        profiles (full_name)
      `)
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    if (error) {
      // Table might not exist yet
      if (error.code === '42P01') {
        return []
      }
      throw new Error(`Erreur lors de la récupération des avis: ${error.message}`)
    }

    return (data || []) as ReviewWithUser[]
  } catch (error) {
    // Return empty array if table doesn't exist
    return []
  }
}

/**
 * Calculer la note moyenne d'un produit
 */
export async function getProductRating(productId: string): Promise<{
  average: number
  count: number
}> {
  try {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from('product_reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('is_approved', true)

    if (error) {
      // Table might not exist yet
      if (error.code === '42P01') {
        return { average: 0, count: 0 }
      }
      throw new Error(`Erreur lors du calcul de la note: ${error.message}`)
    }

    if (!data || data.length === 0) {
      return { average: 0, count: 0 }
    }

    const sum = data.reduce((acc, review) => acc + review.rating, 0)
    const average = sum / data.length

    return {
      average: Math.round(average * 10) / 10,
      count: data.length,
    }
  } catch (error) {
    // Return default if table doesn't exist
    return { average: 0, count: 0 }
  }
}

/**
 * Vérifier si l'utilisateur a déjà laissé un avis
 */
export async function hasUserReviewed(productId: string, userId: string): Promise<boolean> {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('product_reviews')
    .select('id')
    .eq('product_id', productId)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Erreur lors de la vérification: ${error.message}`)
  }

  return !!data
}
