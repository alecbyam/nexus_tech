'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { AdminGuard } from '@/components/AdminGuard'
import { Header } from '@/components/header'
import type { ServiceRequest, ServiceRequestStatus } from '@/lib/services/services'
import { useToast } from '@/components/toast'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

function AdminServiceRequestsPageContent() {
  const toast = useToast()
  const [requests, setRequests] = useState<(ServiceRequest & { service?: { title: string } })[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<ServiceRequestStatus | 'all'>('all')
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadRequests()
  }, [selectedStatus])

  async function loadRequests() {
    try {
      setLoading(true)
      let query = supabase
        .from('service_requests')
        .select(`
          *,
          service:services(id, title)
        `)
        .order('created_at', { ascending: false })

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus)
      }

      const { data, error } = await query

      if (error) throw error
      setRequests((data || []) as any)
    } catch (error: any) {
      console.error('Error loading service requests:', error)
      toast.showToast('Erreur lors du chargement des demandes', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateStatus(requestId: string, newStatus: ServiceRequestStatus) {
    try {
      const updateData: any = { status: newStatus }
      
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString()
        const { data: { user } } = await supabase.auth.getUser()
        updateData.completed_by = user?.id || null
      }

      const { error } = await supabase
        .from('service_requests')
        .update(updateData)
        .eq('id', requestId)

      if (error) throw error
      await loadRequests()
      toast.showToast('Statut mis à jour', 'success')
    } catch (error: any) {
      toast.showToast('Erreur lors de la mise à jour', 'error')
    }
  }

  const statusLabels: Record<ServiceRequestStatus, string> = {
    pending: 'En attente',
    in_progress: 'En cours',
    completed: 'Terminé',
    cancelled: 'Annulé',
  }

  const statusColors: Record<ServiceRequestStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
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
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
            Demandes de Services
          </h1>
          <p className="text-gray-600 text-lg">
            {requests.length} {requests.length === 1 ? 'demande' : 'demandes'}
          </p>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(['all', 'pending', 'in_progress', 'completed', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                selectedStatus === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-500'
              }`}
            >
              {status === 'all' ? 'Toutes' : statusLabels[status]}
            </button>
          ))}
        </div>

        {/* Liste des demandes */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-primary-500 to-primary-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Service</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Téléphone</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Statut</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-gray-500">Aucune demande trouvée</p>
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">
                          {request.service?.title || 'Service supprimé'}
                        </div>
                        {request.notes && (
                          <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {request.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {request.customer_name || 'Non renseigné'}
                        </div>
                        {request.customer_email && (
                          <div className="text-xs text-gray-500">{request.customer_email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {request.customer_phone}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusColors[request.status]}`}>
                          {statusLabels[request.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {format(new Date(request.created_at), 'PP', { locale: fr })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={request.status}
                            onChange={(e) => handleUpdateStatus(request.id, e.target.value as ServiceRequestStatus)}
                            className="px-3 py-2 rounded-lg font-semibold text-sm border-2 border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="pending">En attente</option>
                            <option value="in_progress">En cours</option>
                            <option value="completed">Terminé</option>
                            <option value="cancelled">Annulé</option>
                          </select>
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

export default function AdminServiceRequestsPage() {
  return (
    <AdminGuard>
      <AdminServiceRequestsPageContent />
    </AdminGuard>
  )
}
