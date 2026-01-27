'use client'

// Force dynamic rendering (uses createSupabaseClient)
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers'
import { Header } from '@/components/header'
import type { Database, OrderStatus } from '@/types/database.types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

type Order = Database['public']['Tables']['orders']['Row']
type OrderItem = Database['public']['Tables']['order_items']['Row'] & {
  products?: Database['public']['Tables']['products']['Row']
}

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAdmin, loading: authLoading } = useAuth()
  const supabase = createSupabaseClient()
  const [order, setOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [customer, setCustomer] = useState<{
    full_name: string | null
    phone: string | null
    email: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const orderId = params.id as string

  useEffect(() => {
    if (authLoading) return

    if (!user || !isAdmin) {
      router.push('/')
      return
    }

    loadOrder()
  }, [user, isAdmin, authLoading, router, orderId])

  async function loadOrder() {
    try {
      // Charger la commande
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (orderError) throw orderError
      setOrder(orderData)

      // Charger les items de la commande
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*, products (*)')
        .eq('order_id', orderId)

      if (itemsError) throw itemsError
      setOrderItems(itemsData || [])

      // Charger les informations du client
      if (orderData) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('id', orderData.user_id)
          .single()

        // Note: Pour récupérer l'email, il faudrait utiliser le service_role_key
        // Pour l'instant, on utilise seulement les données du profil
        setCustomer({
          full_name: profileData?.full_name || null,
          phone: profileData?.phone || null,
          email: null, // Email nécessite service_role_key
        })
      }
    } catch (error: any) {
      console.error('Error loading order:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(newStatus: OrderStatus) {
    if (!order) return

    setUpdating(true)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error
      await loadOrder()
    } catch (error: any) {
      console.error('Error updating order:', error)
      alert('Erreur lors de la mise à jour')
    } finally {
      setUpdating(false)
    }
  }

  if (authLoading || loading) {
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
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-700 font-semibold">Commande non trouvée</p>
            <button
              onClick={() => router.push('/admin/orders')}
              className="mt-4 text-primary-600 hover:underline"
            >
              Retour à la liste
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
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-primary-600 hover:text-primary-700 font-semibold mb-4 inline-flex items-center"
          >
            ← Retour
          </button>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
            Détails de la Commande
          </h1>
          <p className="text-gray-600">ID: #{order.id.slice(0, 8).toUpperCase()}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Informations Client */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informations Client</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-gray-700">Nom</label>
                <p className="text-gray-900 font-medium">
                  {customer?.full_name || 'Non renseigné'}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <p className="text-gray-900 font-medium">{customer?.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Téléphone</label>
                <p className="text-gray-900 font-medium">{customer?.phone || 'Non renseigné'}</p>
              </div>
            </div>
          </div>

          {/* Informations Commande */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informations Commande</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-gray-700">Date</label>
                <p className="text-gray-900 font-medium">
                  {format(new Date(order.created_at), 'PPpp', { locale: fr })}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Statut</label>
                <div className="mt-1">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                    disabled={updating}
                    className={`text-sm font-bold rounded-full px-4 py-2 border-0 cursor-pointer transition-all ${
                      order.status === 'delivered'
                        ? 'bg-gradient-to-r from-green-400 to-green-500 text-white'
                        : order.status === 'pending'
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white'
                        : order.status === 'confirmed' || order.status === 'shipped'
                        ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmée</option>
                    <option value="shipped">Expédiée</option>
                    <option value="delivered">Livrée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Total</label>
                <p className="text-2xl font-black text-primary-600">
                  ${(order.total_cents / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Adresse de livraison */}
          {order.delivery_address && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📍 Adresse de Livraison</h2>
              <p className="text-gray-700 font-medium">{order.delivery_address}</p>
            </div>
          )}

          {/* Note Client */}
          {order.customer_note && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📝 Note du Client</h2>
              <p className="text-gray-700">{order.customer_note}</p>
            </div>
          )}
        </div>

        {/* Articles de la Commande */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Articles ({orderItems.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                    Produit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                    Prix unitaire
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                    Quantité
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">
                    Sous-total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orderItems.map((item) => {
                  const subtotal = (item.price_cents_snapshot * item.quantity) / 100
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-gray-900">{item.name_snapshot}</div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-700">
                          ${(item.price_cents_snapshot / 100).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-gray-700">{item.quantity}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-bold text-gray-900">${subtotal.toFixed(2)}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-right font-bold text-gray-900">
                    Total:
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-xl font-black text-primary-600">
                      ${(order.total_cents / 100).toFixed(2)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
