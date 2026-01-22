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
          <div className="text-center py-16 animate-fade-in">
            <div className="text-7xl mb-6">🛒</div>
            <p className="text-gray-500 text-xl mb-6 font-semibold">Votre panier est vide</p>
            <a
              href="/catalog"
              className="inline-block bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-3 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Découvrir le catalogue
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
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
            Panier
          </h1>
          <p className="text-gray-600 text-lg">
            {items.length} {items.length === 1 ? 'article' : 'articles'} dans votre panier
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="bg-white rounded-2xl shadow-lg p-6 flex gap-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-32 h-32 object-cover rounded-xl shadow-md"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{item.name}</h3>
                  <p className="text-primary-600 font-semibold text-lg mb-4">${item.price.toFixed(2)}</p>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.productId, parseInt(e.target.value) || 1)
                      }
                      className="w-24 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-semibold text-center"
                    />
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-red-500 hover:text-red-700 font-semibold hover:underline transition-all"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-2xl text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-white to-primary-50 rounded-2xl shadow-xl p-6 h-fit border border-primary-100 sticky top-24">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Résumé</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span className="font-semibold">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-2xl font-black text-gray-900 pt-4 border-t-2 border-gray-200">
                <span>Total</span>
                <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-4 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? '⏳ Traitement...' : '✅ Passer la commande'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
