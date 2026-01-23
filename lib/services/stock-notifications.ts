import { createSupabaseClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type StockNotification = Database['public']['Tables']['stock_notifications']['Row']

/**
 * S'abonner aux notifications de stock
 */
export async function subscribeToStockNotification(
  productId: string,
  userId?: string,
  email?: string,
  phone?: string
): Promise<void> {
  const supabase = createSupabaseClient()

  // Vérifier si déjà abonné
  const { data: existing } = await supabase
    .from('stock_notifications')
    .select('id')
    .eq('product_id', productId)
    .eq('is_notified', false)

  if (userId) {
    const userNotification = existing?.find((n: any) => n.user_id === userId)
    if (userNotification) {
      return // Déjà abonné
    }
  }

  const { error } = await supabase.from('stock_notifications').insert({
    product_id: productId,
    user_id: userId || null,
    email: email || null,
    phone: phone || null,
  })

  if (error) {
    throw new Error(`Erreur lors de l'abonnement: ${error.message}`)
  }
}

/**
 * Vérifier si l'utilisateur est abonné
 */
export async function isSubscribedToStock(
  productId: string,
  userId?: string
): Promise<boolean> {
  try {
    const supabase = createSupabaseClient()

    let query = supabase
      .from('stock_notifications')
      .select('id')
      .eq('product_id', productId)
      .eq('is_notified', false)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query.single()

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
 * Récupérer les notifications en attente (admin)
 */
export async function getPendingNotifications() {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('stock_notifications')
    .select(`
      *,
      products (name, stock)
    `)
    .eq('is_notified', false)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Erreur lors de la récupération: ${error.message}`)
  }

  return data || []
}
