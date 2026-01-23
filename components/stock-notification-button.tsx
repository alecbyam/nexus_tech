'use client'

import { useState, useEffect } from 'react'
import { BellIcon, BellAlertIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/components/providers'
import { subscribeToStockNotification, isSubscribedToStock } from '@/lib/services/stock-notifications'
import { useRouter } from 'next/navigation'

interface StockNotificationButtonProps {
  productId: string
  productName: string
  className?: string
}

export function StockNotificationButton({
  productId,
  productName,
  className = '',
}: StockNotificationButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      checkSubscription()
    }
  }, [user, productId])

  async function checkSubscription() {
    if (!user) return
    try {
      const subscribed = await isSubscribedToStock(productId, user.id)
      setIsSubscribed(subscribed)
    } catch (error: any) {
      // Table might not exist yet - silently fail
      if (error?.code !== '42P01') {
        console.warn('Error checking subscription:', error)
      }
    }
  }

  async function handleSubscribe() {
    if (!user) {
      router.push('/auth?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }

    setLoading(true)
    try {
      await subscribeToStockNotification(productId, user.id, user.email || undefined)
      setIsSubscribed(true)
      alert('Vous serez notifié lorsque ce produit sera de nouveau en stock !')
    } catch (error: any) {
      console.error('Error subscribing:', error)
      alert(error.message || 'Erreur lors de l\'abonnement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading || isSubscribed}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
        isSubscribed
          ? 'bg-green-50 text-green-700 border-2 border-green-200 cursor-not-allowed'
          : 'bg-yellow-50 text-yellow-700 border-2 border-yellow-200 hover:bg-yellow-100'
      } ${className}`}
      title={
        isSubscribed
          ? 'Vous êtes déjà abonné aux notifications'
          : 'Être notifié du retour en stock'
      }
    >
      {isSubscribed ? (
        <>
          <BellAlertIcon className="w-5 h-5" />
          <span>Notifié</span>
        </>
      ) : (
        <>
          <BellIcon className="w-5 h-5" />
          <span>Me notifier</span>
        </>
      )}
    </button>
  )
}
