'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers'
import { Header } from '@/components/header'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils/format-price'

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

export default function AdminStatsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [salesData, setSalesData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(30)

  useEffect(() => {
    if (authLoading) return

    if (!user || !isAdmin) {
      router.push('/')
      return
    }

    loadStats()
  }, [user, isAdmin, authLoading, router, period])

  async function loadStats() {
    try {
      const [statsData, topProductsData, salesData] = await Promise.all([
        getAdminStats(),
        getTopSellingProducts(10),
        getSalesByPeriod(period),
      ])
      setStats(statsData)
      setTopProducts(topProductsData)
      setSalesData(salesData)
    } catch (error: any) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
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

  if (!stats) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
            Statistiques
          </h1>
          <p className="text-gray-600 text-lg">Vue d'ensemble de votre activité</p>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="text-3xl font-black mb-2">{stats.totalProducts}</div>
            <div className="text-sm font-semibold opacity-90">Produits</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="text-3xl font-black mb-2">{stats.totalOrders}</div>
            <div className="text-sm font-semibold opacity-90">Commandes</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="text-3xl font-black mb-2">${stats.totalRevenue.toFixed(0)}</div>
            <div className="text-sm font-semibold opacity-90">Revenus</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="text-3xl font-black mb-2">{stats.totalUsers}</div>
            <div className="text-sm font-semibold opacity-90">Utilisateurs</div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
            <div className="text-3xl font-black mb-2">{stats.pendingOrders}</div>
            <div className="text-sm font-semibold opacity-90">En attente</div>
          </div>
        </div>

        {/* Alertes stock */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Alertes Stock</h3>
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
            <h3 className="text-xl font-bold text-gray-900 mb-4">Performance</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Panier moyen</p>
                <p className="text-3xl font-black text-primary-600">
                  {formatPrice(Math.round(stats.averageOrderValue * 100), 'CDF')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Commandes (7 jours)</p>
                <p className="text-3xl font-black text-blue-600">{stats.recentOrders}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Produits les plus vendus */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Produits les plus vendus</h3>
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg"
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
                    <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                      Aucune vente enregistrée
                    </td>
                  </tr>
                ) : (
                  topProducts.map((product, index) => (
                    <tr key={product.productId} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                          <span className="font-semibold text-gray-900">{product.name}</span>
                        </div>
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

        {/* Graphique des ventes (simplifié) */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Ventes sur {period} jours
          </h3>
          <div className="space-y-2">
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
                  <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-full rounded-full flex items-center justify-end pr-2"
                      style={{
                        width: `${
                          (day.revenue / Math.max(...salesData.map((d) => d.revenue))) * 100
                        }%`,
                      }}
                    >
                      <span className="text-xs font-bold text-white">
                        ${day.revenue.toFixed(0)}
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
