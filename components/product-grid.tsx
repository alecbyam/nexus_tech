'use client'

// Link removed - using window.location.href for navigation to avoid onClick issues
import Image from 'next/image'
import { memo } from 'react'
import type { Database } from '@/types/database.types'
import { WishlistButton } from '@/components/wishlist-button'
import { CompareButton } from '@/components/compare-button'
import { formatPrice } from '@/lib/utils/format-price'
import { useCartStore } from '@/store/cart-store'
import { useToast } from '@/components/toast'

type Product = Database['public']['Tables']['products']['Row'] & {
  product_images: Array<{
    storage_path: string
    is_primary: boolean
  }>
  categories: {
    name: string
    slug: string
  }
}

interface ProductGridProps {
  products: Product[]
}

// Composant ProductCard mémorisé pour éviter les re-renders inutiles
const ProductCard = memo(({ product, index }: { product: Product; index: number }) => {
  const addItem = useCartStore((state) => state.addItem)
  const toast = useToast()
  
  const primaryImage = product.product_images?.find((img) => img.is_primary) 
    || product.product_images?.[0]
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const imageUrl = primaryImage && supabaseUrl
    ? `${supabaseUrl}/storage/v1/object/public/product-images/${primaryImage.storage_path}`
    : '/placeholder.png'

  const hasDiscount = product.compare_at_price_cents && 
    product.compare_at_price_cents > product.price_cents
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price_cents! - product.price_cents) / product.compare_at_price_cents!) * 100)
    : 0

  const handleQuickAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Vérification silencieuse du stock (sans afficher le message aux clients)
    if (product.stock === 0) {
      toast?.showToast('Ce produit n\'est pas disponible pour le moment', 'info')
      return
    }
    
    if (addItem) {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price_cents / 100,
        imageUrl,
      })
      
      toast?.showToast('Article ajouté au panier', 'success')
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Si le clic vient d'un bouton ou d'un lien, ne pas naviguer
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('a')) {
      return
    }
    window.location.href = `/products/${product.id}`
  }

  return (
    <div 
      className="group relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden product-card-hover border border-gray-100/50 animate-slide-up cursor-pointer"
      style={{ animationDelay: `${index * 0.03}s` }}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          window.location.href = `/products/${product.id}`
        }
      }}
      aria-label={`Voir les détails de ${product.name}`}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-500 z-0"></div>
      
      <div className="aspect-square relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden group-hover:from-gray-100 group-hover:to-gray-50 transition-all duration-500">
        {primaryImage && (
          <>
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
              loading={index < 6 ? 'eager' : 'lazy'}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              quality={85}
              priority={index < 6}
              style={{ willChange: 'transform' }}
            />
            {/* Shine effect on hover - optimisé */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" style={{ willChange: 'transform' }}></div>
          </>
        )}
        {product.is_refurbished && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-amber-500/50 z-10 animate-pulse">
            ✨ Reconditionné
          </div>
        )}
        {/* Stock masqué pour les clients - les produits en rupture ne sont pas affichés dans le catalogue */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-red-500/50 z-10 animate-bounce">
            -{discountPercent}%
          </div>
        )}
        <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <WishlistButton productId={product.id} />
          <CompareButton productId={product.id} />
        </div>
      </div>
      <div className="p-3 sm:p-4 md:p-5 bg-white/95 backdrop-blur-sm relative z-10">
        <h3 className="font-black text-gray-900 mb-1.5 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300 text-xs sm:text-sm md:text-base leading-tight">
          {product.name}
        </h3>
        <p className="text-[10px] sm:text-xs text-gray-500 mb-2 sm:mb-3 font-semibold line-clamp-1 group-hover:text-gray-700 transition-colors">
          {product.categories?.name}
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            {hasDiscount ? (
              <>
                <span className="text-base sm:text-lg md:text-xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {formatPrice(product.price_cents, product.currency || 'USD')}
                </span>
                <span className="text-xs sm:text-sm text-gray-400 line-through font-medium">
                  {formatPrice(product.compare_at_price_cents!, product.currency || 'USD')}
                </span>
              </>
            ) : (
              <span className="text-base sm:text-lg md:text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {formatPrice(product.price_cents, product.currency || 'USD')}
              </span>
            )}
          </div>
          
          {/* Actions rapides - Toujours visibles */}
          <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
            <a
              href={`/products/${product.id}`}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-center no-underline"
            >
              Voir détails
            </a>
            <button
              onClick={handleQuickAddToCart}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Ajouter au panier"
              disabled={product.stock === 0}
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Panier
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

ProductCard.displayName = 'ProductCard'

import { EmptyProducts } from '@/components/empty-state'

export const ProductGrid = memo(({ products }: ProductGridProps) => {
  if (products.length === 0) {
    return <EmptyProducts />
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  )
})

ProductGrid.displayName = 'ProductGrid'
