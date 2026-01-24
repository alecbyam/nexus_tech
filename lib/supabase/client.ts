import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

/**
 * Client-side Supabase client (for use in components)
 * Gère automatiquement les sessions et les cookies
 */
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== 'undefined') {
      console.error('Missing Supabase environment variables')
    }
    // Retourner un client avec des valeurs par défaut pour éviter les crashes
    // En production, cela devrait être configuré correctement
    return createBrowserClient<Database>(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-key'
    )
  }
  
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

/**
 * Server-side Supabase client (for use in API routes, server components)
 * Ne persiste pas les sessions (stateless)
 */
export const createSupabaseServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
