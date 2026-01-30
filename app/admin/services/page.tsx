'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { AdminGuard } from '@/components/AdminGuard'
import { Header } from '@/components/header'
import type { Service, ServiceCategory } from '@/lib/services/services'
import { categoryNames } from '@/lib/services/services'
import { useToast } from '@/components/toast'
import { useRouter } from 'next/navigation'

function AdminServicesPageContent() {
  const router = useRouter()
  const toast = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all')
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadServices()
  }, [])

  async function loadServices() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('title', { ascending: true })

      if (error) throw error
      setServices((data || []) as Service[])
    } catch (error: any) {
      console.error('Error loading services:', error)
      toast.showToast('Erreur lors du chargement des services', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleActive(serviceId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !currentStatus })
        .eq('id', serviceId)

      if (error) throw error
      await loadServices()
      toast.showToast('Service mis à jour', 'success')
    } catch (error: any) {
      toast.showToast('Erreur lors de la mise à jour', 'error')
    }
  }

  async function handleDelete(serviceId: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)

      if (error) throw error
      await loadServices()
      toast.showToast('Service supprimé', 'success')
    } catch (error: any) {
      toast.showToast('Erreur lors de la suppression', 'error')
    }
  }

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(s => s.category === selectedCategory)

  const categories: ServiceCategory[] = ['smartphone', 'computer', 'internet_accounts', 'web_design', 'technical', 'training']

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
                Gestion des Services
              </h1>
              <p className="text-gray-600 text-lg">
                {services.length} {services.length === 1 ? 'service' : 'services'} au total
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/services/new')}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all font-bold shadow-lg hover:shadow-xl"
            >
              + Ajouter un service
            </button>
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                selectedCategory === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-500'
              }`}
            >
              Tous ({services.length})
            </button>
            {categories.map((category) => {
              const count = services.filter(s => s.category === category).length
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    selectedCategory === category
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-500'
                  }`}
                >
                  {categoryNames[category]} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* Liste des services */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-primary-500 to-primary-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Titre</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Catégorie</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Prix</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Durée</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Statut</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-gray-500">Aucun service trouvé</p>
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{service.title}</div>
                        {service.description && (
                          <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {service.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                          {categoryNames[service.category]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {service.price_estimate || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {service.duration_estimate || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          service.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {service.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/admin/services/${service.id}`)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-all"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleToggleActive(service.id, service.is_active)}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                              service.is_active
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {service.is_active ? 'Désactiver' : 'Activer'}
                          </button>
                          <button
                            onClick={() => handleDelete(service.id)}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold text-sm hover:bg-red-200 transition-all"
                          >
                            Supprimer
                          </button>
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

export default function AdminServicesPage() {
  return (
    <AdminGuard>
      <AdminServicesPageContent />
    </AdminGuard>
  )
}
