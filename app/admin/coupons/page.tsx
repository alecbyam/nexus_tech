'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers'
import { Header } from '@/components/header'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Database } from '@/types/database.types'

type Coupon = Database['public']['Tables']['coupons']['Row']

export default function AdminCouponsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    min_purchase_cents: '',
    max_discount_cents: '',
    usage_limit: '',
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: '',
    is_active: true,
  })

  useEffect(() => {
    if (authLoading) return

    if (!user || !isAdmin) {
      router.push('/')
      return
    }

    loadCoupons()
  }, [user, isAdmin, authLoading, router])

  async function loadCoupons() {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCoupons(data || [])
    } catch (error: any) {
      console.error('Error loading coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const discountValue = parseInt(formData.discount_value)
    if (isNaN(discountValue) || discountValue <= 0) {
      alert('Valeur de réduction invalide')
      return
    }

    try {
      const { error } = await supabase.from('coupons').insert({
        code: formData.code.toUpperCase(),
        description: formData.description || null,
        discount_type: formData.discount_type,
        discount_value: formData.discount_type === 'percentage' ? discountValue : discountValue * 100,
        min_purchase_cents: formData.min_purchase_cents
          ? Math.round(parseFloat(formData.min_purchase_cents) * 100)
          : 0,
        max_discount_cents: formData.max_discount_cents
          ? Math.round(parseFloat(formData.max_discount_cents) * 100)
          : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        valid_from: formData.valid_from,
        valid_until: formData.valid_until || null,
        is_active: formData.is_active,
      })

      if (error) throw error

      await loadCoupons()
      setShowForm(false)
      setFormData({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        min_purchase_cents: '',
        max_discount_cents: '',
        usage_limit: '',
        valid_from: new Date().toISOString().split('T')[0],
        valid_until: '',
        is_active: true,
      })
    } catch (error: any) {
      console.error('Error creating coupon:', error)
      alert(error.message || 'Erreur lors de la création')
    }
  }

  async function handleToggleActive(couponId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !currentStatus })
        .eq('id', couponId)

      if (error) throw error
      await loadCoupons()
    } catch (error: any) {
      console.error('Error updating coupon:', error)
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
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900">
              Codes Promo
            </h1>
            <div className="flex gap-4">
              <Link
                href="/admin"
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                ← Retour
              </Link>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-primary-500 text-white px-6 py-3 rounded-xl hover:bg-primary-600 transition-colors font-bold"
              >
                {showForm ? 'Annuler' : '+ Nouveau code'}
              </button>
            </div>
          </div>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Nouveau code promo</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                    placeholder="PROMO2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type de réduction <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) =>
                      setFormData({ ...formData, discount_type: e.target.value as any })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                  >
                    <option value="percentage">Pourcentage (%)</option>
                    <option value="fixed">Montant fixe ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Valeur <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    required
                    min="0"
                    step={formData.discount_type === 'percentage' ? '1' : '0.01'}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                    placeholder={formData.discount_type === 'percentage' ? '10' : '5.00'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Achat minimum ($)
                  </label>
                  <input
                    type="number"
                    value={formData.min_purchase_cents}
                    onChange={(e) => setFormData({ ...formData, min_purchase_cents: e.target.value })}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Réduction max ($)
                  </label>
                  <input
                    type="number"
                    value={formData.max_discount_cents}
                    onChange={(e) => setFormData({ ...formData, max_discount_cents: e.target.value })}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                    placeholder="50.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Limite d'utilisation
                  </label>
                  <input
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                    min="1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                    placeholder="Illimité"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Valide du
                  </label>
                  <input
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Valide jusqu'au
                  </label>
                  <input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                    placeholder="Description du code promo..."
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 bg-primary-500 text-white px-6 py-3 rounded-xl hover:bg-primary-600 transition-colors font-bold"
              >
                Créer le code promo
              </button>
            </form>
          )}
        </div>

        {/* Liste des coupons */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-primary-500 to-primary-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">
                    Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">
                    Réduction
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">
                    Utilisations
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">
                    Validité
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Aucun code promo
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-gray-900">{coupon.code}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">
                          {coupon.discount_type === 'percentage'
                            ? `${coupon.discount_value}%`
                            : `$${(coupon.discount_value / 100).toFixed(2)}`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700">
                          {coupon.used_count}
                          {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ' / ∞'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {coupon.valid_until
                          ? format(new Date(coupon.valid_until), 'PP', { locale: fr })
                          : 'Illimité'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(coupon.id, coupon.is_active)}
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            coupon.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {coupon.is_active ? 'Actif' : 'Inactif'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigator.clipboard.writeText(coupon.code)}
                          className="text-primary-600 hover:text-primary-700 font-semibold"
                        >
                          Copier
                        </button>
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
