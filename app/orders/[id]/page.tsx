'use client'

// Force dynamic rendering (uses createSupabaseClient)
export const dynamic = 'force-dynamic'

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

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="p-4 bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl">
              <p className="text-sm text-gray-600 font-semibold mb-2">Date de commande</p>
              <p className="font-bold text-gray-900 text-lg">
                {format(new Date(order.created_at), 'PPpp', { locale: fr })}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl">
              <p className="text-sm text-gray-600 font-semibold mb-2">Statut</p>
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                  order.status === 'completed'
                    ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg'
                    : order.status === 'pending'
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {order.status}
              </span>
            </div>
          </div>

          {order.delivery_address && (
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl mb-4">
              <p className="text-sm text-blue-800 font-semibold mb-2">📍 Adresse de livraison</p>
              <p className="text-gray-900 font-medium">{order.delivery_address}</p>
            </div>
          )}

          {order.customer_note && (
            <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
              <p className="text-sm text-yellow-800 font-semibold mb-2">📝 Note client</p>
              <p className="text-gray-900 font-medium">{order.customer_note}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-black text-gray-900 mb-6">Articles commandés</h2>
          <div className="space-y-4 mb-6">
            {items.map((item, index) => (
              <div 
                key={item.id} 
                className="flex justify-between items-center p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div>
                  <p className="font-bold text-gray-900 text-lg mb-1">{item.name_snapshot}</p>
                  <p className="text-sm text-gray-600 font-medium">
                    {item.quantity} × ${(item.price_cents_snapshot / 100).toFixed(2)}
                  </p>
                </div>
                <p className="font-black text-xl text-gray-900">
                  ${((item.price_cents_snapshot * item.quantity) / 100).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t-2 border-gray-200 flex justify-between items-center bg-gradient-to-r from-primary-50 to-blue-50 p-6 rounded-xl">
            <span className="text-2xl font-black text-gray-900">Total</span>
            <span className="text-3xl font-black bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
              ${(order.total_cents / 100).toFixed(2)}
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}
