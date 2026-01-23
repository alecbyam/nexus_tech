'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers'
import { Header } from '@/components/header'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/database.types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

type Profile = Database['public']['Tables']['profiles']['Row']

interface UserStats {
  total: number
  admins: number
  regular: number
  recent: number
}

export default function UserStatsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    admins: 0,
    regular: 0,
    recent: 0,
  })
  const [admins, setAdmins] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    if (authLoading) return

    if (!user || !isAdmin) {
      router.push('/')
      return
    }

    loadStats()
  }, [user, isAdmin, authLoading, router])

  async function loadStats() {
    try {
      // Charger tous les utilisateurs
      const { data: allUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (usersError) throw usersError

      // Filtrer les admins
      const adminUsers = allUsers?.filter((u) => u.is_admin) || []

      // Calculer les statistiques
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const recentUsers = allUsers?.filter(
        (u) => new Date(u.created_at) > thirtyDaysAgo
      ).length || 0

      setStats({
        total: allUsers?.length || 0,
        admins: adminUsers.length,
        regular: (allUsers?.length || 0) - adminUsers.length,
        recent: recentUsers,
      })

      setAdmins(adminUsers)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-primary-600 hover:text-primary-700 font-semibold mb-4 inline-flex items-center"
          >
            ← Retour
          </button>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
            Statistiques Utilisateurs
          </h1>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="text-4xl font-black mb-2">{stats.total}</div>
            <div className="text-sm font-semibold opacity-90">Total Utilisateurs</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="text-4xl font-black mb-2">{stats.admins}</div>
            <div className="text-sm font-semibold opacity-90">Administrateurs</div>
          </div>
          <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="text-4xl font-black mb-2">{stats.regular}</div>
            <div className="text-sm font-semibold opacity-90">Utilisateurs Réguliers</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="text-4xl font-black mb-2">{stats.recent}</div>
            <div className="text-sm font-semibold opacity-90">Nouveaux (30j)</div>
          </div>
        </div>

        {/* Liste des Administrateurs */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Liste des Administrateurs ({admins.length})
          </h2>

          {admins.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun administrateur trouvé.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-primary-500 text-white">
                          ADMIN
                        </span>
                        <h3 className="text-lg font-bold text-gray-900">
                          {admin.full_name || 'Utilisateur sans nom'}
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-semibold">ID:</span>{' '}
                          <span className="font-mono text-xs">{admin.id.slice(0, 8)}...</span>
                        </div>
                        <div>
                          <span className="font-semibold">Téléphone:</span>{' '}
                          {admin.phone || 'Non renseigné'}
                        </div>
                        <div>
                          <span className="font-semibold">Créé le:</span>{' '}
                          {format(new Date(admin.created_at), 'PP', { locale: fr })}
                        </div>
                      </div>
                    </div>
                    <a
                      href={`/admin/users/${admin.id}`}
                      className="ml-4 px-4 py-2 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-all border border-primary-200"
                    >
                      Voir détails
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
