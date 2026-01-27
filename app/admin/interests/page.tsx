'use client'

import { useEffect, useState, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { AdminGuard } from '@/components/AdminGuard'
import { Header } from '@/components/header'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Database } from '@/types/database.types'

type ProductView = Database['public']['Tables']['product_views']['Row'] & {
  products?: {
    name: string
  }
  profiles?: {
    full_name: string | null
  }
}

type SearchQuery = Database['public']['Tables']['search_queries']['Row'] & {
  profiles?: {
    full_name: string | null
  }
}

interface UserInterest {
  userId: string
  email: string | null
  fullName: string | null
  totalViews: number
  totalSearches: number
  lastActivity: string | null
}

function AdminInterestsPageContent() {
  const [loading, setLoading] = useState(true)
  const [usersInterests, setUsersInterests] = useState<UserInterest[]>([])
  const [recentViews, setRecentViews] = useState<ProductView[]>([])
  const [recentSearches, setRecentSearches] = useState<SearchQuery[]>([])
  const [activeTab, setActiveTab] = useState<'users' | 'views' | 'searches'>('users')

  const loadData = useCallback(async () => {
    const client = createSupabaseClient()
    try {
      setLoading(true)
      
      // Charger seulement les données nécessaires selon l'onglet actif
      if (activeTab === 'views' || activeTab === 'users') {
        // Charger les vues récentes (limité)
        const { data: views } = await client
          .from('product_views')
          .select(`
            *,
            products(name),
            profiles(full_name)
          `)
          .order('viewed_at', { ascending: false })
          .limit(30)

        setRecentViews((views || []) as ProductView[])
      }

      if (activeTab === 'searches' || activeTab === 'users') {
        // Charger les recherches récentes (limité)
        const { data: searches } = await client
          .from('search_queries')
          .select(`
            *,
            profiles(full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(30)

        setRecentSearches((searches || []) as SearchQuery[])
      }

      // Calculer les stats par utilisateur (seulement si nécessaire)
      if (activeTab === 'users') {
        const { data: allViews } = await client
          .from('product_views')
          .select('user_id, profiles(full_name)')
          .not('user_id', 'is', null)
          .limit(1000)

        const { data: allSearches } = await client
          .from('search_queries')
          .select('user_id, profiles(full_name)')
          .not('user_id', 'is', null)
          .limit(1000)

        const userStats = new Map<string, {
          userId: string
          fullName: string | null
          views: number
          searches: number
          lastActivity: string | null
        }>()

        allViews?.forEach((view: any) => {
          if (!view.user_id) return
          const stats = userStats.get(view.user_id) || {
            userId: view.user_id,
            fullName: view.profiles?.full_name || null,
            views: 0,
            searches: 0,
            lastActivity: null,
          }
          stats.views++
          userStats.set(view.user_id, stats)
        })

        allSearches?.forEach((search: any) => {
          if (!search.user_id) return
          const stats = userStats.get(search.user_id) || {
            userId: search.user_id,
            fullName: search.profiles?.full_name || null,
            views: 0,
            searches: 0,
            lastActivity: null,
          }
          stats.searches++
          userStats.set(search.user_id, stats)
        })

        // Récupérer les emails (nécessite service_role ou fonction)
        const usersList: UserInterest[] = Array.from(userStats.values()).map((stats) => ({
          userId: stats.userId,
          email: null,
          fullName: stats.fullName,
          totalViews: stats.views,
          totalSearches: stats.searches,
          lastActivity: stats.lastActivity,
        }))

        setUsersInterests(usersList)
      }
    } catch (error: any) {
      console.error('Error loading interests:', error)
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    loadData()
  }, [loadData, activeTab])

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
                Intérêts des Clients
              </h1>
              <p className="text-gray-600 text-lg">
                Analysez le comportement et les intérêts de vos clients
              </p>
            </div>
            <Link
              href="/admin"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              ← Retour Admin
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'users'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Utilisateurs ({usersInterests.length})
            </button>
            <button
              onClick={() => setActiveTab('views')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'views'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Vues récentes ({recentViews.length})
            </button>
            <button
              onClick={() => setActiveTab('searches')}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === 'searches'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Recherches ({recentSearches.length})
            </button>
          </div>
        </div>

        {/* Contenu des tabs */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-primary-500 to-primary-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">
                      Utilisateur
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">
                      Vues produits
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">
                      Recherches
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">
                      Dernière activité
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usersInterests.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        Aucun utilisateur avec activité enregistrée
                      </td>
                    </tr>
                  ) : (
                    usersInterests.map((userInterest) => (
                      <tr key={userInterest.userId} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {userInterest.fullName || 'Utilisateur anonyme'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {userInterest.email || userInterest.userId.slice(0, 8)}...
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-bold text-primary-600">
                            {userInterest.totalViews}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-bold text-blue-600">
                            {userInterest.totalSearches}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {userInterest.lastActivity
                            ? format(new Date(userInterest.lastActivity), 'PPp', { locale: fr })
                            : 'Jamais'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'views' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-primary-500 to-primary-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">
                      Utilisateur
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">
                      Produit
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentViews.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                        Aucune vue enregistrée
                      </td>
                    </tr>
                  ) : (
                    recentViews.map((view) => (
                      <tr key={view.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-gray-900">
                            {view.profiles?.full_name || 'Visiteur anonyme'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/products/${view.product_id}`}
                            className="text-primary-600 hover:text-primary-700 font-semibold hover:underline"
                          >
                            {view.products?.name || 'Produit supprimé'}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {format(new Date(view.viewed_at), 'PPp', { locale: fr })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'searches' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-primary-500 to-primary-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">
                      Utilisateur
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">
                      Recherche
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">
                      Catégorie
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">
                      Résultats
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentSearches.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        Aucune recherche enregistrée
                      </td>
                    </tr>
                  ) : (
                    recentSearches.map((search) => (
                      <tr key={search.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-gray-900">
                            {search.profiles?.full_name || 'Visiteur anonyme'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900">"{search.query}"</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {search.category_slug || 'Toutes'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-primary-600">
                            {search.results_count} résultat{search.results_count !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {format(new Date(search.created_at), 'PPp', { locale: fr })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
