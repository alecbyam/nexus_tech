'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers'
import { Header } from '@/components/header'
import { createSupabaseClient } from '@/lib/supabase/client'
import { ProductGrid } from '@/components/product-grid'
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
  }
}

export default function ComparePage() {
  const { user } = useAuth()
  const supabase = createSupabaseClient()
  const [compareList, setCompareList] = useState<string[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Récupérer depuis localStorage
    const saved = localStorage.getItem('compare_products')
    if (saved) {
      const ids = JSON.parse(saved)
      setCompareList(ids)
      loadProducts(ids)
    } else {
      setLoading(false)
    }
  }, [])

  async function loadProducts(productIds: string[]) {
    if (productIds.length === 0) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(storage_path, is_primary),
          categories(name)
        `)
        .in('id', productIds)
        .eq('is_active', true)

      if (error) throw error
      setProducts((data || []) as Product[])
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  function removeFromCompare(productId: string) {
    const newList = compareList.filter((id) => id !== productId)
    setCompareList(newList)
    setProducts(products.filter((p) => p.id !== productId))
    localStorage.setItem('compare_products', JSON.stringify(newList))
  }

  function clearCompare() {
    setCompareList([])
    setProducts([])
    localStorage.removeItem('compare_products')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </main>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⚖️</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Aucun produit à comparer
            </h1>
            <p className="text-gray-600 mb-6">
              Ajoutez des produits à la comparaison depuis le catalogue
            </p>
            <Link
              href="/catalog"
              className="inline-block bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all font-bold"
            >
              Découvrir le catalogue
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900">
            Comparer les produits
          </h1>
          <button
            onClick={clearCompare}
            className="text-red-600 hover:text-red-700 font-semibold"
          >
            Tout effacer
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gradient-to-r from-primary-500 to-primary-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">
                    Produit
                  </th>
                  {products.map((product) => (
                    <th key={product.id} className="px-6 py-4 text-center">
                      <button
                        onClick={() => removeFromCompare(product.id)}
                        className="text-white hover:text-red-200 transition-colors"
                        title="Retirer"
                      >
                        ✕
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Images */}
                <tr>
                  <td className="px-6 py-4 font-semibold text-gray-700">Image</td>
                  {products.map((product) => {
                    const primaryImage = product.product_images?.find((img) => img.is_primary) ||
                      product.product_images?.[0]
                    const imageUrl = primaryImage && supabaseUrl
                      ? `${supabaseUrl}/storage/v1/object/public/product-images/${primaryImage.storage_path}`
                      : '/placeholder.png'
                    return (
                      <td key={product.id} className="px-6 py-4 text-center">
                        <Link href={`/products/${product.id}`}>
                          <div className="w-32 h-32 relative mx-auto rounded-lg overflow-hidden">
                            <Image
                              src={imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="128px"
                            />
                          </div>
                        </Link>
                      </td>
                    )
                  })}
                </tr>

                {/* Nom */}
                <tr>
                  <td className="px-6 py-4 font-semibold text-gray-700">Nom</td>
                  {products.map((product) => (
                    <td key={product.id} className="px-6 py-4 text-center">
                      <Link
                        href={`/products/${product.id}`}
                        className="text-primary-600 hover:text-primary-700 font-semibold"
                      >
                        {product.name}
                      </Link>
                    </td>
                  ))}
                </tr>

                {/* Catégorie */}
                <tr>
                  <td className="px-6 py-4 font-semibold text-gray-700">Catégorie</td>
                  {products.map((product) => (
                    <td key={product.id} className="px-6 py-4 text-center text-gray-600">
                      {product.categories?.name}
                    </td>
                  ))}
                </tr>

                {/* Prix */}
                <tr>
                  <td className="px-6 py-4 font-semibold text-gray-700">Prix</td>
                  {products.map((product) => {
                    const hasDiscount =
                      product.compare_at_price_cents &&
                      product.compare_at_price_cents > product.price_cents
                    return (
                      <td key={product.id} className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-2xl font-black text-primary-600">
                            ${(product.price_cents / 100).toFixed(2)}
                          </span>
                          {hasDiscount && (
                            <span className="text-sm text-gray-400 line-through">
                              ${(product.compare_at_price_cents! / 100).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>

                {/* Condition */}
                <tr>
                  <td className="px-6 py-4 font-semibold text-gray-700">Condition</td>
                  {products.map((product) => (
                    <td key={product.id} className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          product.is_refurbished
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {product.is_refurbished ? 'Reconditionné' : 'Neuf'}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Description */}
                <tr>
                  <td className="px-6 py-4 font-semibold text-gray-700">Description</td>
                  {products.map((product) => (
                    <td key={product.id} className="px-6 py-4 text-center text-sm text-gray-600 max-w-xs">
                      {product.description || 'Aucune description'}
                    </td>
                  ))}
                </tr>

                {/* Actions */}
                <tr>
                  <td className="px-6 py-4 font-semibold text-gray-700">Actions</td>
                  {products.map((product) => (
                    <td key={product.id} className="px-6 py-4 text-center">
                      <Link
                        href={`/products/${product.id}`}
                        className="inline-block bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                      >
                        Voir détails
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
