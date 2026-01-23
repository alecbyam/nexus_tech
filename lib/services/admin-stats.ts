import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

export interface AdminStats {
  totalProducts: number
  activeProducts: number
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  totalUsers: number
  lowStockProducts: number
  outOfStockProducts: number
  recentOrders: number
  averageOrderValue: number
}

/**
 * Récupérer les statistiques globales pour l'admin
 */
export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createSupabaseServerClient()

  // Produits
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  const { count: activeProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const { count: lowStockProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .gt('stock', 0)
    .lte('stock', 10)

  const { count: outOfStockProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('stock', 0)

  // Commandes
  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })

  const { count: pendingOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  // Revenus
  const { data: ordersData } = await supabase
    .from('orders')
    .select('total_cents, status')
    .neq('status', 'cancelled')

  const totalRevenue =
    ordersData?.reduce((sum, order) => sum + order.total_cents, 0) || 0

  const averageOrderValue =
    ordersData && ordersData.length > 0
      ? totalRevenue / ordersData.length / 100
      : 0

  // Utilisateurs
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // Commandes récentes (7 derniers jours)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { count: recentOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo)

  return {
    totalProducts: totalProducts || 0,
    activeProducts: activeProducts || 0,
    totalOrders: totalOrders || 0,
    pendingOrders: pendingOrders || 0,
    totalRevenue: totalRevenue / 100,
    totalUsers: totalUsers || 0,
    lowStockProducts: lowStockProducts || 0,
    outOfStockProducts: outOfStockProducts || 0,
    recentOrders: recentOrders || 0,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
  }
}

/**
 * Récupérer les produits les plus vendus
 */
export async function getTopSellingProducts(limit: number = 10) {
  const supabase = await createSupabaseServerClient()

  const { data: orderItems } = await supabase
    .from('order_items')
    .select('product_id, quantity, name_snapshot')

  const productSales = new Map<string, { name: string; quantity: number }>()

  orderItems?.forEach((item) => {
    if (!item.product_id) return
    const current = productSales.get(item.product_id) || {
      name: item.name_snapshot,
      quantity: 0,
    }
    productSales.set(item.product_id, {
      name: item.name_snapshot,
      quantity: current.quantity + item.quantity,
    })
  })

  return Array.from(productSales.entries())
    .map(([productId, data]) => ({
      productId,
      name: data.name,
      quantity: data.quantity,
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit)
}

/**
 * Récupérer les statistiques de ventes par période
 */
export async function getSalesByPeriod(days: number = 30) {
  const supabase = await createSupabaseServerClient()

  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data: orders } = await supabase
    .from('orders')
    .select('total_cents, created_at, status')
    .gte('created_at', startDate)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: true })

  // Grouper par jour
  const salesByDay = new Map<string, number>()

  orders?.forEach((order) => {
    const date = new Date(order.created_at).toISOString().split('T')[0]
    const current = salesByDay.get(date) || 0
    salesByDay.set(date, current + order.total_cents / 100)
  })

  return Array.from(salesByDay.entries()).map(([date, revenue]) => ({
    date,
    revenue,
  }))
}
