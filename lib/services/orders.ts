/**
 * Service pour gérer les commandes depuis Supabase
 */

import { createServerClient } from '@/lib/supabase/server'
import type { Database, OrderStatus } from '@/types/database.types'

type Order = Database['public']['Tables']['orders']['Row']
type OrderItem = Database['public']['Tables']['order_items']['Row']
type OrderWithItems = Order & {
  order_items?: (OrderItem & {
    products?: Database['public']['Tables']['products']['Row']
  })[]
}

export interface CreateOrderInput {
  userId: string
  items: Array<{
    productId: string
    quantity: number
    priceCents: number
    nameSnapshot: string
  }>
  customerNote?: string
}

/**
 * Récupère toutes les commandes d'un utilisateur (server-side)
 */
export async function getUserOrders(userId: string): Promise<OrderWithItems[]> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user orders:', error)
    throw new Error(`Failed to fetch orders: ${error.message}`)
  }

  return (data || []) as OrderWithItems[]
}

/**
 * Récupère une commande par son ID (server-side)
 */
export async function getOrderById(orderId: string, userId?: string): Promise<OrderWithItems | null> {
  const supabase = await createServerClient()
  
  let queryBuilder = supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (*)
      )
    `)
    .eq('id', orderId)

  // Si userId est fourni, vérifier que la commande appartient à l'utilisateur
  if (userId) {
    queryBuilder = queryBuilder.eq('user_id', userId)
  }

  const { data, error } = await queryBuilder.single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching order by id:', error)
    throw new Error(`Failed to fetch order: ${error.message}`)
  }

  return data as OrderWithItems
}

/**
 * Crée une nouvelle commande (server-side)
 * Note: Cette fonction doit être utilisée dans une Server Action avec authentification
 */
export async function createOrder(input: CreateOrderInput): Promise<OrderWithItems> {
  const supabase = await createServerClient()
  
  // Vérifier l'authentification
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== input.userId) {
    throw new Error('Unauthorized: User ID mismatch')
  }

  // Créer la commande
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: input.userId,
      status: 'pending' as OrderStatus,
      customer_note: input.customerNote || null,
      total_cents: 0, // Sera recalculé par le trigger
      currency: 'USD',
    })
    .select()
    .single()

  if (orderError) {
    console.error('Error creating order:', orderError)
    throw new Error(`Failed to create order: ${orderError.message}`)
  }

  // Créer les lignes de commande
  const orderItems = input.items.map(item => ({
    order_id: order.id,
    product_id: item.productId,
    name_snapshot: item.nameSnapshot,
    price_cents_snapshot: item.priceCents,
    quantity: item.quantity,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) {
    // Nettoyer la commande en cas d'erreur
    await supabase.from('orders').delete().eq('id', order.id)
    console.error('Error creating order items:', itemsError)
    throw new Error(`Failed to create order items: ${itemsError.message}`)
  }

  // Récupérer la commande complète avec les items
  const completeOrder = await getOrderById(order.id, input.userId)
  if (!completeOrder) {
    throw new Error('Failed to retrieve created order')
  }

  return completeOrder
}

/**
 * Met à jour le statut d'une commande (admin seulement)
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<Order> {
  const supabase = await createServerClient()
  
  // Vérifier que l'utilisateur est admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    throw new Error('Unauthorized: Admin access required')
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single()

  if (error) {
    console.error('Error updating order status:', error)
    throw new Error(`Failed to update order status: ${error.message}`)
  }

  return data as Order
}
