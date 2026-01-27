'use client'

// Force dynamic rendering (uses createSupabaseClient)
export const dynamic = 'force-dynamic'

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
import { createMobileMoneyPayment } from '@/lib/services/mobile-money'
import { PaymentMethodSelector, type PaymentMethod } from '@/components/payment-method-selector'
import { openWhatsAppOrder } from '@/lib/utils/whatsapp-order'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clear, total } = useCartStore()
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponId, setCouponId] = useState<string | null>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
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

    // Validation de la méthode de paiement
    if (!paymentMethod) {
      alert('Veuillez sélectionner une méthode de paiement')
      return
    }

    // Validation du numéro de téléphone pour mobile money
    if (['mpesa', 'orange_money', 'airtel_money'].includes(paymentMethod)) {
      if (!phoneNumber.trim()) {
        alert('Veuillez entrer votre numéro de téléphone')
        return
      }
      // Validation basique du format
      const phoneRegex = /^(\+?243|0)?[0-9]{9}$/
      const cleanedPhone = phoneNumber.replace(/\s+/g, '')
      if (!phoneRegex.test(cleanedPhone)) {
        alert('Format de numéro de téléphone invalide. Exemple: +243 900 000 000')
        return
      }
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
          currency: 'USD',
          delivery_address: deliveryAddress.trim() || null,
          payment_method: paymentMethod,
          customer_note: deliveryAddress.trim() ? `Adresse de livraison: ${deliveryAddress.trim()}` : null,
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

      // Créer le paiement
      if (paymentMethod !== 'cash') {
        // Pour mobile money, créer le paiement
        if (['mpesa', 'orange_money', 'airtel_money'].includes(paymentMethod)) {
          const paymentResult = await createMobileMoneyPayment({
            orderId: order.id,
            userId: user.id,
            amountCents: Math.round(finalTotal * 100),
            currency: 'USD',
            paymentMethod: paymentMethod,
            phoneNumber: phoneNumber.replace(/\s+/g, ''),
          })

          if (!paymentResult.success) {
            // Supprimer la commande si le paiement échoue
            await supabase.from('orders').delete().eq('id', order.id)
            alert(paymentResult.error || 'Erreur lors du paiement. Veuillez réessayer.')
            setLoading(false)
            return
          }

          // Afficher le message de confirmation
          alert(
            paymentResult.message ||
              'Paiement initié avec succès. Veuillez confirmer sur votre téléphone.'
          )
        }
        // Pour carte bancaire (à implémenter plus tard)
      } else {
        // Pour paiement en espèces, pas besoin de créer de paiement immédiatement
        // Le paiement sera enregistré à la livraison
      }

      // Ajouter les points de fidélité
      await addPointsFromOrder(user.id, order.id, Math.round(finalTotal * 100))

      // Vider le panier
      clear()
      setCouponCode('')
      setCouponDiscount(0)
      setCouponId(null)
      setDeliveryAddress('')

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2 animate-fade-in">
          🛒 Panier
        </h1>
        <p className="text-gray-600 mb-8">Vérifiez vos articles avant de commander</p>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Liste des articles */}
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 flex items-center gap-6 hover:shadow-xl transition-all duration-300 card-hover"
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-primary-600 font-black text-lg">
                    {formatPrice(Math.round(item.price * 100), 'USD')}
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
          <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100 h-fit sticky top-24 backdrop-blur-sm">
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

            {/* Méthode de paiement */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <PaymentMethodSelector
                selectedMethod={paymentMethod}
                onSelectMethod={setPaymentMethod}
                phoneNumber={phoneNumber}
                onPhoneNumberChange={setPhoneNumber}
                showPhoneInput={true}
              />
            </div>

            {/* Adresse de livraison */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <label htmlFor="deliveryAddress" className="block text-sm font-semibold text-gray-700 mb-2">
                📍 Adresse de livraison <span className="text-gray-500 text-xs font-normal">(optionnel)</span>
              </label>
              <textarea
                id="deliveryAddress"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Ex: Avenue X, Quartier Y, Commune Z, Ville"
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Indiquez votre adresse complète pour faciliter la livraison
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span className="font-semibold">{formatPrice(Math.round(subtotal * 100), 'USD')}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Réduction</span>
                  <span className="font-semibold">-{formatPrice(Math.round(couponDiscount * 100), 'USD')}</span>
                </div>
              )}
              <div className="flex justify-between text-2xl font-black text-gray-900 pt-3 border-t border-gray-200">
                <span>Total</span>
                <span>{formatPrice(Math.round(finalTotal * 100), 'USD')}</span>
              </div>
            </div>

            {/* Bouton Commander via WhatsApp */}
            <button
              onClick={() => {
                const profile = user ? {
                  full_name: user.user_metadata?.full_name || '',
                  phone: user.user_metadata?.phone || phoneNumber || '',
                  email: user.email || '',
                } : null

                openWhatsAppOrder({
                  items: items.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    imageUrl: item.imageUrl,
                  })),
                  subtotal,
                  discount: couponDiscount,
                  total: finalTotal,
                  currency: 'USD',
                  deliveryAddress: deliveryAddress.trim() || undefined,
                  customerName: profile?.full_name || undefined,
                  customerPhone: profile?.phone || phoneNumber || undefined,
                  customerEmail: profile?.email || undefined,
                  paymentMethod: paymentMethod || undefined,
                })
              }}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center gap-2 mb-3"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Commander via WhatsApp
            </button>

            {/* Séparateur */}
            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs text-gray-500 font-semibold">OU</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Bouton Checkout classique */}
            <button
              onClick={handleCheckout}
              disabled={loading || !user || !paymentMethod}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-4 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              {loading
                ? 'Traitement...'
                : !user
                ? 'Se connecter'
                : !paymentMethod
                ? 'Sélectionner un paiement'
                : 'Passer la commande'}
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
