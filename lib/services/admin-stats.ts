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

  // Paralléliser toutes les requêtes de comptage (beaucoup plus rapide)
  const [
    totalProductsResult,
    activeProductsResult,
    lowStockResult,
    outOfStockResult,
    totalOrdersResult,
    pendingOrdersResult,
    totalUsersResult,
    recentOrdersResult,
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('products').select('*', { count: 'exact', head: true }).gt('stock', 0).lte('stock', 10),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('stock', 0),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  // Revenus (limité pour performance)
  const { data: ordersData } = await supabase
    .from('orders')
    .select('total_cents, status')
    .neq('status', 'cancelled')
    .limit(5000) // Limite pour éviter les requêtes trop lourdes

  const totalRevenue =
    ordersData?.reduce((sum, order) => sum + order.total_cents, 0) || 0

  const averageOrderValue =
    ordersData && ordersData.length > 0
      ? totalRevenue / ordersData.length / 100
      : 0

  return {
    totalProducts: totalProductsResult.count || 0,
    activeProducts: activeProductsResult.count || 0,
    totalOrders: totalOrdersResult.count || 0,
    pendingOrders: pendingOrdersResult.count || 0,
    totalRevenue: totalRevenue / 100,
    totalUsers: totalUsersResult.count || 0,
    lowStockProducts: lowStockResult.count || 0,
    outOfStockProducts: outOfStockResult.count || 0,
    recentOrders: recentOrdersResult.count || 0,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
  }
}

/**
 * Récupérer les produits les plus vendus
 */
export async function getTopSellingProducts(limit: number = 10) {
  const supabase = await createSupabaseServerClient()

  // Limiter les order_items pour améliorer les performances
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('product_id, quantity, name_snapshot')
    .limit(10000) // Limite pour éviter les requêtes trop lourdes

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

  // Limiter les résultats pour améliorer les performances
  const { data: orders } = await supabase
    .from('orders')
    .select('total_cents, created_at, status')
    .gte('created_at', startDate)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: true })
    .limit(5000) // Limite pour éviter les requêtes trop lourdes

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
