import { createServerClient } from '@/lib/supabase/server'
import { getCategoryBySlug } from '@/lib/services/categories'
import { ProductGrid } from '@/components/product-grid'
import { SearchBar } from '@/components/search-bar'
import { Header } from '@/components/header'
import { ProductGridSkeleton } from '@/components/skeleton-loader'
import { PageHeader } from '@/components/page-header'
import { Suspense } from 'react'
import type { Database } from '@/types/database.types'

type Product = Database['public']['Tables']['products']['Row'] & {
  product_images: Array<{
    storage_path: string
    is_primary: boolean
  }>
  categories: {
    name: string
    slug: string
    id: string
  }
}

interface CatalogPageProps {
  searchParams: {
    category?: string
    search?: string
  }
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const supabase = await createServerClient()
  const { category: categorySlug, search } = searchParams

  // Si un slug de catégorie est fourni, récupérer la catégorie et ses sous-catégories
  let categoryId: string | null = null
  if (categorySlug) {
    const category = await getCategoryBySlug(categorySlug)
    if (category) {
      categoryId = category.id
    }
  }

  let query = supabase
    .from('products')
    .select(`
      *,
      product_images(storage_path, is_primary),
      categories(name, slug, id)
    `)
    .eq('is_active', true)

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data: products } = await query.order('created_at', { ascending: false })

  const breadcrumbs = categorySlug
    ? [
        { label: 'Catalogue', href: '/catalog' },
        { label: categorySlug },
      ]
    : [{ label: 'Catalogue' }]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <PageHeader
          title="Catalogue"
          subtitle="Découvrez notre sélection de produits tech"
          breadcrumbs={breadcrumbs}
        />
        
        <div className="mb-4 sm:mb-6 md:mb-8">
          <SearchBar initialSearch={search} initialCategory={categorySlug} />
        </div>
        
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid products={(products as Product[]) || []} />
        </Suspense>
      </main>
    </div>
  )
}
