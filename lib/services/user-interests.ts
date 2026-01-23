import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

type ProductView = Database['public']['Tables']['product_views']['Row']
type SearchQuery = Database['public']['Tables']['search_queries']['Row']

export interface UserInterestStats {
  totalViews: number
  uniqueProducts: number
  totalSearches: number
  topProducts: Array<{
    product_id: string
    product_name: string
    view_count: number
  }>
  topSearches: Array<{
    query: string
    count: number
  }>
  recentActivity: Array<{
    type: 'view' | 'search'
    data: any
    created_at: string
  }>
}

export interface UserInterests {
  userId: string
  email: string | null
  fullName: string | null
  totalViews: number
  totalSearches: number
  lastActivity: string | null
}

/**
 * Enregistre une vue de produit
 */
export async function trackProductView(
  productId: string,
  userId?: string,
  sessionId?: string
): Promise<void> {
  const supabase = await createSupabaseServerClient()

  await supabase.from('product_views').insert({
    product_id: productId,
    user_id: userId || null,
    session_id: sessionId || null,
  })
}

/**
 * Enregistre une recherche
 */
export async function trackSearch(
  query: string,
  categorySlug: string | null,
  resultsCount: number,
  userId?: string,
  sessionId?: string
): Promise<void> {
  const supabase = await createSupabaseServerClient()

  await supabase.from('search_queries').insert({
    query,
    category_slug: categorySlug || null,
    results_count: resultsCount,
    user_id: userId || null,
    session_id: sessionId || null,
  })
}

/**
 * Récupère les statistiques d'intérêts pour un utilisateur
 */
export async function getUserInterestStats(userId: string): Promise<UserInterestStats> {
  const supabase = await createSupabaseServerClient()

  // Total de vues
  const { count: totalViews } = await supabase
    .from('product_views')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Produits uniques
  const { count: uniqueProducts } = await supabase
    .from('product_views')
    .select('product_id', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Total de recherches
  const { count: totalSearches } = await supabase
    .from('search_queries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Top produits consultés
  const { data: topProductsData } = await supabase
    .from('product_views')
    .select('product_id, products(name)')
    .eq('user_id', userId)

  const productCounts = new Map<string, { name: string; count: number }>()
  topProductsData?.forEach((view: any) => {
    const productId = view.product_id
    const productName = view.products?.name || 'Produit inconnu'
    const current = productCounts.get(productId) || { name: productName, count: 0 }
    productCounts.set(productId, { name: productName, count: current.count + 1 })
  })

  const topProducts = Array.from(productCounts.entries())
    .map(([product_id, { name: product_name, count: view_count }]) => ({
      product_id,
      product_name,
      view_count,
    }))
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 10)

  // Top recherches
  const { data: searchesData } = await supabase
    .from('search_queries')
    .select('query')
    .eq('user_id', userId)

  const searchCounts = new Map<string, number>()
  searchesData?.forEach((search) => {
    const query = search.query.toLowerCase().trim()
    if (query) {
      searchCounts.set(query, (searchCounts.get(query) || 0) + 1)
    }
  })

  const topSearches = Array.from(searchCounts.entries())
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Activité récente
  const { data: recentViews } = await supabase
    .from('product_views')
    .select('*, products(name)')
    .eq('user_id', userId)
    .order('viewed_at', { ascending: false })
    .limit(10)

  const { data: recentSearches } = await supabase
    .from('search_queries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  const recentActivity = [
    ...(recentViews || []).map((v: any) => ({
      type: 'view' as const,
      data: { productId: v.product_id, productName: v.products?.name },
      created_at: v.viewed_at,
    })),
    ...(recentSearches || []).map((s) => ({
      type: 'search' as const,
      data: { query: s.query, categorySlug: s.category_slug },
      created_at: s.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 20)

  return {
    totalViews: totalViews || 0,
    uniqueProducts: uniqueProducts || 0,
    totalSearches: totalSearches || 0,
    topProducts,
    topSearches,
    recentActivity,
  }
}

/**
 * Récupère tous les utilisateurs avec leurs intérêts (admin seulement)
 */
export async function getAllUsersInterests(): Promise<UserInterests[]> {
  const supabase = await createSupabaseServerClient()

  // Vérifier que l'utilisateur est admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) throw new Error('Accès refusé')

  // Récupérer tous les utilisateurs avec leurs stats
  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name')
    .order('created_at', { ascending: false })

  const usersWithInterests: UserInterests[] = []

  for (const userProfile of users || []) {
    const { count: totalViews } = await supabase
      .from('product_views')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userProfile.id)

    const { count: totalSearches } = await supabase
      .from('search_queries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userProfile.id)

    const { data: lastView } = await supabase
      .from('product_views')
      .select('viewed_at')
      .eq('user_id', userProfile.id)
      .order('viewed_at', { ascending: false })
      .limit(1)
      .single()

    const { data: lastSearch } = await supabase
      .from('search_queries')
      .select('created_at')
      .eq('user_id', userProfile.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const lastActivity = lastView?.viewed_at || lastSearch?.created_at || null

    // Note: Pour récupérer l'email, il faudrait utiliser le service_role_key
    // Pour l'instant, on utilise seulement les données du profil
    usersWithInterests.push({
      userId: userProfile.id,
      email: null, // Email nécessite service_role_key
      fullName: userProfile.full_name,
      totalViews: totalViews || 0,
      totalSearches: totalSearches || 0,
      lastActivity,
    })
  }

  return usersWithInterests
}
