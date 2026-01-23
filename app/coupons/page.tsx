'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers'
import { Header } from '@/components/header'
import { getActiveCoupons } from '@/lib/services/coupons'
import type { Database } from '@/types/database.types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

type Coupon = Database['public']['Tables']['coupons']['Row']

export default function CouponsPage() {
  const { user } = useAuth()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCoupons()
  }, [])

  async function loadCoupons() {
    try {
      const data = await getActiveCoupons()
      setCoupons(data)
    } catch (error) {
      console.error('Error loading coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    alert(`Code ${code} copié !`)
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
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8">
          Codes Promo
        </h1>

        {coupons.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎟️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Aucun code promo disponible
            </h2>
            <p className="text-gray-600">
              Revenez bientôt pour découvrir nos offres spéciales !
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => {
              const isValid =
                (!coupon.valid_until || new Date(coupon.valid_until) > new Date()) &&
                (!coupon.usage_limit || coupon.used_count < coupon.usage_limit)

              return (
                <div
                  key={coupon.id}
                  className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                        {coupon.discount_type === 'percentage'
                          ? `${coupon.discount_value}%`
                          : `$${(coupon.discount_value / 100).toFixed(2)}`}
                      </span>
                      {coupon.usage_limit && (
                        <span className="text-xs opacity-90">
                          {coupon.usage_limit - coupon.used_count} restants
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-black mb-2">{coupon.code}</h3>
                    {coupon.description && (
                      <p className="text-sm opacity-90 mb-4">{coupon.description}</p>
                    )}
                    <div className="space-y-2 text-xs opacity-90 mb-4">
                      {coupon.min_purchase_cents > 0 && (
                        <p>Min: ${(coupon.min_purchase_cents / 100).toFixed(2)}</p>
                      )}
                      {coupon.valid_until && (
                        <p>
                          Valide jusqu'au{' '}
                          {format(new Date(coupon.valid_until), 'PP', { locale: fr })}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => copyCode(coupon.code)}
                      className="w-full bg-white text-primary-600 px-4 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                    >
                      Copier le code
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
