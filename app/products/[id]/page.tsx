import { createSupabaseServerClient } from '@/lib/supabase/client'
import { notFound } from 'next/navigation'
import { ProductDetail } from '@/components/product-detail'
import { Header } from '@/components/header'

export default async function ProductPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createSupabaseServerClient()

  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      product_images(storage_path, is_primary),
      categories(name, key)
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

