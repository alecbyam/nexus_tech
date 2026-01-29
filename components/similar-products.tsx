'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { ProductGrid } from './product-grid'
import { ProductGridSkeleton } from './skeleton-loader'
import type { Database } from '@/types/database.types'

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

interface SimilarProductsProps {
  productId: string
  categoryId?: string
  limit?: number
}

export function SimilarProducts({ productId, categoryId, limit = 6 }: SimilarProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        let query = supabase
          .from('products')
          .select(`
            *,
            product_images(storage_path, is_primary),
            categories(name, slug)
          `)
          .eq('is_active', true)
          .gt('stock', 0) // Ne montrer que les produits en stock
          .neq('id', productId)
          .limit(limit)

        if (categoryId) {
          query = query.eq('category_id', categoryId)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) throw error
        setProducts((data as Product[]) || [])
      } catch (error) {
        console.error('Error fetching similar products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSimilarProducts()
  }, [productId, categoryId, limit, supabase])

  if (loading) {
    return <ProductGridSkeleton />
  }

  if (products.length === 0) {
    return null
  }

  return (
    <div className="mt-8 sm:mt-12">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
          Produits <span className="gradient-text">similaires</span>
        </h2>
        <p className="text-gray-600">Découvrez d'autres produits qui pourraient vous intéresser</p>
      </div>
      <ProductGrid products={products} />
    </div>
  )
}
