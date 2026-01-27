'use client'

import { useEffect, useState } from 'react'
import { AdminGuard } from '@/components/AdminGuard'
import { Header } from '@/components/header'
import { formatPrice } from '@/lib/utils/format-price'
import { createSupabaseClient } from '@/lib/supabase/client'

export interface AdminStats {
  totalProducts: number
  activeProducts: number
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  totalUsers: number
  lowStockProducts: number
  outOfStockProducts: number
  recentOrders: number
  averageOrderValue: number
}

function AdminStatsPageContent() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [salesData, setSalesData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(30)
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadStats()
  }, [period])

  async function loadStats() {
    try {
      setLoading(true)
      
      // Charger les statistiques en parallèle
      const [
        totalProductsResult,
        activeProductsResult,
        totalOrdersResult,
        pendingOrdersResult,
        totalUsersResult,
        lowStockResult,
        outOfStockResult,
        recentOrdersResult,
        ordersData,
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).gt('stock', 0).lte('stock', 10),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('stock', 0),
        supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase
          .from('orders')
          .select('total_cents, status')
          .neq('status', 'cancelled')
          .limit(5000),
      ])

      const totalRevenue = ordersData.data?.reduce((sum, order) => sum + order.total_cents, 0) || 0
      const averageOrderValue =
        ordersData.data && ordersData.data.length > 0
          ? totalRevenue / ordersData.data.length / 100
          : 0

      const statsData: AdminStats = {
        totalProducts: totalProductsResult.count || 0,
        activeProducts: activeProductsResult.count || 0,
        totalOrders: totalOrdersResult.count || 0,
        pendingOrders: pendingOrdersResult.count || 0,
        totalRevenue: totalRevenue / 100,
        totalUsers: totalUsersResult.count || 0,
        lowStockProducts: lowStockResult.count || 0,
        outOfStockProducts: outOfStockResult.count || 0,
        recentOrders: recentOrdersResult.count || 0,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      }

      // Top produits vendus
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_id, quantity, name_snapshot')
        .limit(10000)

      const productSales = new Map<string, { name: string; quantity: number }>()
      orderItems?.forEach((item) => {
        if (!item.product_id) return
        const current = productSales.get(item.product_id) || {
          name: item.name_snapshot,
          quantity: 0,
        }
        productSales.set(item.product_id, {
          name: item.name_snapshot,
          quantity: current.quantity + item.quantity,
        })
      })

      const topProductsData = Array.from(productSales.entries())
        .map(([productId, data]) => ({
          productId,
          name: data.name,
          quantity: data.quantity,
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10)

      // Ventes par période
      const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString()
      const { data: orders } = await supabase
        .from('orders')
        .select('total_cents, created_at, status')
        .gte('created_at', startDate)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: true })
        .limit(5000)

      const salesByDay = new Map<string, number>()
      orders?.forEach((order) => {
        const date = new Date(order.created_at).toISOString().split('T')[0]
        const current = salesByDay.get(date) || 0
        salesByDay.set(date, current + order.total_cents / 100)
      })

      const salesData = Array.from(salesByDay.entries()).map(([date, revenue]) => ({
        date,
        revenue,
      }))

      setStats(statsData)
      setTopProducts(topProductsData)
      setSalesData(salesData)
    } catch (error: any) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
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

  if (!stats) return null

  const maxRevenue = salesData.length > 0 ? Math.max(...salesData.map((d) => d.revenue)) : 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
            Statistiques & Analytics
          </h1>
          <p className="text-gray-600 text-lg">Vue d'ensemble détaillée de votre activité</p>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="text-3xl font-black mb-2">{stats.totalProducts}</div>
            <div className="text-sm font-semibold opacity-90">Produits</div>
            <div className="text-xs opacity-75 mt-1">{stats.activeProducts} actifs</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="text-3xl font-black mb-2">{stats.totalOrders}</div>
            <div className="text-sm font-semibold opacity-90">Commandes</div>
            <div className="text-xs opacity-75 mt-1">{stats.pendingOrders} en attente</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="text-3xl font-black mb-2">
              {formatPrice(Math.round(stats.totalRevenue * 100), 'USD').replace('$', '')}
            </div>
            <div className="text-sm font-semibold opacity-90">Revenus</div>
            <div className="text-xs opacity-75 mt-1">Total</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="text-3xl font-black mb-2">{stats.totalUsers}</div>
            <div className="text-sm font-semibold opacity-90">Utilisateurs</div>
            <div className="text-xs opacity-75 mt-1">Inscrits</div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
            <div className="text-3xl font-black mb-2">{stats.pendingOrders}</div>
            <div className="text-sm font-semibold opacity-90">En attente</div>
            <div className="text-xs opacity-75 mt-1">À traiter</div>
          </div>
        </div>

        {/* Alertes stock */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">⚠️ Alertes Stock</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div>
                  <p className="font-semibold text-gray-900">Stock faible</p>
                  <p className="text-sm text-gray-600">Produits avec stock ≤ 10</p>
                </div>
                <span className="text-2xl font-black text-yellow-600">{stats.lowStockProducts}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <p className="font-semibold text-gray-900">Rupture de stock</p>
                  <p className="text-sm text-gray-600">Produits épuisés</p>
                </div>
                <span className="text-2xl font-black text-red-600">{stats.outOfStockProducts}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Performance</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Panier moyen</p>
                <p className="text-3xl font-black text-primary-600">
                  {formatPrice(Math.round(stats.averageOrderValue * 100), 'USD')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Commandes (7 derniers jours)</p>
                <p className="text-3xl font-black text-blue-600">{stats.recentOrders}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Produits les plus vendus */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">🏆 Produits les plus vendus</h3>
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value={7}>7 derniers jours</option>
              <option value={30}>30 derniers jours</option>
              <option value={90}>90 derniers jours</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                    Rang
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                    Produit
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">
                    Quantité vendue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                      Aucune vente enregistrée
                    </td>
                  </tr>
                ) : (
                  topProducts.map((product, index) => (
                    <tr key={product.productId} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {index === 0 && <span className="text-2xl">🥇</span>}
                          {index === 1 && <span className="text-2xl">🥈</span>}
                          {index === 2 && <span className="text-2xl">🥉</span>}
                          {index > 2 && (
                            <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-semibold text-gray-900">{product.name}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-lg font-black text-primary-600">
                          {product.quantity} unité{product.quantity > 1 ? 's' : ''}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Graphique des ventes */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            📈 Ventes sur {period} jours
          </h3>
          <div className="space-y-3">
            {salesData.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
            ) : (
              salesData.map((day) => (
                <div key={day.date} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-600 font-medium">
                    {new Date(day.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-10 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                      style={{
                        width: `${(day.revenue / maxRevenue) * 100}%`,
                      }}
                    >
                      <span className="text-xs font-bold text-white">
                        {formatPrice(Math.round(day.revenue * 100), 'USD')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AdminStatsPage() {
  return (
    <AdminGuard>
      <AdminStatsPageContent />
    </AdminGuard>
  )
}
