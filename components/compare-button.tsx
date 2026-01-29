'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { addToCompare, removeFromCompare, isInCompare, canAddToCompare } from '@/lib/utils/compare'
import { Squares2X2Icon } from '@heroicons/react/24/outline'

interface CompareButtonProps {
  productId: string
  className?: string
}

export function CompareButton({ productId, className = '' }: CompareButtonProps) {
  const router = useRouter()
  const [inCompare, setInCompare] = useState(false)
  const [canAdd, setCanAdd] = useState(true)

  useEffect(() => {
    setInCompare(isInCompare(productId))
    setCanAdd(canAddToCompare())
  }, [productId])

  function handleToggle() {
    if (inCompare) {
      removeFromCompare(productId)
      setInCompare(false)
    } else {
      if (!canAdd) {
        alert('Vous ne pouvez comparer que 4 produits maximum')
        return
      }
      const added = addToCompare(productId)
      if (added) {
        setInCompare(true)
        setCanAdd(canAddToCompare())
      }
    }
  }

  return (
    <button
      onClick={handleToggle}
      className={`p-1.5 rounded-lg transition-all shadow-sm ${
        inCompare
          ? 'bg-primary-50 text-primary-600 hover:bg-primary-100'
          : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-primary-600'
      } ${className}`}
      title={inCompare ? 'Retirer de la comparaison' : 'Ajouter à la comparaison'}
    >
      <Squares2X2Icon className="w-4 h-4" />
    </button>
  )
}
