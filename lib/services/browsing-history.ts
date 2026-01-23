import { createSupabaseClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type BrowsingHistory = Database['public']['Tables']['browsing_history']['Row']

/**
 * Ajouter un produit à l'historique de navigation
 */
export async function addToBrowsingHistory(
  productId: string,
  userId?: string,
  sessionId?: string
): Promise<void> {
  try {
    const supabase = createSupabaseClient()

    // Vérifier si déjà dans l'historique récent (éviter les doublons)
    const { data: recent } = await supabase
      .from('browsing_history')
      .select('id')
      .eq('product_id', productId)
      .gte('viewed_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // 5 minutes

    if (userId) {
      const userRecent = recent?.find((h: any) => h.user_id === userId)
      if (userRecent) return
    } else if (sessionId) {
      const sessionRecent = recent?.find((h: any) => h.session_id === sessionId)
      if (sessionRecent) return
    }

    const { error } = await supabase.from('browsing_history').insert({
      product_id: productId,
      user_id: userId || null,
      session_id: sessionId || null,
    })

    if (error) {
      // Table might not exist yet - silently fail
      console.warn('Could not add to browsing history:', error.message)
    }
  } catch (error) {
    // Silently fail if table doesn't exist
    console.warn('Error adding to browsing history:', error)
  }
}

/**
 * Récupérer l'historique de navigation
 */
export async function getBrowsingHistory(userId?: string, sessionId?: string, limit: number = 20) {
  const supabase = createSupabaseClient()

  let query = supabase
    .from('browsing_history')
    .select(`
      *,
      products (
        id,
        name,
        price_cents,
        compare_at_price_cents,
        product_images (storage_path, is_primary)
      )
    `)
    .order('viewed_at', { ascending: false })
    .limit(limit)

  if (userId) {
    query = query.eq('user_id', userId)
  } else if (sessionId) {
    query = query.eq('session_id', sessionId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Erreur lors de la récupération: ${error.message}`)
  }

  // Dédupliquer par produit (garder le plus récent)
  const uniqueProducts = new Map()
  data?.forEach((item: any) => {
    if (!uniqueProducts.has(item.product_id)) {
      uniqueProducts.set(item.product_id, item)
    }
  })

  return Array.from(uniqueProducts.values())
}
