import { RDC_CONFIG, formatPriceCDF } from '@/lib/config/rdc'

/**
 * Formate un prix selon la devise configurée
 * Par défaut, utilise le CDF pour la RDC
 */
export function formatPrice(priceCents: number, currency: string = 'USD'): string {
  // Formatage USD par défaut
  const price = priceCents / 100
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }
  
  // Fallback pour CDF ou autres devises
  if (currency === 'CDF') {
    return formatPriceCDF(priceCents)
  }
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

/**
 * Formate un prix avec symbole simple (pour affichage compact)
 */
export function formatPriceSimple(priceCents: number, currency: string = 'USD'): string {
  const price = priceCents / 100
  if (currency === 'USD') {
    return `$${price.toFixed(2)}`
  }
  if (currency === 'CDF') {
    return `${price.toLocaleString('fr-CD')} FC`
  }
  return `${price.toFixed(2)} ${currency}`
}
