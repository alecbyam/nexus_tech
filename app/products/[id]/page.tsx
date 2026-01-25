import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProductDetail } from '@/components/product-detail'
import { Header } from '@/components/header'

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
      product_images(storage_path, is_primary),
      categories(name, slug)
    `)
    .eq('id', params.id)
    .single()

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <ProductDetail product={product as any} />
      </main>
    </div>
  )
}

