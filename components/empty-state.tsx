'use client'

import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="mb-6 text-6xl opacity-50">
          {icon}
        </div>
      )}
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 max-w-md mb-6">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}

export function EmptyProducts() {
  return (
    <EmptyState
      icon="🔍"
      title="Aucun produit trouvé"
      description="Essayez de modifier vos critères de recherche ou parcourez nos catégories."
    />
  )
}

export function EmptyCart() {
  return (
    <EmptyState
      icon="🛒"
      title="Votre panier est vide"
      description="Ajoutez des produits à votre panier pour commencer vos achats."
    />
  )
}

export function EmptyOrders() {
  return (
    <EmptyState
      icon="📦"
      title="Aucune commande"
      description="Vous n'avez pas encore passé de commande. Parcourez notre catalogue pour découvrir nos produits."
    />
  )
}

export function EmptyWishlist() {
  return (
    <EmptyState
      icon="❤️"
      title="Aucun favori"
      description="Ajoutez des produits à vos favoris pour les retrouver facilement plus tard."
    />
  )
}

export function EmptySearch() {
  return (
    <EmptyState
      icon="🔎"
      title="Aucun résultat"
      description="Essayez d'autres mots-clés ou parcourez nos catégories pour trouver ce que vous cherchez."
    />
  )
}
