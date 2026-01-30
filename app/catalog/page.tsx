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
  let categoryIds: string[] = []
  if (categorySlug) {
    // Si on cherche "phones", chercher aussi dans smartphones et telephones
    if (categorySlug === 'phones') {
      const searchSlugs = ['phones', 'smartphones', 'telephones']
      for (const slug of searchSlugs) {
        const category = await getCategoryBySlug(slug)
        if (category) {
          categoryIds.push(category.id)
        }
      }
      // Si on a trouvé des catégories, récupérer aussi leurs sous-catégories
      if (categoryIds.length > 0) {
        const { data: subcategories } = await supabase
          .from('categories')
          .select('id')
          .in('parent_id', categoryIds)
          .eq('is_active', true)
        if (subcategories) {
          categoryIds.push(...subcategories.map(c => c.id))
        }
      }
    } else {
      const category = await getCategoryBySlug(categorySlug)
      if (category) {
        categoryIds.push(category.id)
        // Récupérer aussi les sous-catégories
        const { data: subcategories } = await supabase
          .from('categories')
          .select('id')
          .eq('parent_id', category.id)
          .eq('is_active', true)
        if (subcategories) {
          categoryIds.push(...subcategories.map(c => c.id))
        }
      }
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
    .gt('stock', 0) // Ne montrer que les produits en stock aux clients

  if (categoryIds.length > 0) {
    query = query.in('category_id', categoryIds)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Header />
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <PageHeader
          title="Catalogue"
          subtitle="Découvrez notre sélection de produits tech"
          breadcrumbs={breadcrumbs}
        />
        
        <div className="mb-4 sm:mb-6 md:mb-8 animate-slide-up">
          <SearchBar initialSearch={search} initialCategory={categorySlug} />
        </div>
        
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid products={(products as Product[]) || []} />
        </Suspense>
      </main>
    </div>
  )
}
