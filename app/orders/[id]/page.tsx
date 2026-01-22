'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers'
import { Header } from '@/components/header'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const [order, setOrder] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    if (user) {
      loadOrder()
    }
  }, [user, params.id])

  async function loadOrder() {
    const { data: orderData } = await supabase
      .from('orders')
      .select('*')
      .eq('id', params.id)
      .single()

    if (orderData) {
      setOrder(orderData)

      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', params.id)

      setItems(itemsData || [])
    }
    setLoading(false)
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

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-500">Commande introuvable</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Commande #{order.id.slice(0, 8)}
        </h1>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-semibold">
                {format(new Date(order.created_at), 'PPpp', { locale: fr })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Statut</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm ${
                  order.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : order.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {order.status}
              </span>
            </div>
          </div>

          {order.customer_note && (
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-1">Note</p>
              <p className="text-gray-900">{order.customer_note}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Articles</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between py-4 border-b last:border-0">
                <div>
                  <p className="font-semibold text-gray-900">{item.name_snapshot}</p>
                  <p className="text-sm text-gray-500">
                    Quantité: {item.quantity} × ${(item.price_cents_snapshot / 100).toFixed(2)}
                  </p>
                </div>
                <p className="font-bold text-gray-900">
                  ${((item.price_cents_snapshot * item.quantity) / 100).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t flex justify-between text-xl font-bold">
            <span>Total</span>
            <span>${(order.total_cents / 100).toFixed(2)}</span>
          </div>
        </div>
      </main>
    </div>
  )
}
