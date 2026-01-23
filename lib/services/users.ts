/**
 * Service pour gérer les utilisateurs et leurs profils
 */

import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

/**
 * Récupère le profil d'un utilisateur (server-side)
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching user profile:', error)
    throw new Error(`Failed to fetch user profile: ${error.message}`)
  }

  return data as Profile
}

/**
 * Met à jour le profil d'un utilisateur (server-side)
 */
export async function updateUserProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<Profile> {
  const supabase = await createServerClient()
  
  // Vérifier que l'utilisateur met à jour son propre profil
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized: You can only update your own profile')
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user profile:', error)
    throw new Error(`Failed to update user profile: ${error.message}`)
  }

  return data as Profile
}

/**
 * Récupère tous les utilisateurs (admin seulement)
 */
export async function getAllUsers(): Promise<Profile[]> {
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
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all users:', error)
    throw new Error(`Failed to fetch users: ${error.message}`)
  }

  return (data || []) as Profile[]
}

/**
 * Met à jour le statut admin d'un utilisateur (admin seulement)
 */
export async function updateUserAdminStatus(
  userId: string,
  isAdmin: boolean
): Promise<Profile> {
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
    .update({ is_admin: isAdmin })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user admin status:', error)
    throw new Error(`Failed to update user admin status: ${error.message}`)
  }

  return data as Profile
}
