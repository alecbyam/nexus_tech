'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers'
import { Header } from '@/components/header'
import { useRouter } from 'next/navigation'
import { getWishlist, removeFromWishlist } from '@/lib/services/wishlist'
import { ProductGrid } from '@/components/product-grid'
import { ProductGridSkeleton } from '@/components/product-skeleton'
import Link from 'next/link'
import Image from 'next/image'
import type { Database } from '@/types/database.types'

type WishlistItem = Database['public']['Tables']['wishlists']['Row'] & {
  products: Database['public']['Tables']['products']['Row'] & {
    product_images: Array<{
      storage_path: string
      is_primary: boolean
    }>
  }
}

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/auth?redirect=/wishlist')
      return
    }

    loadWishlist()
  }, [user, authLoading, router])

  async function loadWishlist() {
    if (!user) return

    try {
      const items = await getWishlist(user.id)
      setWishlist(items as WishlistItem[])
    } catch (error: any) {
      console.error('Error loading wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleRemove(productId: string) {
    if (!user) return

    try {
      await removeFromWishlist(productId, user.id)
      await loadWishlist()
    } catch (error: any) {
      console.error('Error removing from wishlist:', error)
      alert('Erreur lors de la suppression')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <ProductGridSkeleton count={8} />
        </main>
      </div>
    )
  }

  const products = wishlist.map((item) => item.products).filter(Boolean)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8">
          Ma Liste de Souhaits
        </h1>

        {wishlist.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💝</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Votre liste de souhaits est vide
            </h2>
            <p className="text-gray-600 mb-6">
              Ajoutez des produits à vos favoris pour les retrouver facilement
            </p>
            <Link
              href="/catalog"
              className="inline-block bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all font-bold"
            >
              Découvrir le catalogue
            </Link>
          </div>
        ) : (
          <ProductGrid products={products as any} />
        )}
      </main>
    </div>
  )
}
