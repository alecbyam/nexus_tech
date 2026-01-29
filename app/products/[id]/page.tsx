import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProductDetail } from '@/components/product-detail'
import { Header } from '@/components/header'
import { ProductDetailSkeleton } from '@/components/skeleton-loader'
import { Suspense } from 'react'
import { Breadcrumbs } from '@/components/breadcrumbs'

// Force dynamic rendering (Header uses client components)
export const dynamic = 'force-dynamic'

export default async function ProductPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createServerClient()

  const { data: product } = await supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      price_cents,
      compare_at_price_cents,
      currency,
      stock,
      is_refurbished,
      condition,
      category_id,
      product_images(storage_path, is_primary),
      categories(name, slug, id)
    `)
    .eq('id', params.id)
    .single()

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Header />
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <Suspense fallback={<ProductDetailSkeleton />}>
          <ProductDetail product={product as any} />
        </Suspense>
      </main>
    </div>
  )
}

