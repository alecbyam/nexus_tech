'use client'

import { Header } from '@/components/header'
import { useCartStore } from '@/store/cart-store'
import { useAuth } from '@/components/providers'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clear, total } = useCartStore()
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createSupabaseClient()

  const handleCheckout = async () => {
    if (!user) {
      router.push('/auth')
      return
    }

    setLoading(true)
    try {
      // Créer la commande
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'pending',
          total_cents: Math.round(total * 100),
          currency: 'USD',
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Créer les order_items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        price_cents_snapshot: Math.round(item.price * 100),
        name_snapshot: item.name,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      clear()
      router.push(`/orders/${order.id}`)
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Erreur lors de la commande')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Votre panier est vide</p>
            <a
              href="/catalog"
              className="text-primary-500 hover:underline font-semibold"
            >
              Voir le catalogue
            </a>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Panier</h1>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="bg-white rounded-lg shadow-sm p-6 flex gap-4"
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-gray-500">${item.price.toFixed(2)}</p>
                  <div className="flex items-center gap-4 mt-4">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.productId, parseInt(e.target.value) || 1)
                      }
                      className="w-20 px-2 py-1 border border-gray-300 rounded"
                    />
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Résumé</h2>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-semibold">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-4 border-t">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors font-semibold disabled:opacity-50"
            >
              {loading ? 'Traitement...' : 'Passer la commande'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
