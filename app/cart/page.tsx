'use client'

import Link from 'next/link'
import { Header } from '@/components/header'
import { useCartStore } from '@/store/cart-store'
import { useAuth } from '@/components/providers'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { validateCoupon, useCoupon } from '@/lib/services/coupons'
import { addPointsFromOrder } from '@/lib/services/loyalty'
import { formatPrice } from '@/lib/utils/format-price'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clear, total } = useCartStore()
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponId, setCouponId] = useState<string | null>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const supabase = createSupabaseClient()

  const subtotal = total
  const discount = couponDiscount
  const finalTotal = Math.max(0, subtotal - discount)

  const handleApplyCoupon = async () => {
    if (!user || !couponCode.trim()) return

    setValidatingCoupon(true)
    try {
      const validation = await validateCoupon(
        couponCode.trim(),
        Math.round(subtotal * 100),
        user.id
      )

      if (validation.valid) {
        // discountAmount est en cents, convertir en dollars
        setCouponDiscount(validation.discountAmount / 100)
        // Récupérer l'ID du coupon
        const { data: coupon } = await supabase
          .from('coupons')
          .select('id')
          .eq('code', couponCode.toUpperCase())
          .single()
        if (coupon) {
          setCouponId(coupon.id)
        }
        alert('Code promo appliqué avec succès !')
      } else {
        alert(validation.error || 'Code promo invalide')
        setCouponCode('')
        setCouponDiscount(0)
        setCouponId(null)
      }
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la validation du code')
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleCheckout = async () => {
    if (!user) {
      router.push('/auth')
      return
    }

    if (items.length === 0) {
      alert('Votre panier est vide')
      return
    }

    setLoading(true)
    try {
      // Créer la commande
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'pending' as const,
          total_cents: Math.round(finalTotal * 100),
          currency: 'CDF',
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Utiliser le coupon si applicable
      if (couponId && couponDiscount > 0) {
        await useCoupon(couponId, user.id, order.id, Math.round(couponDiscount * 100))
      }

      // Créer les order_items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        price_cents_snapshot: Math.round(item.price * 100),
        name_snapshot: item.name,
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

      if (itemsError) throw itemsError

      // Ajouter les points de fidélité
      await addPointsFromOrder(user.id, order.id, Math.round(finalTotal * 100))

      // Vider le panier
      clear()
      setCouponCode('')
      setCouponDiscount(0)
      setCouponId(null)

      router.push(`/orders/${order.id}`)
    } catch (error: any) {
      console.error('Error creating order:', error)
      alert('Erreur lors de la création de la commande')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Votre panier est vide</h1>
            <p className="text-gray-600 mb-6">Ajoutez des produits pour commencer</p>
            <button
              onClick={() => router.push('/catalog')}
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all font-bold"
            >
              Découvrir le catalogue
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8">Panier</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Liste des articles */}
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 flex items-center gap-6"
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-primary-600 font-black text-lg">
                    {formatPrice(Math.round(item.price * 100), 'CDF')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 bg-gray-200 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 bg-gray-200 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-red-600 hover:text-red-700 font-semibold"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Résumé */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 h-fit sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Résumé</h2>

            {/* Code promo */}
            {user && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Code promo
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="ENTRER CODE"
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon || !couponCode.trim()}
                    className="bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
                  >
                    {validatingCoupon ? '...' : 'Appliquer'}
                  </button>
                </div>
                <Link
                  href="/coupons"
                  className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block"
                >
                  Voir tous les codes promo
                </Link>
              </div>
            )}

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span className="font-semibold">{formatPrice(Math.round(subtotal * 100), 'CDF')}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Réduction</span>
                  <span className="font-semibold">-{formatPrice(Math.round(couponDiscount * 100), 'CDF')}</span>
                </div>
              )}
              <div className="flex justify-between text-2xl font-black text-gray-900 pt-3 border-t border-gray-200">
                <span>Total</span>
                <span>{formatPrice(Math.round(finalTotal * 100), 'CDF')}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || !user}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-4 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? 'Traitement...' : !user ? 'Se connecter' : 'Passer la commande'}
            </button>

            {user && (
              <Link
                href="/loyalty"
                className="block text-center text-sm text-primary-600 hover:text-primary-700 mt-4"
              >
                Voir mes points de fidélité
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
