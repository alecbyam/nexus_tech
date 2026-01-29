'use client'

// Force dynamic rendering (uses createSupabaseClient)
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { AdminGuard } from '@/components/AdminGuard'
import { Header } from '@/components/header'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/database.types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { UserRole } from '@/components/providers'

type Profile = Database['public']['Tables']['profiles']['Row']

function AdminUsersPageContent() {
  const router = useRouter()
  const [users, setUsers] = useState<Profile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)
  const [newUser, setNewUser] = useState<{
    email: string
    password: string
    full_name: string
    phone: string
    role: UserRole
  }>({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'client',
  })
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

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    setCreateError(null)
    setCreateSuccess(null)

    const email = newUser.email.trim().toLowerCase()
    const password = newUser.password.trim()
    if (!email || !password) {
      setCreateError('Email et mot de passe sont requis')
      return
    }
    if (password.length < 6) {
      setCreateError('Mot de passe trop court (min 6 caractères)')
      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          full_name: newUser.full_name.trim() || undefined,
          phone: newUser.phone.trim() || undefined,
          role: newUser.role,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.error || 'Erreur lors de la création')
      }

      setCreateSuccess(`Utilisateur créé: ${json.email} (${json.role})`)
      setShowCreateForm(false)
      setNewUser({ email: '', password: '', full_name: '', phone: '', role: 'client' })
      await loadUsers()
    } catch (err: any) {
      setCreateError(err?.message || 'Erreur lors de la création')
    } finally {
      setCreating(false)
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
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setCreateError(null)
                  setCreateSuccess(null)
                  setShowCreateForm((v) => !v)
                }}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all font-bold shadow-lg hover:shadow-xl"
              >
                + Créer un utilisateur
              </button>
              <a
                href="/admin/users/stats"
                className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all font-bold shadow-lg hover:shadow-xl"
              >
                📊 Statistiques
              </a>
            </div>
          </div>

          {showCreateForm && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Créer un utilisateur</h2>
                <div className="text-xs text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
                  ✓ Compte créé sans confirmation email
                </div>
              </div>

              {createError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-semibold">
                  {createError}
                </div>
              )}
              {createSuccess && (
                <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl text-sm text-green-700 font-semibold">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {createSuccess}
                  </div>
                  <p className="text-xs text-green-600 mt-1">Le compte a été créé sans confirmation email requise.</p>
                </div>
              )}

              <form onSubmit={handleCreateUser} className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="client@onatech.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mot de passe *</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Min 6 caractères"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nom complet</label>
                  <input
                    type="text"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser((p) => ({ ...p, full_name: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Nom Prénom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="text"
                    value={newUser.phone}
                    onChange={(e) => setNewUser((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="+243..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rôle</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value as UserRole }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="client">Client</option>
                    <option value="staff">Staff / Vendeur</option>
                    <option value="tech">Tech</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex items-end gap-3">
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all font-bold disabled:opacity-50"
                  >
                    {creating ? 'Création...' : 'Créer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-bold"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

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
