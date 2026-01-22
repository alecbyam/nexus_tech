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
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8 bg-white rounded-lg shadow-sm p-6">
        <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
          {primaryImage && (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>
          <p className="text-gray-500 mb-4">{product.categories?.name}</p>

          {product.description && (
            <p className="text-gray-700 mb-6">{product.description}</p>
          )}

          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl font-bold text-primary-500">
                ${(product.price_cents / 100).toFixed(2)}
              </span>
              {product.is_refurbished && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm font-semibold">
                  Reconditionné
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Stock: {product.stock > 0 ? `${product.stock} disponibles` : 'Rupture de stock'}
            </p>
          </div>

          <div className="space-y-4">
            {product.stock > 0 && (
              <>
                <div className="flex items-center gap-4">
                  <label className="font-semibold">Quantité:</label>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={added}
                    className="flex-1 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors font-semibold disabled:bg-green-500"
                  >
                    {added ? '✓ Ajouté au panier' : 'Ajouter au panier'}
                  </button>
                  <button
                    onClick={handleWhatsApp}
                    className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold"
                  >
                    Commander via WhatsApp
                  </button>
                </div>
              </>
            )}

            {product.stock === 0 && (
              <p className="text-red-500 font-semibold">Produit en rupture de stock</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

