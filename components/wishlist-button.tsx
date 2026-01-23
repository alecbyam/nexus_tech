'use client'

import { useState, useEffect } from 'react'
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { useAuth } from '@/components/providers'
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/lib/services/wishlist'
import { useRouter } from 'next/navigation'

interface WishlistButtonProps {
  productId: string
  className?: string
}

export function WishlistButton({ productId, className = '' }: WishlistButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      checkWishlistStatus()
    }
  }, [user, productId])

  async function checkWishlistStatus() {
    if (!user) return
    try {
      const inWishlist = await isInWishlist(productId, user.id)
      setIsWishlisted(inWishlist)
    } catch (error: any) {
      // Table might not exist yet - silently fail
      if (error?.code !== '42P01') {
        console.warn('Error checking wishlist:', error)
      }
    }
  }

  async function handleToggle() {
    if (!user) {
      router.push('/auth?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }

    setLoading(true)
    try {
      if (isWishlisted) {
        await removeFromWishlist(productId, user.id)
        setIsWishlisted(false)
      } else {
        await addToWishlist(productId, user.id)
        setIsWishlisted(true)
      }
    } catch (error: any) {
      // Table might not exist yet
      if (error?.code === '42P01') {
        alert('Cette fonctionnalité sera bientôt disponible. Veuillez exécuter la migration SQL.')
        return
      }
      console.error('Error toggling wishlist:', error)
      alert(error.message || 'Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded-lg transition-all ${
        isWishlisted
          ? 'bg-red-50 text-red-500 hover:bg-red-100'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${className}`}
      title={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      {isWishlisted ? (
        <HeartIconSolid className="w-6 h-6" />
      ) : (
        <HeartIcon className="w-6 h-6" />
      )}
    </button>
  )
}
