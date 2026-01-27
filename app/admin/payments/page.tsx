'use client'

// Force dynamic rendering (uses createSupabaseClient)
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { AdminGuard } from '@/components/AdminGuard'
import { Header } from '@/components/header'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils/format-price'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import type { Database } from '@/types/database.types'

type Payment = Database['public']['Tables']['payments']['Row'] & {
  orders: Database['public']['Tables']['orders']['Row']
  profiles: Database['public']['Tables']['profiles']['Row']
}

const paymentStatusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-700',
  refunded: 'bg-purple-100 text-purple-700',
}

const paymentMethodLabels = {
  mpesa: 'M-Pesa',
  orange_money: 'Orange Money',
  airtel_money: 'Airtel Money',
  card: 'Carte Bancaire',
  cash: 'Espèces',
}

function AdminPaymentsPageContent() {
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all')
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0,
    totalAmount: 0,
  })

  useEffect(() => {
    loadPayments()
  }, [filter])

  async function loadPayments() {
    try {
      setLoading(true)
      let query = supabase
        .from('payments')
        .select(`
          *,
          orders (*),
          profiles:user_id (full_name, phone)
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (filter !== 'all') {
        query = query.eq('payment_status', filter)
      }

      const { data, error } = await query

      if (error) throw error

      setPayments((data as Payment[]) || [])

      // Calculer les statistiques
      const allPayments = await supabase.from('payments').select('payment_status, amount_cents')
      if (allPayments.data) {
        const statsData = {
          total: allPayments.data.length,
          pending: allPayments.data.filter((p) => p.payment_status === 'pending').length,
          completed: allPayments.data.filter((p) => p.payment_status === 'completed').length,
          failed: allPayments.data.filter((p) => p.payment_status === 'failed').length,
          totalAmount:
            allPayments.data
              .filter((p) => p.payment_status === 'completed')
              .reduce((sum, p) => sum + p.amount_cents, 0) / 100,
        }
        setStats(statsData)
      }
    } catch (error: any) {
      console.error('Error loading payments:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updatePaymentStatus(paymentId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ payment_status: newStatus as any })
        .eq('id', paymentId)

      if (error) throw error

      await loadPayments()
      alert('Statut du paiement mis à jour')
    } catch (error: any) {
      console.error('Error updating payment:', error)
      alert('Erreur lors de la mise à jour')
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
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">Gestion des Paiements</h1>
          <p className="text-gray-600 text-lg">Suivez et gérez tous les paiements</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
            <div className="text-2xl font-black text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div className="bg-yellow-50 rounded-xl shadow-lg p-4 border border-yellow-200">
            <div className="text-2xl font-black text-yellow-700">{stats.pending}</div>
            <div className="text-xs text-yellow-600">En attente</div>
          </div>
          <div className="bg-green-50 rounded-xl shadow-lg p-4 border border-green-200">
            <div className="text-2xl font-black text-green-700">{stats.completed}</div>
            <div className="text-xs text-green-600">Complétés</div>
          </div>
          <div className="bg-red-50 rounded-xl shadow-lg p-4 border border-red-200">
            <div className="text-2xl font-black text-red-700">{stats.failed}</div>
            <div className="text-xs text-red-600">Échoués</div>
          </div>
          <div className="bg-blue-50 rounded-xl shadow-lg p-4 border border-blue-200">
            <div className="text-2xl font-black text-blue-700">
              {formatPrice(Math.round(stats.totalAmount * 100), 'USD').replace('$', '')}
            </div>
            <div className="text-xs text-blue-600">Montant total</div>
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-6 flex gap-2">
          {(['all', 'pending', 'completed', 'failed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === f
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {f === 'all' ? 'Tous' : f === 'pending' ? 'En attente' : f === 'completed' ? 'Complétés' : 'Échoués'}
            </button>
          ))}
        </div>

        {/* Liste des paiements */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Méthode</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Montant</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Téléphone</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      Aucun paiement trouvé
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-gray-600">
                          {payment.id.substring(0, 8)}...
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {payment.profiles?.full_name || 'Client anonyme'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Commande #{payment.orders?.id?.substring(0, 8) || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-700">
                          {paymentMethodLabels[payment.payment_method as keyof typeof paymentMethodLabels] ||
                            payment.payment_method}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-black text-primary-600">
                          {formatPrice(payment.amount_cents, payment.currency || 'USD')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            paymentStatusColors[payment.payment_status as keyof typeof paymentStatusColors] ||
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {payment.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{payment.phone_number || '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-600">
                          {format(new Date(payment.created_at), 'PPp', { locale: fr })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {payment.payment_status === 'pending' && (
                            <>
                              <button
                                onClick={() => updatePaymentStatus(payment.id, 'completed')}
                                className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600"
                              >
                                Valider
                              </button>
                              <button
                                onClick={() => updatePaymentStatus(payment.id, 'failed')}
                                className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600"
                              >
                                Échouer
                              </button>
                            </>
                          )}
                          <Link
                            href={`/admin/orders/${payment.order_id}`}
                            className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600"
                          >
                            Voir commande
                          </Link>
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

export default function AdminPaymentsPage() {
  return (
    <AdminGuard>
      <AdminPaymentsPageContent />
    </AdminGuard>
  )
}
