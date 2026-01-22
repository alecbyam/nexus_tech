'use client'

import Image from 'next/image'
import { useCartStore } from '@/store/cart-store'
import { useState } from 'react'
import Link from 'next/link'

interface ProductDetailProps {
  product: {
    id: string
    name: string
    description: string | null
    price_cents: number
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

export function ProductDetail({ product }: ProductDetailProps) {
  const addItem = useCartStore((state) => state.addItem)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const primaryImage = product.product_images?.find((img) => img.is_primary) 
    || product.product_images?.[0]
  const imageUrl = primaryImage
    ? `https://njgmuhrkbwdeijnbqync.supabase.co/storage/v1/object/public/product-images/${primaryImage.storage_path}`
    : '/placeholder.png'

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price_cents / 100,
      imageUrl,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Bonjour NEXUS TECH, je veux commander: ${product.name} (prix: $${(product.price_cents / 100).toFixed(2)}).`
    )
    const phone = '243818510311'
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="grid md:grid-cols-2 gap-10 bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
        <div className="aspect-square relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-lg">
          {primaryImage && (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          )}
          {product.is_refurbished && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
              Reconditionné
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <span className="inline-block bg-primary-50 text-primary-600 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                {product.categories?.name}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">
              {product.name}
            </h1>

            {product.description && (
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">{product.description}</p>
            )}

            <div className="mb-8 p-6 bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl border border-primary-100">
              <div className="flex items-baseline gap-4 mb-3">
                <span className="text-5xl font-black bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                  ${(product.price_cents / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {product.stock > 0 ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-green-700 font-semibold">
                      {product.stock} en stock
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <p className="text-red-600 font-semibold">Rupture de stock</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {product.stock > 0 && (
              <>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <label className="font-bold text-gray-900">Quantité:</label>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    className="w-24 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-semibold text-center"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={added}
                    className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-4 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:from-green-500 disabled:to-green-600 disabled:transform-none"
                  >
                    {added ? '✓ Ajouté au panier' : 'Ajouter au panier'}
                  </button>
                  <button
                    onClick={handleWhatsApp}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
                  >
                    📱 WhatsApp
                  </button>
                </div>
              </>
            )}

            {product.stock === 0 && (
              <div className="p-6 bg-red-50 border-2 border-red-200 rounded-xl text-center">
                <p className="text-red-600 font-bold text-lg">Produit en rupture de stock</p>
                <p className="text-red-500 text-sm mt-2">Contactez-nous pour être notifié du retour en stock</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

