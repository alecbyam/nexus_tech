'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers'
import { Header } from '@/components/header'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user])

  async function loadOrders() {
    if (!user) return

    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setOrders(data || [])
    setLoading(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-500">
            Veuillez vous connecter pour voir vos commandes
          </p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mes commandes</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500 text-xl mb-6 font-semibold">Aucune commande</p>
            <Link
              href="/catalog"
              className="inline-block bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-3 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Découvrir le catalogue
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100 card-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-black text-gray-900 text-lg mb-1">
                      Commande #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500 font-medium">
                      {format(new Date(order.created_at), 'PPpp', { locale: fr })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-2xl text-gray-900 mb-2">
                      ${(order.total_cents / 100).toFixed(2)}
                    </p>
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
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
