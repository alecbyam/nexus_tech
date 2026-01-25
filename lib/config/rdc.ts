/**
 * Configuration pour la République Démocratique du Congo (RDC)
 */

export const RDC_CONFIG = {
  // Devise
  currency: {
    code: 'CDF',
    symbol: 'FC',
    name: 'Franc congolais',
    // Taux de change approximatif (à mettre à jour régulièrement)
    exchangeRate: {
      USD: 2800, // 1 USD = 2800 CDF
      EUR: 3000, // 1 EUR ≈ 3000 CDF
    },
  },

  // Formatage des prix
  priceFormat: {
    locale: 'fr-CD', // Locale pour la RDC
    minimumFractionDigits: 0, // Pas de décimales pour le CDF
    maximumFractionDigits: 0,
  },

  // Taxes et frais
  taxes: {
    tva: 0.16, // TVA de 16% en RDC
    shipping: {
      local: 5000, // Frais de livraison local (CDF)
      regional: 15000, // Frais de livraison régional
    },
  },

  // Zones de livraison principales en RDC
  deliveryZones: [
    { name: 'Kinshasa', code: 'KIN', price: 5000 },
    { name: 'Lubumbashi', code: 'LUB', price: 10000 },
    { name: 'Goma', code: 'GOM', price: 12000 },
    { name: 'Kisangani', code: 'KIS', price: 15000 },
    { name: 'Bukavu', code: 'BUK', price: 12000 },
    { name: 'Mbuji-Mayi', code: 'MBJ', price: 10000 },
  ],

  // Catégories populaires en RDC
  popularCategories: [
    'smartphones',
    'ordinateurs',
    'tablettes',
    'accessoires',
    'televiseurs',
    'ecouteurs',
  ],
}

/**
 * Formate un prix en CDF
 */
export function formatPriceCDF(priceCents: number): string {
  const price = priceCents / 100 // Convertir de centimes
  return new Intl.NumberFormat('fr-CD', {
    style: 'currency',
    currency: 'CDF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

/**
 * Convertit un prix USD en CDF
 */
export function convertUSDToCDF(usdPrice: number): number {
  return Math.round(usdPrice * RDC_CONFIG.currency.exchangeRate.USD * 100) // En centimes
}

/**
 * Convertit un prix CDF en USD
 */
export function convertCDFToUSD(cdfPrice: number): number {
  return cdfPrice / (RDC_CONFIG.currency.exchangeRate.USD * 100) // En dollars
}
