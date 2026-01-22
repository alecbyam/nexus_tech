import Link from 'next/link'
import Image from 'next/image'
import type { Database } from '@/types/database.types'

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

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Aucun produit trouvé</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => {
        const primaryImage = product.product_images?.find((img) => img.is_primary) 
          || product.product_images?.[0]
        const imageUrl = primaryImage
          ? `https://njgmuhrkbwdeijnbqync.supabase.co/storage/v1/object/public/product-images/${primaryImage.storage_path}`
          : '/placeholder.png'

        return (
          <Link
            key={product.id}
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
                />
              )}
              {product.is_refurbished && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  Reconditionné
                </div>
              )}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
                    Rupture de stock
                  </span>
                </div>
              )}
            </div>
            <div className="p-5">
              <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors text-lg">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 mb-3 font-medium">
                {product.categories?.name}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                  ${(product.price_cents / 100).toFixed(2)}
                </span>
                {product.stock > 0 && (
                  <span className="text-xs text-green-600 font-semibold">
                    En stock
                  </span>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

