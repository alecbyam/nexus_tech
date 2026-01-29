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
import { useToast } from '@/components/toast'
import { EmptyCart } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import { FormField, Input, Textarea, Select } from '@/components/form-field'
import { InfoCard } from '@/components/info-card'
import { QuantitySelector } from '@/components/quantity-selector'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clear, total } = useCartStore()
  const { user } = useAuth()
  const router = useRouter()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponId, setCouponId] = useState<string | null>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const supabase = createSupabaseClient()
  
  // Get session ID
  const getSessionId = () => {
    if (typeof window === 'undefined') return null
    let sessionId = localStorage.getItem('session_id')
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      localStorage.setItem('session_id', sessionId)
    }
    return sessionId
  }
  const [sessionId] = useState<string | null>(() => getSessionId())

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
        toast.showToast('Code promo appliqué avec succès !', 'success')
      } else {
        toast.showToast(validation.error || 'Code promo invalide', 'error')
        setCouponCode('')
        setCouponDiscount(0)
        setCouponId(null)
      }
    } catch (error: any) {
      toast.showToast(error.message || 'Erreur lors de la validation du code', 'error')
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.showToast('Votre panier est vide', 'warning')
      return
    }

    // Validation de la méthode de paiement
    if (!paymentMethod) {
      toast.showToast('Veuillez sélectionner une méthode de paiement', 'warning')
      return
    }

    // Validation des informations client si pas connecté
    if (!user) {
      if (!customerName.trim()) {
        toast.showToast('Veuillez entrer votre nom', 'warning')
        return
      }
      if (!phoneNumber.trim()) {
        toast.showToast('Veuillez entrer votre numéro de téléphone', 'warning')
        return
      }
    }

    // Validation du numéro de téléphone pour mobile money
    if (['mpesa', 'orange_money', 'airtel_money'].includes(paymentMethod)) {
      const phone = phoneNumber.trim()
      if (!phone) {
        toast.showToast('Veuillez entrer votre numéro de téléphone', 'warning')
        return
      }
      // Validation basique du format
      const phoneRegex = /^(\+?243|0)?[0-9]{9}$/
      const cleanedPhone = phone.replace(/\s+/g, '')
      if (!phoneRegex.test(cleanedPhone)) {
        toast.showToast('Format de numéro de téléphone invalide. Exemple: +243 900 000 000', 'error')
        return
      }
    }

    setLoading(true)
    try {
      // Créer la commande via l'API
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          totalCents: Math.round(finalTotal * 100),
          currency: 'USD',
          deliveryAddress: deliveryAddress.trim() || null,
          paymentMethod: paymentMethod,
          customerName: user ? null : customerName.trim() || null,
          customerEmail: user ? null : customerEmail.trim() || null,
          customerPhone: user ? null : (phoneNumber.trim() || null),
          sessionId: sessionId || null,
          userId: user?.id || null,
          couponId: couponId || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de la création de la commande')
      }

      const { order } = await response.json()

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
            toast.showToast(paymentResult.error || 'Erreur lors du paiement. Veuillez réessayer.', 'error')
            setLoading(false)
            return
          }

          // Afficher le message de confirmation
          toast.showToast(
            paymentResult.message ||
              'Paiement initié avec succès. Veuillez confirmer sur votre téléphone.',
            'success'
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
      setCustomerName('')
      setCustomerEmail('')
      setPhoneNumber('')

      toast.showToast('Commande créée avec succès ! Vous recevrez un email de confirmation.', 'success')
      
      // Rediriger vers une page de confirmation
      if (user) {
        router.push(`/orders/${order.id}`)
      } else {
        router.push(`/order-confirmation?orderId=${order.id}`)
      }
    } catch (error: any) {
      console.error('Error creating order:', error)
      toast.showToast('Erreur lors de la création de la commande', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <EmptyCart
            action={
              <button
                onClick={() => router.push('/catalog')}
                className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Découvrir le catalogue
              </button>
            }
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-white">
      <Header />
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <PageHeader
          title="🛒 Panier"
          subtitle="Vérifiez vos articles avant de commander"
          breadcrumbs={[{ label: 'Panier' }]}
        />

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Liste des articles */}
          <div className="md:col-span-2 space-y-3 sm:space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 card-hover"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 line-clamp-2 text-sm sm:text-base">{item.name}</h3>
                    <p className="text-primary-600 font-black text-base sm:text-lg mb-2 sm:mb-3">
                      {formatPrice(Math.round(item.price * 100), 'USD')}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Sous-total: {formatPrice(Math.round(item.price * item.quantity * 100), 'USD')}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                    <QuantitySelector
                      value={item.quantity}
                      onChange={(newQuantity) => updateQuantity(item.productId, newQuantity)}
                      min={1}
                      size="md"
                    />
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-red-600 hover:text-red-700 font-semibold text-sm px-3 py-2 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label={`Supprimer ${item.name} du panier`}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Résumé */}
          <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 border border-gray-100 h-fit md:sticky md:top-24 backdrop-blur-sm">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
              <span>📋</span>
              Résumé de la commande
            </h2>

            {/* Code promo */}
            {user && (
              <FormField
                label="Code promo"
                hint="Entrez un code promo pour bénéficier d'une réduction"
                className="mb-6 pb-6 border-b border-gray-200"
              >
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="ENTRER CODE"
                    className="flex-1"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon || !couponCode.trim()}
                    className="bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 whitespace-nowrap"
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
              </FormField>
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
              
              {paymentMethod === 'cash' && (
                <InfoCard
                  icon="💵"
                  title="Paiement en espèces"
                  description="Vous paierez en espèces lors de la livraison. Le livreur vous contactera pour confirmer l'adresse et le montant exact."
                  variant="info"
                  className="mt-4"
                />
              )}
            </div>

            {/* Adresse de livraison */}
            <FormField
              label="📍 Adresse de livraison"
              htmlFor="deliveryAddress"
              hint="Indiquez votre adresse complète pour faciliter la livraison"
              className="mb-6 pb-6 border-b border-gray-200"
            >
              <Textarea
                id="deliveryAddress"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Ex: Avenue X, Quartier Y, Commune Z, Ville"
                rows={3}
              />
            </FormField>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Sous-total ({items.length} {items.length > 1 ? 'articles' : 'article'})</span>
                <span className="font-semibold text-gray-900">{formatPrice(Math.round(subtotal * 100), 'USD')}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between items-center py-2 bg-green-50 rounded-lg px-3">
                  <span className="text-green-700 font-medium">Réduction</span>
                  <span className="font-bold text-green-700">-{formatPrice(Math.round(couponDiscount * 100), 'USD')}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-2xl font-black text-gray-900 pt-4 border-t-2 border-gray-200 mt-4">
                <span>Total</span>
                <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                  {formatPrice(Math.round(finalTotal * 100), 'USD')}
                </span>
              </div>
            </div>

            {/* Bouton Commander via WhatsApp */}
            <button
              onClick={() => {
                const customerNameValue = user 
                  ? (user.user_metadata?.full_name || '')
                  : customerName.trim()
                const customerPhoneValue = user
                  ? (user.user_metadata?.phone || phoneNumber.trim())
                  : phoneNumber.trim()
                const customerEmailValue = user
                  ? (user.email || '')
                  : customerEmail.trim()

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
                  customerName: customerNameValue || undefined,
                  customerPhone: customerPhoneValue || undefined,
                  customerEmail: customerEmailValue || undefined,
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
