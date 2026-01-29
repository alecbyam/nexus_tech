import Link from 'next/link'
import Image from 'next/image'
import { memo } from 'react'
import type { Database } from '@/types/database.types'
import { WishlistButton } from '@/components/wishlist-button'
import { CompareButton } from '@/components/compare-button'
import { formatPrice } from '@/lib/utils/format-price'

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

  return (
    <Link
      href={`/products/${product.id}`}
      className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden card-hover border border-gray-100"
      style={{ animationDelay: `${index * 0.05}s` }}
      aria-label={`Voir les détails de ${product.name}`}
    >
      <div className="aspect-square relative bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {primaryImage && (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
            loading={index < 6 ? 'eager' : 'lazy'}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            quality={85}
            priority={index < 6}
          />
        )}
        {product.is_refurbished && (
          <div className="absolute top-1.5 right-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md z-10">
            Reconditionné
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              Rupture
            </span>
          </div>
        )}
        {hasDiscount && (
          <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
            -{discountPercent}%
          </div>
        )}
        <div className="absolute top-1.5 right-1.5 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <WishlistButton productId={product.id} />
          <CompareButton productId={product.id} />
        </div>
      </div>
      <div className="p-2 sm:p-3 md:p-4">
        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-500 transition-colors text-xs sm:text-sm md:text-base leading-tight">
          {product.name}
        </h3>
        <p className="text-[10px] sm:text-xs text-gray-500 mb-1.5 sm:mb-2 font-medium line-clamp-1">
          {product.categories?.name}
        </p>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
            {hasDiscount ? (
              <>
                <span className="text-sm sm:text-base md:text-lg font-black bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                  {formatPrice(product.price_cents, product.currency || 'USD')}
                </span>
                <span className="text-[10px] sm:text-xs md:text-sm text-gray-400 line-through">
                  {formatPrice(product.compare_at_price_cents!, product.currency || 'USD')}
                </span>
              </>
            ) : (
              <span className="text-sm sm:text-base md:text-lg font-black bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                {formatPrice(product.price_cents, product.currency || 'USD')}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
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
