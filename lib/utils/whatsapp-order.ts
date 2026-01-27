/**
 * Utilitaire pour générer des messages de commande WhatsApp
 */

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
}

export interface WhatsAppOrderData {
  items: CartItem[]
  subtotal: number
  discount?: number
  total: number
  currency?: string
  deliveryAddress?: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  paymentMethod?: string
  orderId?: string
}

/**
 * Génère un message WhatsApp formaté avec tous les détails de la commande
 */
export function generateWhatsAppOrderMessage(data: WhatsAppOrderData): string {
  const {
    items,
    subtotal,
    discount = 0,
    total,
    currency = 'USD',
    deliveryAddress,
    customerName,
    customerPhone,
    customerEmail,
    paymentMethod,
    orderId,
  } = data

  const lines: string[] = []
  
  // En-tête
  lines.push('🛍️ *NOUVELLE COMMANDE VIA WHATSAPP*')
  lines.push('')
  lines.push('Bonjour ONATECH,')
  lines.push('Je souhaite confirmer ma commande via WhatsApp.')
  lines.push('')
  
  // Informations client
  if (customerName || customerPhone || customerEmail) {
    lines.push('👤 *INFORMATIONS CLIENT*')
    if (customerName) lines.push(`Nom: ${customerName}`)
    if (customerPhone) lines.push(`Téléphone: ${customerPhone}`)
    if (customerEmail) lines.push(`Email: ${customerEmail}`)
    lines.push('')
  }
  
  // ID de commande si disponible
  if (orderId) {
    lines.push(`📋 *ID COMMANDE: ${orderId}*`)
    lines.push('')
  }
  
  // Articles
  lines.push('🛒 *ARTICLES COMMANDÉS*')
  lines.push('')
  
  items.forEach((item, index) => {
    const itemTotal = item.price * item.quantity
    lines.push(`${index + 1}. *${item.name}*`)
    lines.push(`   Quantité: ${item.quantity}`)
    lines.push(`   Prix unitaire: ${formatCurrency(item.price, currency)}`)
    lines.push(`   Sous-total: ${formatCurrency(itemTotal, currency)}`)
    lines.push('')
  })
  
  // Résumé financier
  lines.push('💰 *RÉSUMÉ FINANCIER*')
  lines.push(`Sous-total: ${formatCurrency(subtotal, currency)}`)
  if (discount > 0) {
    lines.push(`Réduction: -${formatCurrency(discount, currency)}`)
  }
  lines.push(`*TOTAL: ${formatCurrency(total, currency)}*`)
  lines.push('')
  
  // Méthode de paiement
  if (paymentMethod) {
    const paymentLabels: Record<string, string> = {
      cash: '💵 Espèces',
      card: '💳 Carte bancaire',
      mpesa: '📱 M-Pesa',
      orange_money: '📱 Orange Money',
      airtel_money: '📱 Airtel Money',
    }
    lines.push(`💳 *Méthode de paiement:* ${paymentLabels[paymentMethod] || paymentMethod}`)
    lines.push('')
  }
  
  // Adresse de livraison
  if (deliveryAddress) {
    lines.push('📍 *ADRESSE DE LIVRAISON*')
    lines.push(deliveryAddress)
    lines.push('')
  }
  
  // Message de fin
  lines.push('Merci de confirmer ma commande.')
  lines.push('')
  lines.push('Cordialement')
  
  return lines.join('\n')
}

/**
 * Formate un montant en devise
 */
function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Ouvre WhatsApp avec un message pré-rempli
 */
export function openWhatsAppOrder(data: WhatsAppOrderData, phoneNumber: string = '243818510311'): void {
  const message = generateWhatsAppOrderMessage(data)
  const encodedMessage = encodeURIComponent(message)
  const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
  window.open(url, '_blank')
}
