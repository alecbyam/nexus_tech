import { createSupabaseClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Payment = Database['public']['Tables']['payments']['Row']
type PaymentMethod = 'mpesa' | 'orange_money' | 'airtel_money' | 'card' | 'cash'

export interface MobileMoneyPaymentRequest {
  orderId: string
  userId: string
  amountCents: number
  currency: string
  paymentMethod: PaymentMethod
  phoneNumber: string
  // Autres données optionnelles
  pin?: string // Ne jamais stocker en clair
}

export interface PaymentResponse {
  success: boolean
  paymentId?: string
  transactionId?: string
  providerReference?: string
  error?: string
  message?: string
}

/**
 * Créer un paiement mobile money
 */
export async function createMobileMoneyPayment(
  request: MobileMoneyPaymentRequest
): Promise<PaymentResponse> {
  const supabase = createSupabaseClient()

  try {
    // Créer l'enregistrement de paiement
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: request.orderId,
        user_id: request.userId,
        amount_cents: request.amountCents,
        currency: request.currency,
        payment_method: request.paymentMethod,
        payment_status: 'pending',
        phone_number: request.phoneNumber,
        payment_data: request.pin ? { has_pin: true } : null, // Ne jamais stocker le PIN
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Error creating payment:', paymentError)
      return {
        success: false,
        error: paymentError.message || 'Erreur lors de la création du paiement',
      }
    }

    // Mettre à jour la commande avec la méthode de paiement
    await supabase
      .from('orders')
      .update({ payment_method: request.paymentMethod })
      .eq('id', request.orderId)

    // Simuler l'appel à l'API du fournisseur mobile money
    // Dans un environnement réel, vous appelleriez l'API du fournisseur ici
    const providerResponse = await processMobileMoneyPayment({
      paymentMethod: request.paymentMethod,
      phoneNumber: request.phoneNumber,
      amountCents: request.amountCents,
      paymentId: payment.id,
    })

    if (providerResponse.success) {
      // Mettre à jour le paiement avec les informations du fournisseur
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          transaction_id: providerResponse.transactionId,
          provider_reference: providerResponse.providerReference,
          payment_status: 'processing', // En attente de confirmation
        })
        .eq('id', payment.id)

      if (updateError) {
        console.error('Error updating payment:', updateError)
      }

      return {
        success: true,
        paymentId: payment.id,
        transactionId: providerResponse.transactionId,
        providerReference: providerResponse.providerReference,
        message: getPaymentMessage(request.paymentMethod),
      }
    } else {
      // Marquer le paiement comme échoué
      await supabase
        .from('payments')
        .update({
          payment_status: 'failed',
          error_message: providerResponse.error,
        })
        .eq('id', payment.id)

      return {
        success: false,
        error: providerResponse.error || 'Erreur lors du traitement du paiement',
      }
    }
  } catch (error: any) {
    console.error('Error in createMobileMoneyPayment:', error)
    return {
      success: false,
      error: error.message || 'Erreur inattendue lors du paiement',
    }
  }
}

/**
 * Simuler le traitement du paiement mobile money
 * Dans un environnement réel, vous appelleriez l'API du fournisseur
 */
async function processMobileMoneyPayment(params: {
  paymentMethod: PaymentMethod
  phoneNumber: string
  amountCents: number
  paymentId: string
}): Promise<PaymentResponse> {
  // SIMULATION - À remplacer par l'appel réel à l'API du fournisseur
  
  // Pour M-Pesa, Orange Money, Airtel Money, vous devrez :
  // 1. Configurer les clés API dans les variables d'environnement
  // 2. Appeler l'API du fournisseur avec les bonnes credentials
  // 3. Gérer les réponses et erreurs
  
  // Exemple de structure pour un appel API réel :
  /*
  const apiKey = process.env[`${params.paymentMethod.toUpperCase()}_API_KEY`]
  const apiUrl = process.env[`${params.paymentMethod.toUpperCase()}_API_URL`]
  
  const response = await fetch(`${apiUrl}/payment`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phone: params.phoneNumber,
      amount: params.amountCents / 100,
      reference: params.paymentId,
    }),
  })
  
  const data = await response.json()
  return {
    success: data.success,
    transactionId: data.transaction_id,
    providerReference: data.reference,
    error: data.error,
  }
  */

  // Simulation pour le développement
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simuler un succès (dans la vraie vie, cela dépendrait de la réponse de l'API)
      resolve({
        success: true,
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        providerReference: `REF-${params.paymentMethod.toUpperCase()}-${params.paymentId.substring(0, 8)}`,
      })
    }, 1000) // Simuler un délai de traitement
  })
}

/**
 * Vérifier le statut d'un paiement
 */
export async function checkPaymentStatus(paymentId: string): Promise<Payment | null> {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single()

  if (error) {
    console.error('Error checking payment status:', error)
    return null
  }

  return data
}

/**
 * Confirmer un paiement (appelé par webhook ou vérification manuelle)
 */
export async function confirmPayment(
  paymentId: string,
  transactionId: string
): Promise<boolean> {
  const supabase = createSupabaseClient()

  const { error } = await supabase
    .from('payments')
    .update({
      payment_status: 'completed',
      transaction_id: transactionId,
      completed_at: new Date().toISOString(),
    })
    .eq('id', paymentId)

  return !error
}

/**
 * Obtenir le message de confirmation selon le fournisseur
 */
function getPaymentMessage(paymentMethod: PaymentMethod): string {
  const messages = {
    mpesa: 'Veuillez confirmer le paiement M-Pesa sur votre téléphone. Entrez votre code PIN M-Pesa.',
    orange_money: 'Veuillez confirmer le paiement Orange Money sur votre téléphone. Entrez votre code PIN Orange Money.',
    airtel_money: 'Veuillez confirmer le paiement Airtel Money sur votre téléphone. Entrez votre code PIN Airtel Money.',
    card: 'Paiement par carte en cours de traitement...',
    cash: 'Paiement en espèces à la livraison.',
  }

  return messages[paymentMethod] || 'Paiement en cours de traitement...'
}

/**
 * Obtenir les informations de paiement d'une commande
 */
export async function getOrderPayment(orderId: string): Promise<Payment | null> {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('order_id', orderId)
    .single()

  if (error) {
    console.error('Error getting order payment:', error)
    return null
  }

  return data
}

/**
 * Obtenir tous les paiements d'un utilisateur
 */
export async function getUserPayments(userId: string): Promise<Payment[]> {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error getting user payments:', error)
    return []
  }

  return data || []
}
