'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { Header } from '@/components/header'
import { PageHeader } from '@/components/page-header'
import { formatPrice } from '@/lib/utils/format-price'
import Link from 'next/link'

interface Order {
  id: string
  status: string
  total_cents: number
  currency: string
  customer_name: string | null
  customer_phone: string | null
  customer_email: string | null
  created_at: string
  order_items: Array<{
    id: string
    name_snapshot: string
    price_cents_snapshot: number
    quantity: number
  }>
}

export function OrderConfirmationClient() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const supabase = createSupabaseClient()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('orders')
          .select(
            `
            *,
            order_items (*)
          `
          )
          .eq('id', orderId)
          .single()

        if (error) throw error
        setOrder(data as Order)
      } catch (error: any) {
        console.error('Error loading order:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [orderId, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
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
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <p className="text-gray-500 text-lg mb-4">Commande introuvable</p>
            <Link href="/catalog" className="text-primary-600 hover:text-primary-700 font-semibold">
              Retour au catalogue
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <PageHeader
          title="✅ Commande confirmée !"
          subtitle="Merci pour votre commande. Nous vous contacterons bientôt."
        />

        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Votre commande a été enregistrée</h2>
            <p className="text-gray-600">
              Numéro de commande: <span className="font-semibold">#{order.id.substring(0, 8)}</span>
            </p>
          </div>

          <div className="space-y-6 mb-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Détails de la commande</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Statut:</span>
                  <span className="font-semibold text-gray-900">{order.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold text-primary-600">
                    {formatPrice(order.total_cents, order.currency || 'USD')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="text-gray-900">{new Date(order.created_at).toLocaleString('fr-FR')}</span>
                </div>
              </div>
            </div>

            {order.order_items && order.order_items.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Articles commandés</h3>
                <div className="space-y-2">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-900">
                        {item.name_snapshot} x {item.quantity}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(item.price_cents_snapshot * item.quantity, order.currency || 'USD')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {order.customer_name && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Informations de contact</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nom:</span>
                    <span className="text-gray-900">{order.customer_name}</span>
                  </div>
                  {order.customer_phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Téléphone:</span>
                      <span className="text-gray-900">{order.customer_phone}</span>
                    </div>
                  )}
                  {order.customer_email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="text-gray-900">{order.customer_email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Prochaines étapes:</strong> Nous vous contacterons dans les plus brefs délais pour confirmer votre
              commande et organiser la livraison.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/catalog"
              className="flex-1 bg-primary-500 text-white px-6 py-3 rounded-xl hover:bg-primary-600 transition-colors font-semibold text-center"
            >
              Continuer mes achats
            </Link>
            <a
              href="https://wa.me/243818510311"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors font-semibold text-center"
            >
              Nous contacter sur WhatsApp
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}

