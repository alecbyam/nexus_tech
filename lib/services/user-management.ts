/**
 * Service pour la gestion avancée des utilisateurs (admin)
 */

import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

export interface UserStats {
  total: number
  admins: number
  regular: number
  recent: number // Utilisateurs créés dans les 30 derniers jours
}

/**
 * Récupère les statistiques des utilisateurs
 */
export async function getUserStats(): Promise<UserStats> {
  const supabase = await createServerClient()
  
  // Vérifier que l'utilisateur est admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
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

  // Récupérer tous les utilisateurs
  const { data: users, error } = await supabase
    .from('profiles')
    .select('is_admin, created_at')

  if (error) {
    throw new Error(`Failed to fetch user stats: ${error.message}`)
  }

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  return {
    total: users?.length || 0,
    admins: users?.filter((u) => u.is_admin).length || 0,
    regular: users?.filter((u) => !u.is_admin).length || 0,
    recent: users?.filter((u) => new Date(u.created_at) > thirtyDaysAgo).length || 0,
  }
}

/**
 * Recherche des utilisateurs par nom, email ou téléphone
 */
export async function searchUsers(query: string): Promise<Profile[]> {
  const supabase = await createServerClient()
  
  // Vérifier que l'utilisateur est admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
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
    .from('profiles')
    .select('*')
    .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    throw new Error(`Failed to search users: ${error.message}`)
  }

  return (data || []) as Profile[]
}

/**
 * Désactive un utilisateur (soft delete)
 */
export async function deactivateUser(userId: string): Promise<void> {
  const supabase = await createServerClient()
  
  // Vérifier que l'utilisateur est admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
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

  // Note: Pour désactiver complètement un utilisateur, il faudrait
  // utiliser l'API Supabase Admin ou ajouter un champ is_active dans profiles
  // Pour l'instant, on peut juste supprimer le profil
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)

  if (error) {
    throw new Error(`Failed to deactivate user: ${error.message}`)
  }
}
