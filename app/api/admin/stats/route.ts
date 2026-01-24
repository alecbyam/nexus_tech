import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
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

export async function GET() {
  try {
    // Vérifier les variables d'environnement
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      )
    }

    const supabase = await createServerClient()

    // Vérifier que l'utilisateur est admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Produits
    const [totalProductsResult, activeProductsResult, lowStockResult, outOfStockResult] =
      await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true),
        supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .gt('stock', 0)
          .lte('stock', 10),
        supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('stock', 0),
      ])

    // Commandes
    const [totalOrdersResult, pendingOrdersResult] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
    ])

    // Revenus
    const { data: ordersData } = await supabase
      .from('orders')
      .select('total_cents, status')
      .neq('status', 'cancelled')

    const totalRevenue = ordersData?.reduce((sum, order) => sum + order.total_cents, 0) || 0
    const averageOrderValue =
      ordersData && ordersData.length > 0 ? totalRevenue / ordersData.length / 100 : 0

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

    const stats: AdminStats = {
      totalProducts: totalProductsResult.count || 0,
      activeProducts: activeProductsResult.count || 0,
      totalOrders: totalOrdersResult.count || 0,
      pendingOrders: pendingOrdersResult.count || 0,
      totalRevenue: totalRevenue / 100,
      totalUsers: totalUsers || 0,
      lowStockProducts: lowStockResult.count || 0,
      outOfStockProducts: outOfStockResult.count || 0,
      recentOrders: recentOrders || 0,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    }

    return NextResponse.json(stats)
  } catch (error: any) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
