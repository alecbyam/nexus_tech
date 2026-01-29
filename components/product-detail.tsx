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
import { ProductTabs } from '@/components/product-tabs'
import { SimilarProducts } from '@/components/similar-products'
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
    category_id?: string
    product_images: Array<{
      storage_path: string
      is_primary: boolean
    }>
    categories: {
      name: string
      slug?: string
      id?: string
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
      toast.showToast('Ce produit n\'est pas disponible pour le moment', 'info')
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
    <div className="max-w-7xl mx-auto animate-fade-in px-3 sm:px-4">
      <Breadcrumbs items={breadcrumbs} className="mb-4 sm:mb-6" />
      
      {/* Message d'action visible */}
      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-gray-900">Détails du produit</p>
            <p className="text-sm text-gray-600">Ajoutez au panier ou commandez directement via WhatsApp</p>
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-10 bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 lg:p-12 border border-gray-100/50">
        {/* Images */}
        <div className="space-y-2 sm:space-y-4">
          <div className="group aspect-square relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500">
            {currentImage && (
              <>
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, 50vw"
                  priority
                  quality={90}
                />
                {/* Zoom indicator */}
                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                  Cliquez pour zoomer
                </div>
              </>
            )}
            {product.is_refurbished && (
              <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-white px-4 py-2 rounded-full font-black text-sm shadow-xl shadow-amber-500/50 z-10 animate-pulse">
                ✨ Reconditionné
              </div>
            )}
            {hasDiscount && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl font-black text-sm shadow-xl shadow-red-500/50 z-10 animate-bounce">
                -{discountPercent}%
              </div>
            )}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <WishlistButton productId={product.id} />
            </div>
          </div>
          
          {/* Miniatures */}
          {sortedImages.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 sm:gap-3">
              {sortedImages.map((img, index) => {
                const thumbUrl = supabaseUrl
                  ? `${supabaseUrl}/storage/v1/object/public/product-images/${img.storage_path}`
                  : '/placeholder.png'
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`group aspect-square relative rounded-xl overflow-hidden border-2 transition-all duration-300 transform hover:scale-105 ${
                      selectedImageIndex === index
                        ? 'border-blue-500 ring-4 ring-blue-200 shadow-lg shadow-blue-500/30'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <Image
                      src={thumbUrl}
                      alt={`${product.name} - Image ${index + 1}`}
                      fill
                      className={`object-cover transition-opacity duration-300 ${
                        selectedImageIndex === index ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                      }`}
                      sizes="(max-width: 768px) 25vw, 12.5vw"
                    />
                    {selectedImageIndex === index && (
                      <div className="absolute inset-0 bg-blue-500/10"></div>
                    )}
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
              <Link
                href={`/catalog?category=${product.categories?.slug || ''}`}
                className="inline-block bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 hover:text-blue-800 px-4 py-2 rounded-full text-sm font-bold mb-3 border border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md"
              >
                {product.categories?.name}
              </Link>
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
              {/* Stock masqué pour les clients - informations non affichées */}
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
                    max={Math.min(product.stock, 10)} // Limiter à 10 pour ne pas révéler le stock exact
                    size="lg"
                  />
                </FormField>

                {/* Actions rapides */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={added || product.stock === 0}
                      className="group relative flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                      aria-label={`Ajouter ${quantity} ${product.name} au panier`}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {added ? (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Ajouté au panier
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Ajouter au panier
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                    <button
                      onClick={handleWhatsApp}
                      className="group relative flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl hover:shadow-green-500/50 transform hover:scale-105 active:scale-95 overflow-hidden"
                      aria-label={`Contacter via WhatsApp pour ${product.name}`}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        Commander via WhatsApp
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                  </div>
                  
                  {/* Actions secondaires */}
                  <div className="flex items-center gap-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => router.push('/compare')}
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors text-sm font-semibold"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                      </svg>
                      Comparer
                    </button>
                    <div className="h-4 w-px bg-gray-300"></div>
                    <button
                      onClick={() => router.push('/wishlist')}
                      className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors text-sm font-semibold"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Ajouter aux favoris
                    </button>
                    <div className="h-4 w-px bg-gray-300"></div>
                    <a
                      href="#shipping"
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors text-sm font-semibold"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Infos livraison
                    </a>
                  </div>
                </div>
              </>
            )}

            {product.stock === 0 && (
              <div className="p-6 bg-orange-50 border-2 border-orange-200 rounded-xl text-center space-y-4">
                <div>
                  <p className="text-orange-700 font-bold text-lg">Produit temporairement indisponible</p>
                  <p className="text-orange-600 text-sm mt-2">Contactez-nous pour être notifié de la disponibilité</p>
                </div>
                {user && (
                  <StockNotificationButton
                    productId={product.id}
                    productName={product.name}
                  />
                )}
                {!user && (
                  <a
                    href="https://wa.me/243818510311"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Contacter via WhatsApp
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Onglets avec Description, Spécifications, Avis, Livraison */}
      <ProductTabs
        productId={product.id}
        description={product.description}
        categoryName={product.categories?.name}
        stock={product.stock}
        isRefurbished={product.is_refurbished}
        condition={product.condition}
      />

      {/* Produits similaires */}
      <SimilarProducts 
        productId={product.id}
        categoryId={product.category_id}
        limit={6}
      />
    </div>
  )
})
