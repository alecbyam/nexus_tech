import { createSupabaseServerClient } from '@/lib/supabase/client'
import { ProductGrid } from '@/components/product-grid'
import { SearchBar } from '@/components/search-bar'
import { Header } from '@/components/header'
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

interface CatalogPageProps {
  searchParams: {
    category?: string
    search?: string
  }
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const supabase = createSupabaseServerClient()
  const { category, search } = searchParams

  let query = supabase
    .from('products')
    .select(`
      *,
      product_images(storage_path, is_primary),
      categories(name, key)
    `)
    .eq('is_active', true)

  if (category) {
    query = query.eq('categories.key', category)
  }

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data: products } = await query.order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
            Catalogue
          </h1>
          <p className="text-gray-600 mb-6 text-lg">
            Découvrez notre sélection de produits tech
          </p>
          <SearchBar initialSearch={search} initialCategory={category} />
        </div>

        <ProductGrid products={(products as Product[]) || []} />
      </main>
    </div>
  )
}
