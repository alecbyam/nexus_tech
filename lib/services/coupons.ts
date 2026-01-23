import { createSupabaseClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Coupon = Database['public']['Tables']['coupons']['Row']

export interface CouponValidation {
  valid: boolean
  discountAmount: number
  error?: string
}

/**
 * Valider et appliquer un code promo
 */
export async function validateCoupon(
  code: string,
  totalCents: number,
  userId: string
): Promise<CouponValidation> {
  const supabase = createSupabaseClient()

  // Récupérer le coupon
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (error || !coupon) {
    return {
      valid: false,
      discountAmount: 0,
      error: 'Code promo invalide',
    }
  }

  // Vérifier les dates
  const now = new Date()
  if (new Date(coupon.valid_from) > now) {
    return {
      valid: false,
      discountAmount: 0,
      error: 'Ce code promo n\'est pas encore valide',
    }
  }

  if (coupon.valid_until && new Date(coupon.valid_until) < now) {
    return {
      valid: false,
      discountAmount: 0,
      error: 'Ce code promo a expiré',
    }
  }

  // Vérifier le montant minimum
  if (totalCents < coupon.min_purchase_cents) {
    return {
      valid: false,
      discountAmount: 0,
      error: `Montant minimum requis: $${(coupon.min_purchase_cents / 100).toFixed(2)}`,
    }
  }

  // Vérifier la limite d'utilisation
  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    return {
      valid: false,
      discountAmount: 0,
      error: 'Ce code promo a atteint sa limite d\'utilisation',
    }
  }

  // Calculer la réduction
  let discountAmount = 0
  if (coupon.discount_type === 'percentage') {
    discountAmount = Math.round((totalCents * coupon.discount_value) / 100)
  } else {
    discountAmount = coupon.discount_value
  }

  // Appliquer le maximum de réduction si défini
  if (coupon.max_discount_cents && discountAmount > coupon.max_discount_cents) {
    discountAmount = coupon.max_discount_cents
  }

  return {
    valid: true,
    discountAmount,
  }
}

/**
 * Utiliser un coupon (appeler après validation de la commande)
 */
export async function useCoupon(
  couponId: string,
  userId: string,
  orderId: string,
  discountAmountCents: number
): Promise<void> {
  const supabase = createSupabaseClient()

  // Enregistrer l'utilisation
  const { error: usageError } = await supabase.from('coupon_usage').insert({
    coupon_id: couponId,
    user_id: userId,
    order_id: orderId,
    discount_amount_cents: discountAmountCents,
  })

  if (usageError) {
    throw new Error(`Erreur lors de l'utilisation du coupon: ${usageError.message}`)
  }

  // Incrémenter le compteur
  const { error: updateError } = await supabase.rpc('increment', {
    table_name: 'coupons',
    column_name: 'used_count',
    row_id: couponId,
  })

  // Alternative si RPC n'existe pas
  if (updateError) {
    const { data: coupon } = await supabase
      .from('coupons')
      .select('used_count')
      .eq('id', couponId)
      .single()

    if (coupon) {
      await supabase
        .from('coupons')
        .update({ used_count: coupon.used_count + 1 })
        .eq('id', couponId)
    }
  }
}

/**
 * Récupérer tous les coupons actifs
 */
export async function getActiveCoupons(): Promise<Coupon[]> {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('is_active', true)
    .gte('valid_until', new Date().toISOString())
    .or('valid_until.is.null')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Erreur lors de la récupération: ${error.message}`)
  }

  return data || []
}
