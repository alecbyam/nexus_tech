'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { AdminGuard } from '@/components/AdminGuard'
import { Header } from '@/components/header'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/database.types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

type Profile = Database['public']['Tables']['profiles']['Row']

function AdminUsersPageContent() {
  const router = useRouter()
  const [users, setUsers] = useState<Profile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    staff: 0,
    tech: 0,
    regular: 0,
  })
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      setLoading(true)
      
      // Charger les statistiques séparément (plus rapide)
      const { count: totalCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      const { count: adminCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin')

      const { count: staffCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'staff')

      const { count: techCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'tech')

      setStats({
        total: totalCount || 0,
        admins: adminCount || 0,
        staff: staffCount || 0,
        tech: techCount || 0,
        regular: (totalCount || 0) - (adminCount || 0) - (staffCount || 0) - (techCount || 0),
      })

      // Charger seulement les utilisateurs récents (limite initiale)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, role, is_admin, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(100) // Limite initiale pour un chargement rapide

      if (error) throw error
      const usersData = data || []
      setUsers(usersData)
      setFilteredUsers(usersData)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users)
      return
    }

    const filtered = users.filter((user) => {
      const query = searchQuery.toLowerCase()
      return (
        user.full_name?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query)
      )
    })
    setFilteredUsers(filtered)
  }, [searchQuery, users])

  async function handleUpdateRole(userId: string, newRole: string) {
    try {
      if (!['client', 'staff', 'tech', 'admin'].includes(newRole)) {
        alert('Rôle invalide')
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          is_admin: newRole === 'admin' // Mettre à jour is_admin pour compatibilité
        })
        .eq('id', userId)

      if (error) throw error
      await loadUsers()
    } catch (error) {
      console.error('Error updating user role:', error)
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
                Gestion des Utilisateurs
              </h1>
              <p className="text-gray-600 text-lg mb-6">
                {stats.total} {stats.total === 1 ? 'utilisateur' : 'utilisateurs'} au total
              </p>
            </div>
            <a
              href="/admin/users/stats"
              className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all font-bold shadow-lg hover:shadow-xl"
            >
              📊 Statistiques
            </a>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="text-3xl font-black text-primary-600 mb-2">{stats.total}</div>
              <div className="text-sm text-gray-600 font-semibold">Total utilisateurs</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="text-3xl font-black text-blue-600 mb-2">{stats.admins}</div>
              <div className="text-sm text-gray-600 font-semibold">Administrateurs</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="text-3xl font-black text-orange-600 mb-2">{stats.staff || 0}</div>
              <div className="text-sm text-gray-600 font-semibold">Staff</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="text-3xl font-black text-gray-600 mb-2">{stats.regular}</div>
              <div className="text-sm text-gray-600 font-semibold">Clients</div>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone ou ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-96 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-primary-500 to-primary-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Téléphone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Date d'inscription
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-gray-500">
                        {searchQuery ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((userProfile) => (
                  <tr key={userProfile.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-600">
                        {userProfile.id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {userProfile.full_name || 'Non renseigné'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {userProfile.phone || 'Non renseigné'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {userProfile.role === 'admin' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary-500 text-white">
                          Admin
                        </span>
                      )}
                      {userProfile.role === 'staff' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white">
                          Staff
                        </span>
                      )}
                      {userProfile.role === 'tech' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-500 text-white">
                          Tech
                        </span>
                      )}
                      {userProfile.role === 'client' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
                          Client
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {format(new Date(userProfile.created_at), 'PP', { locale: fr })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={userProfile.role || 'client'}
                          onChange={(e) => handleUpdateRole(userProfile.id, e.target.value)}
                          className="px-3 py-2 rounded-lg font-semibold text-sm border-2 border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="client">Client</option>
                          <option value="staff">Staff</option>
                          <option value="tech">Tech</option>
                          <option value="admin">Admin</option>
                        </select>
                        <a
                          href={`/admin/users/${userProfile.id}`}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-all"
                        >
                          Voir détails
                        </a>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AdminUsersPage() {
  return (
    <AdminGuard>
      <AdminUsersPageContent />
    </AdminGuard>
  )
}
