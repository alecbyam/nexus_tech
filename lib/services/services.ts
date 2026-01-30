/**
 * Service pour récupérer les services depuis Supabase
 */

import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

export type ServiceCategory = 'smartphone' | 'computer' | 'internet_accounts' | 'web_design' | 'technical' | 'training'

export type ServiceRequestStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export interface Service {
  id: string
  title: string
  category: ServiceCategory
  description: string | null
  price_estimate: string | null
  duration_estimate: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ServiceRequest {
  id: string
  service_id: string
  user_id: string | null
  customer_name: string | null
  customer_email: string | null
  customer_phone: string
  status: ServiceRequestStatus
  notes: string | null
  admin_notes: string | null
  estimated_price: string | null
  final_price: string | null
  completed_at: string | null
  completed_by: string | null
  created_at: string
  updated_at: string
  service?: Service
}

export interface ServiceFilters {
  category?: ServiceCategory
  isActive?: boolean
}

/**
 * Récupère tous les services actifs (server-side)
 */
export async function getServices(filters: ServiceFilters = {}): Promise<Service[]> {
  try {
    const supabase = await createServerClient()
    
    let queryBuilder = supabase
      .from('services')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('title', { ascending: true })

    if (filters.isActive !== false) {
      queryBuilder = queryBuilder.eq('is_active', true)
    }

    if (filters.category) {
      queryBuilder = queryBuilder.eq('category', filters.category)
    }

    const { data, error } = await queryBuilder

    if (error) {
      console.error('Error fetching services:', error)
      return []
    }

    return (data || []) as Service[]
  } catch (error) {
    console.error('Error in getServices:', error)
    return []
  }
}

/**
 * Récupère un service par son ID (server-side)
 */
export async function getServiceById(id: string): Promise<Service | null> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching service by id:', error)
    return null
  }

  return data as Service
}

/**
 * Récupère les services par catégorie (server-side)
 */
export async function getServicesByCategory(category: ServiceCategory): Promise<Service[]> {
  return getServices({ category, isActive: true })
}

/**
 * Noms des catégories en français
 */
export const categoryNames: Record<ServiceCategory, string> = {
  smartphone: 'Services Smartphone',
  computer: 'Services Ordinateur',
  internet_accounts: 'Internet & Comptes',
  web_design: 'Web & Design',
  technical: 'Services Techniques',
  training: 'Formation',
}

/**
 * Icônes pour les catégories
 */
export const categoryIcons: Record<ServiceCategory, string> = {
  smartphone: '📱',
  computer: '💻',
  internet_accounts: '🌐',
  web_design: '🎨',
  technical: '🔧',
  training: '📚',
}
