'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers'
import { Header } from '@/components/header'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/database.types'

type Category = Database['public']['Tables']['categories']['Row']

export default function NewCategoryPage() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    slug: '',
    parent_id: '',
    sort_order: '0',
    is_active: true,
  })

  useEffect(() => {
    if (authLoading) return

    if (!user || !isAdmin) {
      router.push('/')
      return
    }

    loadCategories()
  }, [user, isAdmin, authLoading, router])

  async function loadCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (error: any) {
      console.error('Error loading categories:', error)
      setError('Erreur lors du chargement des catégories')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    })
    setError(null)
  }

  // Générer le slug automatiquement depuis le nom
  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value
    setFormData({
      ...formData,
      name,
      slug: formData.slug || generateSlug(name),
    })
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.name || !formData.key) {
      setError('Le nom et la clé sont requis')
      return
    }

    const sortOrder = parseInt(formData.sort_order)
    if (isNaN(sortOrder) || sortOrder < 0) {
      setError('L\'ordre doit être un nombre positif')
      return
    }

    setSaving(true)

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: formData.name,
          key: formData.key,
          slug: formData.slug || generateSlug(formData.name),
          parent_id: formData.parent_id || null,
          sort_order: sortOrder,
          is_active: formData.is_active,
        })
        .select()
        .single()

      if (error) throw error

      router.push(`/admin/categories/${data.id}`)
    } catch (error: any) {
      console.error('Error creating category:', error)
      setError(error.message || 'Erreur lors de la création de la catégorie')
      setSaving(false)
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="text-primary-600 hover:text-primary-700 font-semibold mb-4 inline-flex items-center"
            >
              ← Retour
            </button>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
              Nouvelle Catégorie
            </h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Nom */}
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom de la catégorie <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="Téléphones"
                />
              </div>

              {/* Clé */}
              <div>
                <label htmlFor="key" className="block text-sm font-semibold text-gray-700 mb-2">
                  Clé (identifiant unique) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="key"
                  name="key"
                  value={formData.key}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-mono"
                  placeholder="phones"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Identifiant unique (ex: phones, computers, accessories)
                </p>
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-semibold text-gray-700 mb-2">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="telephones"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Généré automatiquement depuis le nom si vide
                </p>
              </div>

              {/* Catégorie parente */}
              <div>
                <label htmlFor="parent_id" className="block text-sm font-semibold text-gray-700 mb-2">
                  Catégorie parente (optionnel)
                </label>
                <select
                  id="parent_id"
                  name="parent_id"
                  value={formData.parent_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                >
                  <option value="">Aucune (catégorie principale)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ordre de tri */}
              <div>
                <label htmlFor="sort_order" className="block text-sm font-semibold text-gray-700 mb-2">
                  Ordre de tri
                </label>
                <input
                  type="number"
                  id="sort_order"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Plus le nombre est petit, plus la catégorie apparaît en premier
                </p>
              </div>

              {/* Statut actif */}
              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="is_active" className="ml-3 text-sm font-semibold text-gray-700">
                    Catégorie active (visible dans le catalogue)
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-4 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {saving ? '⏳ Création...' : '✅ Créer la catégorie'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-bold"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
