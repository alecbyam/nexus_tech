'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers'
import { AdminGuard } from '@/components/AdminGuard'
import { Header } from '@/components/header'
import { PageHeader } from '@/components/page-header'
import { formatPrice } from '@/lib/utils/format-price'
import { useToast } from '@/components/toast'
import Link from 'next/link'

interface Notification {
  id: string
  order_id: string
  notification_type: 'new_order' | 'order_updated' | 'order_cancelled'
  message: string
  is_read: boolean
  read_at: string | null
  read_by: string | null
  created_at: string
  orders?: {
    id: string
    status: string
    total_cents: number
    currency: string
    customer_name: string | null
    customer_phone: string | null
    customer_email: string | null
    user_id: string | null
  }
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const supabase = createSupabaseClient()
  const toast = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      loadNotifications()
      // Rafraîchir toutes les 30 secondes
      const interval = setInterval(loadNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('order_notifications')
        .select(`
          *,
          orders (
            id,
            status,
            total_cents,
            currency,
            customer_name,
            customer_phone,
            customer_email,
            user_id
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setNotifications(data as Notification[] || [])
      setUnreadCount((data || []).filter((n: Notification) => !n.is_read).length)
    } catch (error: any) {
      console.error('Error loading notifications:', error)
      toast.showToast('Erreur lors du chargement des notifications', 'error')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('order_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
          read_by: user?.id || null,
        })
        .eq('id', notificationId)

      if (error) throw error

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, is_read: true, read_at: new Date().toISOString(), read_by: user?.id || null }
            : n
        )
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error: any) {
      console.error('Error marking notification as read:', error)
      toast.showToast('Erreur lors de la mise à jour', 'error')
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id)
      if (unreadIds.length === 0) return

      const { error } = await supabase
        .from('order_notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
          read_by: user?.id || null,
        })
        .in('id', unreadIds)

      if (error) throw error

      setNotifications((prev) =>
        prev.map((n) =>
          !n.is_read
            ? { ...n, is_read: true, read_at: new Date().toISOString(), read_by: user?.id || null }
            : n
        )
      )
      setUnreadCount(0)
      toast.showToast('Toutes les notifications ont été marquées comme lues', 'success')
    } catch (error: any) {
      console.error('Error marking all as read:', error)
      toast.showToast('Erreur lors de la mise à jour', 'error')
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <PageHeader
            title="🔔 Notifications"
            subtitle={`${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`}
            actions={
              unreadCount > 0 ? (
                <button
                  onClick={markAllAsRead}
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors font-semibold"
                >
                  Tout marquer comme lu
                </button>
              ) : null
            }
          />

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <p className="mt-4 text-gray-600">Chargement des notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <p className="text-gray-500 text-lg">Aucune notification pour le moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => {
                const order = notification.orders
                const isNewOrder = notification.notification_type === 'new_order'

                return (
                  <div
                    key={notification.id}
                    className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-all ${
                      !notification.is_read
                        ? 'border-primary-500 bg-primary-50/30'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {isNewOrder && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              NOUVELLE
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {new Date(notification.created_at).toLocaleString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-gray-900 font-semibold mb-2">{notification.message}</p>
                        {order && (
                          <div className="bg-gray-50 rounded-lg p-4 mt-4 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Commande:</span>
                              <Link
                                href={`/admin/orders/${order.id}`}
                                className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
                              >
                                #{order.id.substring(0, 8)}
                              </Link>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Statut:</span>
                              <span className="text-sm font-semibold text-gray-900">{order.status}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Total:</span>
                              <span className="text-sm font-bold text-primary-600">
                                {formatPrice(order.total_cents, order.currency || 'USD')}
                              </span>
                            </div>
                            {order.customer_name && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Client:</span>
                                <span className="text-sm font-semibold text-gray-900">
                                  {order.customer_name}
                                  {order.customer_phone && ` (${order.customer_phone})`}
                                </span>
                              </div>
                            )}
                            {order.customer_email && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Email:</span>
                                <span className="text-sm text-gray-900">{order.customer_email}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors text-sm font-semibold whitespace-nowrap"
                        >
                          Marquer comme lu
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </AdminGuard>
  )
}
