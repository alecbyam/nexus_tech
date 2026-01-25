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
    key: string
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
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden card-hover border border-gray-100"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="aspect-square relative bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {primaryImage && (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading={index < 8 ? 'eager' : 'lazy'}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
        )}
        {product.is_refurbished && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
            Reconditionné
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
              Rupture de stock
            </span>
          </div>
        )}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
            -{discountPercent}%
          </div>
        )}
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          <WishlistButton productId={product.id} />
          <CompareButton productId={product.id} />
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors text-lg">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mb-3 font-medium">
          {product.categories?.name}
        </p>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            {hasDiscount ? (
              <>
                <span className="text-2xl font-black bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                  {formatPrice(product.price_cents, product.currency || 'USD')}
                </span>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.compare_at_price_cents!, product.currency || 'USD')}
                </span>
              </>
            ) : (
              <span className="text-2xl font-black bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                {formatPrice(product.price_cents, product.currency || 'CDF')}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
})

ProductCard.displayName = 'ProductCard'

export const ProductGrid = memo(({ products }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Aucun produit trouvé</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  )
})

ProductGrid.displayName = 'ProductGrid'
