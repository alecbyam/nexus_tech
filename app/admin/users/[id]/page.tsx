'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers'
import { Header } from '@/components/header'
import type { Database } from '@/types/database.types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAdmin, loading: authLoading } = useAuth()
  const [userProfile, setUserProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createSupabaseClient()

  const userId = params.id as string

  useEffect(() => {
    if (authLoading) return

    if (!user || !isAdmin) {
      router.push('/')
      return
    }

    loadUser()
  }, [user, isAdmin, authLoading, router, userId])

  async function loadUser() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setUserProfile(data)
    } catch (error: any) {
      console.error('Error loading user:', error)
      setError(error.message || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setUpdating(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.get('full_name') as string || null,
          phone: formData.get('phone') as string || null,
          is_admin: formData.get('is_admin') === 'on',
        })
        .eq('id', userId)

      if (error) throw error

      await loadUser()
      alert('Profil mis à jour avec succès')
    } catch (error: any) {
      console.error('Error updating user:', error)
      setError(error.message || 'Erreur lors de la mise à jour')
    } finally {
      setUpdating(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      return
    }

    try {
      // Note: La suppression de l'utilisateur dans auth.users doit être faite via Supabase Dashboard
      // ou via une fonction server-side avec service_role_key
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error

      router.push('/admin/users')
    } catch (error: any) {
      console.error('Error deleting user:', error)
      alert('Erreur lors de la suppression. Note: La suppression complète doit être faite depuis le dashboard Supabase.')
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

  if (error && !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-700 font-semibold">{error}</p>
            <button
              onClick={() => router.push('/admin/users')}
              className="mt-4 text-primary-600 hover:underline"
            >
              Retour à la liste
            </button>
          </div>
        </main>
      </div>
    )
  }

  if (!userProfile) {
    return null
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
            Détails de l'utilisateur
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Informations générales */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations générales</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">ID Utilisateur</label>
                <p className="text-sm font-mono text-gray-600 break-all">{userProfile.id}</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Statut</label>
                {userProfile.is_admin ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-primary-500 text-white">
                    Administrateur
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-200 text-gray-700">
                    Utilisateur
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Date de création</label>
                <p className="text-sm text-gray-600">
                  {format(new Date(userProfile.created_at), 'PPpp', { locale: fr })}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Dernière mise à jour</label>
                <p className="text-sm text-gray-600">
                  {format(new Date(userProfile.updated_at), 'PPpp', { locale: fr })}
                </p>
              </div>
            </div>
          </div>

          {/* Formulaire d'édition */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Modifier le profil</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm font-semibold">{error}</p>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                <label htmlFor="full_name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  defaultValue={userProfile.full_name || ''}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="Nom complet"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  defaultValue={userProfile.phone || ''}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="+243 XXX XXX XXX"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_admin"
                  name="is_admin"
                  defaultChecked={userProfile.is_admin}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="is_admin" className="ml-3 text-sm font-semibold text-gray-700">
                  Accès administrateur
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                >
                  {updating ? '⏳ Mise à jour...' : '💾 Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 font-bold shadow-lg hover:shadow-xl"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
