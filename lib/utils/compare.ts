/**
 * Utilitaires pour la comparaison de produits
 */

const MAX_COMPARE_ITEMS = 4

/**
 * Ajouter un produit à la comparaison
 */
export function addToCompare(productId: string): boolean {
  const saved = localStorage.getItem('compare_products')
  const compareList: string[] = saved ? JSON.parse(saved) : []

  if (compareList.includes(productId)) {
    return false // Déjà dans la liste
  }

  if (compareList.length >= MAX_COMPARE_ITEMS) {
    return false // Limite atteinte
  }

  compareList.push(productId)
  localStorage.setItem('compare_products', JSON.stringify(compareList))
  return true
}

/**
 * Retirer un produit de la comparaison
 */
export function removeFromCompare(productId: string): void {
  const saved = localStorage.getItem('compare_products')
  if (!saved) return

  const compareList: string[] = JSON.parse(saved)
  const newList = compareList.filter((id) => id !== productId)
  localStorage.setItem('compare_products', JSON.stringify(newList))
}

/**
 * Vérifier si un produit est dans la comparaison
 */
export function isInCompare(productId: string): boolean {
  const saved = localStorage.getItem('compare_products')
  if (!saved) return false

  const compareList: string[] = JSON.parse(saved)
  return compareList.includes(productId)
}

/**
 * Récupérer la liste de comparaison
 */
export function getCompareList(): string[] {
  const saved = localStorage.getItem('compare_products')
  return saved ? JSON.parse(saved) : []
}

/**
 * Vérifier si on peut ajouter plus de produits
 */
export function canAddToCompare(): boolean {
  const list = getCompareList()
  return list.length < MAX_COMPARE_ITEMS
}
