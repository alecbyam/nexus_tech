'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers'
import { Header } from '@/components/header'
import { useRouter } from 'next/navigation'
import { getBrowsingHistory } from '@/lib/services/browsing-history'
import { useSessionId } from '@/lib/hooks/use-session-id'
import { ProductGrid } from '@/components/product-grid'
import { ProductGridSkeleton } from '@/components/product-skeleton'
import Link from 'next/link'
import type { Database } from '@/types/database.types'

type HistoryItem = Database['public']['Tables']['browsing_history']['Row'] & {
  products: Database['public']['Tables']['products']['Row'] & {
    product_images: Array<{
      storage_path: string
      is_primary: boolean
    }>
    categories: {
      name: string
    }
  }
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const sessionId = useSessionId()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    loadHistory()
  }, [user, sessionId, authLoading])

  async function loadHistory() {
    try {
      const items = await getBrowsingHistory(user?.id, sessionId || undefined, 20)
      setHistory(items as HistoryItem[])
    } catch (error) {
      console.error('Error loading history:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <ProductGridSkeleton count={8} />
        </main>
      </div>
    )
  }

  const products = history.map((item) => item.products).filter(Boolean)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8">
          Historique de navigation
        </h1>

        {history.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🕐</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Aucun historique
            </h2>
            <p className="text-gray-600 mb-6">
              Les produits que vous consultez apparaîtront ici
            </p>
            <Link
              href="/catalog"
              className="inline-block bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all font-bold"
            >
              Découvrir le catalogue
            </Link>
          </div>
        ) : (
          <ProductGrid products={products as any} />
        )}
      </main>
    </div>
  )
}
