import { RDC_CONFIG, formatPriceCDF } from '@/lib/config/rdc'

/**
 * Formate un prix selon la devise configurée
 * Par défaut, utilise le CDF pour la RDC
 */
export function formatPrice(priceCents: number, currency: string = 'CDF'): string {
  if (currency === 'CDF') {
    return formatPriceCDF(priceCents)
  }
  
  // Fallback pour USD ou autres devises
  const price = priceCents / 100
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'USD' ? 2 : 0,
    maximumFractionDigits: currency === 'USD' ? 2 : 0,
  }).format(price)
}

/**
 * Formate un prix avec symbole simple (pour affichage compact)
 */
export function formatPriceSimple(priceCents: number, currency: string = 'CDF'): string {
  const price = priceCents / 100
  if (currency === 'CDF') {
    return `${price.toLocaleString('fr-CD')} FC`
  }
  return `${currency === 'USD' ? '$' : ''}${price.toFixed(currency === 'USD' ? 2 : 0)}`
}
