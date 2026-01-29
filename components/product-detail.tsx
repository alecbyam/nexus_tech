'use client'

import Image from 'next/image'
import { useCartStore } from '@/store/cart-store'
import { useState, memo, useEffect } from 'react'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers'
import { useSessionId } from '@/lib/hooks/use-session-id'
import { WishlistButton } from '@/components/wishlist-button'
import { StockNotificationButton } from '@/components/stock-notification-button'
import { ProductReviews } from '@/components/product-reviews'
import { addToBrowsingHistory } from '@/lib/services/browsing-history'
import { formatPrice } from '@/lib/utils/format-price'
import { useToast } from '@/components/toast'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { FormField } from '@/components/form-field'
import { QuantitySelector } from '@/components/quantity-selector'
import { useRouter } from 'next/navigation'

interface ProductDetailProps {
  product: {
    id: string
    name: string
    description: string | null
    price_cents: number
    compare_at_price_cents?: number | null
    currency?: string
    stock: number
    is_refurbished: boolean
    condition: string
    product_images: Array<{
      storage_path: string
      is_primary: boolean
    }>
    categories: {
      name: string
    }
  }
}

export const ProductDetail = memo(function ProductDetail({ product }: ProductDetailProps) {
  const addItem = useCartStore((state) => state.addItem)
  const { user } = useAuth()
  const sessionId = useSessionId()
  const toast = useToast()
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Track product view and browsing history
  useEffect(() => {
    const trackView = async () => {
      try {
        // Track product view
        try {
          await (supabase.from('product_views') as any).insert({
            product_id: product.id,
            user_id: user?.id || null,
            session_id: sessionId || null,
          })
        } catch (error) {
          // Table might not exist yet - silently fail
          console.warn('Could not track product view:', error)
        }

        // Track browsing history
        try {
          await addToBrowsingHistory(product.id, user?.id, sessionId || undefined)
        } catch (error) {
          // Table might not exist yet - silently fail
          console.warn('Could not track browsing history:', error)
        }
      } catch (error) {
        // Silently fail - tracking is not critical
        console.warn('Error tracking product view:', error)
      }
    }

    trackView()
  }, [product.id, user?.id, sessionId, supabase])

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  
  // Trier les images : principale en premier
  const sortedImages = [...product.product_images].sort((a, b) => 
    b.is_primary ? 1 : a.is_primary ? -1 : 0
  )
  
  const primaryImage = sortedImages[0]
  const currentImage = sortedImages[selectedImageIndex] || primaryImage
  
  const imageUrl = currentImage && supabaseUrl
    ? `${supabaseUrl}/storage/v1/object/public/product-images/${currentImage.storage_path}`
    : '/placeholder.png'

  const hasDiscount = product.compare_at_price_cents && 
    product.compare_at_price_cents > product.price_cents
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price_cents! - product.price_cents) / product.compare_at_price_cents!) * 100)
    : 0

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.showToast('Ce produit est en rupture de stock', 'warning')
      return
    }
    
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price_cents / 100,
        imageUrl,
      })
    }
    
    setAdded(true)
    toast.showToast(
      quantity > 1 
        ? `${quantity} articles ajoutés au panier` 
        : 'Article ajouté au panier',
      'success'
    )
    setTimeout(() => setAdded(false), 2000)
  }

  const handleWhatsApp = () => {
    const priceFormatted = formatPrice(product.price_cents, product.currency || 'USD')
    const message = encodeURIComponent(
      `Bonjour ONATECH, je veux commander: ${product.name} (prix: ${priceFormatted}).`
    )
    const phone = '243818510311'
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
  }

  const breadcrumbs = [
    { label: 'Catalogue', href: '/catalog' },
    { label: product.categories?.name || 'Produit', href: `/catalog` },
    { label: product.name },
  ]

  return (
    <div className="max-w-6xl mx-auto animate-fade-in px-3 sm:px-4">
      <Breadcrumbs items={breadcrumbs} className="mb-4 sm:mb-6" />
      
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-10 bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 md:p-8 lg:p-12 border border-gray-100">
        {/* Images */}
        <div className="space-y-2 sm:space-y-4">
          <div className="aspect-square relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
            {currentImage && (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, 50vw"
                priority
                quality={90}
              />
            )}
            {product.is_refurbished && (
              <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-4 py-2 rounded-full font-bold shadow-lg z-10">
                Reconditionné
              </div>
            )}
            {hasDiscount && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg font-bold z-10">
                -{discountPercent}%
              </div>
            )}
            <div className="absolute top-4 right-4 z-10">
              <WishlistButton productId={product.id} />
            </div>
          </div>
          
          {/* Miniatures */}
          {sortedImages.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-1.5 sm:gap-2">
              {sortedImages.map((img, index) => {
                const thumbUrl = supabaseUrl
                  ? `${supabaseUrl}/storage/v1/object/public/product-images/${img.storage_path}`
                  : '/placeholder.png'
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square relative rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-primary-500 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={thumbUrl}
                      alt={`${product.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 12.5vw"
                    />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Détails */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <span className="inline-block bg-primary-50 text-primary-600 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                {product.categories?.name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-3 sm:mb-4 leading-tight px-2 sm:px-0">
              {product.name}
            </h1>

            {product.description && (
              <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base md:text-lg leading-relaxed px-2 sm:px-0">{product.description}</p>
            )}

            <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl sm:rounded-2xl border border-primary-100">
              <div className="flex items-baseline gap-2 sm:gap-4 mb-2 sm:mb-3 flex-wrap">
                {hasDiscount ? (
                  <>
                    <span className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                      {formatPrice(product.price_cents, product.currency || 'USD')}
                    </span>
                    <span className="text-xl sm:text-2xl md:text-3xl text-gray-400 line-through">
                      {formatPrice(product.compare_at_price_cents!, product.currency || 'USD')}
                    </span>
                    <span className="bg-red-500 text-white px-2 sm:px-3 py-1 rounded-lg font-bold text-xs sm:text-sm">
                      -{discountPercent}%
                    </span>
                  </>
                ) : (
                  <span className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                    {formatPrice(product.price_cents, product.currency || 'USD')}
                  </span>
                )}
              </div>
              {/* Le stock est caché pour les clients - seul l'admin peut le voir */}
              {product.stock === 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <p className="text-red-600 font-semibold">Rupture de stock</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {product.stock > 0 && (
              <>
                <FormField label="Quantité" htmlFor="quantity">
                  <QuantitySelector
                    value={quantity}
                    onChange={setQuantity}
                    min={1}
                    max={product.stock}
                    size="lg"
                  />
                </FormField>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={added || product.stock === 0}
                    className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 disabled:from-green-500 disabled:to-green-600 disabled:transform-none disabled:opacity-50"
                    aria-label={`Ajouter ${quantity} ${product.name} au panier`}
                  >
                    {added ? '✓ Ajouté au panier' : 'Ajouter au panier'}
                  </button>
                  <button
                    onClick={handleWhatsApp}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
                    aria-label={`Contacter via WhatsApp pour ${product.name}`}
                  >
                    📱 WhatsApp
                  </button>
                </div>
              </>
            )}

            {product.stock === 0 && (
              <div className="p-6 bg-red-50 border-2 border-red-200 rounded-xl text-center space-y-4">
                <div>
                  <p className="text-red-600 font-bold text-lg">Produit en rupture de stock</p>
                  <p className="text-red-500 text-sm mt-2">Contactez-nous pour être notifié du retour en stock</p>
                </div>
                <StockNotificationButton
                  productId={product.id}
                  productName={product.name}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Avis produits */}
      <ProductReviews productId={product.id} />
    </div>
  )
})
