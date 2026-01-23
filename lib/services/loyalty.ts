import { createSupabaseClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type LoyaltyPoints = Database['public']['Tables']['loyalty_points']['Row']
type LoyaltyTransaction = Database['public']['Tables']['loyalty_transactions']['Row']

const POINTS_PER_DOLLAR = 10 // 10 points par dollar dépensé
const POINTS_TO_DOLLAR = 100 // 100 points = 1 dollar de réduction

/**
 * Récupérer les points de fidélité d'un utilisateur
 */
export async function getLoyaltyPoints(userId: string): Promise<LoyaltyPoints | null> {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('loyalty_points')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Erreur lors de la récupération: ${error.message}`)
  }

  if (!data) {
    // Créer un compte de fidélité si inexistant
    const { data: newAccount } = await supabase
      .from('loyalty_points')
      .insert({ user_id: userId })
      .select()
      .single()

    return newAccount
  }

  return data
}

/**
 * Ajouter des points après une commande
 */
export async function addPointsFromOrder(
  userId: string,
  orderId: string,
  totalCents: number
): Promise<void> {
  const supabase = createSupabaseClient()

  const pointsEarned = Math.floor((totalCents / 100) * POINTS_PER_DOLLAR)

  // Récupérer ou créer le compte
  let account = await getLoyaltyPoints(userId)
  if (!account) {
    const { data: newAccount } = await supabase
      .from('loyalty_points')
      .insert({ user_id: userId })
      .select()
      .single()
    account = newAccount
  }

  // Mettre à jour les points
  const { error: updateError } = await supabase
    .from('loyalty_points')
    .update({
      points: (account.points || 0) + pointsEarned,
      total_earned: (account.total_earned || 0) + pointsEarned,
    })
    .eq('user_id', userId)

  if (updateError) {
    throw new Error(`Erreur lors de l'ajout des points: ${updateError.message}`)
  }

  // Enregistrer la transaction
  await supabase.from('loyalty_transactions').insert({
    user_id: userId,
    points: pointsEarned,
    transaction_type: 'earned',
    description: `Points gagnés pour la commande #${orderId.slice(0, 8)}`,
    order_id: orderId,
  })
}

/**
 * Utiliser des points pour une réduction
 */
export async function redeemPoints(
  userId: string,
  pointsToRedeem: number
): Promise<number> {
  const supabase = createSupabaseClient()

  const account = await getLoyaltyPoints(userId)
  if (!account || account.points < pointsToRedeem) {
    throw new Error('Points insuffisants')
  }

  const discountCents = Math.floor((pointsToRedeem / POINTS_TO_DOLLAR) * 100)

  // Mettre à jour les points
  const { error: updateError } = await supabase
    .from('loyalty_points')
    .update({
      points: account.points - pointsToRedeem,
      total_redeemed: (account.total_redeemed || 0) + pointsToRedeem,
    })
    .eq('user_id', userId)

  if (updateError) {
    throw new Error(`Erreur lors de l'utilisation des points: ${updateError.message}`)
  }

  // Enregistrer la transaction
  await supabase.from('loyalty_transactions').insert({
    user_id: userId,
    points: -pointsToRedeem,
    transaction_type: 'redeemed',
    description: `${pointsToRedeem} points utilisés pour une réduction de $${(discountCents / 100).toFixed(2)}`,
  })

  return discountCents
}

/**
 * Récupérer l'historique des transactions
 */
export async function getLoyaltyHistory(userId: string): Promise<LoyaltyTransaction[]> {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('loyalty_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    throw new Error(`Erreur lors de la récupération: ${error.message}`)
  }

  return data || []
}
