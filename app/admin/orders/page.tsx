'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers'
import { Header } from '@/components/header'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { OrderStatus, Database } from '@/types/database.types'

type Order = Database['public']['Tables']['orders']['Row'] & {
  profiles: {
    full_name: string | null
    phone: string | null
  }
  order_items?: Array<{
    name_snapshot: string
    quantity: number
    price_cents_snapshot: number
  }>
}

interface OrderStats {
  total: number
  pending: number
  confirmed: number
  shipped: number
  delivered: number
  cancelled: number
  totalRevenue: number
}

export default function AdminOrdersPage() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0,
  })
  const supabase = createSupabaseClient()

  useEffect(() => {
    if (authLoading) return

    if (!user || !isAdmin) {
      router.push('/')
      return
    }
    loadOrders()
  }, [user, isAdmin, authLoading, router])

  useEffect(() => {
    filterOrders()
  }, [searchQuery, statusFilter, orders])

  async function loadOrders() {
    try {
      setLoading(true)
      
      // Charger les statistiques séparément en parallèle (plus rapide)
      const [totalResult, statusResult] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('status, total_cents').limit(5000), // Réduit pour performance
      ])

      const statusData = statusResult.data || []

      // Calculer les statistiques rapidement
      const orderStats: OrderStats = {
        total: totalResult.count || 0,
        pending: statusData.filter((o) => o.status === 'pending').length || 0,
        confirmed: statusData.filter((o) => o.status === 'confirmed').length || 0,
        shipped: statusData.filter((o) => o.status === 'shipped').length || 0,
        delivered: statusData.filter((o) => o.status === 'delivered').length || 0,
        cancelled: statusData.filter((o) => o.status === 'cancelled').length || 0,
        totalRevenue:
          (statusData
            .filter((o) => o.status !== 'cancelled')
            .reduce((sum, o) => sum + o.total_cents, 0) || 0) / 100,
      }
      setStats(orderStats)

      // Charger seulement les commandes récentes (limite initiale)
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles (full_name, phone),
          order_items (name_snapshot, quantity, price_cents_snapshot)
        `)
        .order('created_at', { ascending: false })
        .limit(100) // Limite initiale pour un chargement rapide

      if (error) throw error

      const ordersData = (data || []) as Order[]
      setOrders(ordersData)
      setFilteredOrders(ordersData)
    } catch (error: any) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  function filterOrders() {
    let filtered = orders

    // Filtre de recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (o) =>
          o.id.toLowerCase().includes(query) ||
          o.profiles?.full_name?.toLowerCase().includes(query) ||
          o.profiles?.phone?.toLowerCase().includes(query) ||
          o.customer_note?.toLowerCase().includes(query)
      )
    }

    // Filtre de statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter((o) => o.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }

  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    try {
      const { error } = await (supabase
        .from('orders')
        .update({ status: newStatus } as any)
        .eq('id', orderId) as any)

      if (error) throw error
      await loadOrders()
    } catch (error: any) {
      console.error('Error updating order status:', error)
      alert('Erreur lors de la mise à jour')
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
            Demandes des Clients
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            {stats.total} {stats.total === 1 ? 'commande' : 'commandes'} au total
          </p>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 text-white">
              <div className="text-2xl font-black mb-1">{stats.total}</div>
              <div className="text-xs font-semibold opacity-90">Total</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-4 text-white">
              <div className="text-2xl font-black mb-1">{stats.pending}</div>
              <div className="text-xs font-semibold opacity-90">En attente</div>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl shadow-lg p-4 text-white">
              <div className="text-2xl font-black mb-1">{stats.confirmed}</div>
              <div className="text-xs font-semibold opacity-90">Confirmées</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-4 text-white">
              <div className="text-2xl font-black mb-1">{stats.shipped}</div>
              <div className="text-xs font-semibold opacity-90">Expédiées</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 text-white">
              <div className="text-2xl font-black mb-1">{stats.delivered}</div>
              <div className="text-xs font-semibold opacity-90">Livrées</div>
            </div>
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg p-4 text-white">
              <div className="text-2xl font-black mb-1">${stats.totalRevenue.toFixed(0)}</div>
              <div className="text-xs font-semibold opacity-90">Revenus</div>
            </div>
          </div>

          {/* Filtres */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rechercher une commande
                </label>
                <input
                  type="text"
                  placeholder="ID, nom client, téléphone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Filtrer par statut
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmées</option>
                  <option value="shipped">Expédiées</option>
                  <option value="delivered">Livrées</option>
                  <option value="cancelled">Annulées</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des Commandes */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-primary-500 to-primary-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    ID Commande
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Articles
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <p className="text-gray-500">
                        {searchQuery || statusFilter !== 'all'
                          ? 'Aucune commande trouvée'
                          : 'Aucune commande pour le moment'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const itemsCount = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-black text-gray-900 font-mono">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {order.profiles?.full_name || 'Client anonyme'}
                            </div>
                            {order.profiles?.phone && (
                              <div className="text-xs text-gray-500">{order.profiles.phone}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600 font-medium">
                            {format(new Date(order.created_at), 'PP', { locale: fr })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(order.created_at), 'HH:mm', { locale: fr })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-700">
                            {itemsCount} {itemsCount === 1 ? 'article' : 'articles'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-black text-primary-600">
                            {formatPrice(order.total_cents, order.currency || 'CDF')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                            className={`text-xs font-bold rounded-full px-4 py-2 border-0 cursor-pointer transition-all ${
                              order.status === 'delivered'
                                ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-md'
                                : order.status === 'pending'
                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-md'
                                : order.status === 'confirmed' || order.status === 'shipped'
                                ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-md'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            <option value="pending">En attente</option>
                            <option value="confirmed">Confirmée</option>
                            <option value="shipped">Expédiée</option>
                            <option value="delivered">Livrée</option>
                            <option value="cancelled">Annulée</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-semibold text-sm hover:bg-primary-200 transition-all"
                      >
                        Voir détails
                      </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
