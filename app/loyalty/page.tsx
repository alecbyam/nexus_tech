'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers'
import { Header } from '@/components/header'
import { useRouter } from 'next/navigation'
import {
  getLoyaltyPoints,
  getLoyaltyHistory,
  redeemPoints,
} from '@/lib/services/loyalty'
import type { Database } from '@/types/database.types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

type LoyaltyPoints = Database['public']['Tables']['loyalty_points']['Row']
type LoyaltyTransaction = Database['public']['Tables']['loyalty_transactions']['Row']

const POINTS_TO_DOLLAR = 100 // 100 points = 1 dollar

export default function LoyaltyPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [points, setPoints] = useState<LoyaltyPoints | null>(null)
  const [history, setHistory] = useState<LoyaltyTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState(false)
  const [redeemAmount, setRedeemAmount] = useState('')

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/auth?redirect=/loyalty')
      return
    }

    loadData()
  }, [user, authLoading, router])

  async function loadData() {
    if (!user) return

    try {
      const [pointsData, historyData] = await Promise.all([
        getLoyaltyPoints(user.id),
        getLoyaltyHistory(user.id),
      ])
      setPoints(pointsData)
      setHistory(historyData)
    } catch (error) {
      console.error('Error loading loyalty data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleRedeem() {
    if (!user || !points) return

    const pointsToRedeem = parseInt(redeemAmount)
    if (isNaN(pointsToRedeem) || pointsToRedeem <= 0) {
      alert('Veuillez entrer un nombre valide')
      return
    }

    if (pointsToRedeem > points.points) {
      alert('Points insuffisants')
      return
    }

    setRedeeming(true)
    try {
      await redeemPoints(user.id, pointsToRedeem)
      await loadData()
      setRedeemAmount('')
      alert(
        `Vous avez utilisé ${pointsToRedeem} points pour une réduction de $${(pointsToRedeem / POINTS_TO_DOLLAR).toFixed(2)}`
      )
    } catch (error: any) {
      alert(error.message || 'Erreur lors de l\'utilisation des points')
    } finally {
      setRedeeming(false)
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

  if (!points) return null

  const availableDiscount = Math.floor(points.points / POINTS_TO_DOLLAR)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8">
          Programme de Fidélité
        </h1>

        {/* Points actuels */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg opacity-90 mb-2">Vos points de fidélité</p>
              <p className="text-6xl font-black">{points.points}</p>
              <p className="text-sm opacity-90 mt-2">
                = ${availableDiscount.toFixed(2)} de réduction disponible
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90 mb-1">Total gagné</p>
              <p className="text-2xl font-black">{points.total_earned}</p>
              <p className="text-sm opacity-90 mt-4 mb-1">Total utilisé</p>
              <p className="text-2xl font-black">{points.total_redeemed}</p>
            </div>
          </div>
        </div>

        {/* Utiliser les points */}
        {points.points >= POINTS_TO_DOLLAR && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Utiliser mes points</h2>
            <div className="flex gap-4">
              <input
                type="number"
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
                placeholder="Nombre de points"
                min={POINTS_TO_DOLLAR}
                max={points.points}
                step={POINTS_TO_DOLLAR}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                onClick={handleRedeem}
                disabled={redeeming || !redeemAmount}
                className="bg-primary-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {redeeming ? 'Traitement...' : 'Utiliser'}
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Minimum: {POINTS_TO_DOLLAR} points (${(POINTS_TO_DOLLAR / POINTS_TO_DOLLAR).toFixed(2)})
            </p>
          </div>
        )}

        {/* Historique */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Historique</h2>
          <div className="space-y-4">
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune transaction</p>
            ) : (
              history.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {transaction.description || 'Transaction'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(transaction.created_at), 'PPp', { locale: fr })}
                    </p>
                  </div>
                  <span
                    className={`text-lg font-black ${
                      transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.points > 0 ? '+' : ''}
                    {transaction.points} pts
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
