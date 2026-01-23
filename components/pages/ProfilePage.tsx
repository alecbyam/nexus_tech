'use client'

import { useAuth } from '@/components/providers'
import { Header } from '@/components/header'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [profile, setProfile] = useState<{
    full_name: string | null
    phone: string | null
    is_admin: boolean
  } | null>(null)
  const [updating, setUpdating] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }

    if (user) {
      loadProfile()
    }
  }, [user, loading, router])

  async function loadProfile() {
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('full_name, phone, is_admin')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data)
    }
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user) return

    setUpdating(true)
    const formData = new FormData(e.currentTarget)
    
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.get('full_name') as string || null,
        phone: formData.get('phone') as string || null,
      })
      .eq('id', user.id)

    if (error) {
      console.error('Error updating profile:', error)
      alert('Erreur lors de la mise à jour')
    } else {
      await loadProfile()
      alert('Profil mis à jour avec succès')
    }

    setUpdating(false)
  }

  async function handleSignOut() {
    if (!confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) return

    setSigningOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
      alert('Erreur lors de la déconnexion')
    } finally {
      setSigningOut(false)
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

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8">
            Mon Profil
          </h1>

          {/* Statut de connexion */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 mb-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <div>
                  <p className="font-bold text-gray-900">Connecté</p>
                  <p className="text-sm text-gray-600">Email: {user.email}</p>
                </div>
              </div>
              {profile?.is_admin && (
                <span className="px-4 py-2 bg-primary-500 text-white text-sm font-bold rounded-full">
                  Administrateur
                </span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Informations de compte</h2>
              <p className="text-gray-600">Gérez vos informations personnelles</p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label htmlFor="full_name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  defaultValue={profile?.full_name || ''}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Votre nom"
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
                  defaultValue={profile?.phone || ''}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="+243 XXX XXX XXX"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-4 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {updating ? '⏳ Mise à jour...' : '💾 Enregistrer les modifications'}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full flex items-center justify-center gap-3 bg-red-50 text-red-600 px-6 py-4 rounded-xl hover:bg-red-100 transition-all duration-200 font-bold text-lg border-2 border-red-200 disabled:opacity-50"
              >
                <ArrowRightOnRectangleIcon className="w-6 h-6" />
                {signingOut ? 'Déconnexion...' : 'Se déconnecter'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
