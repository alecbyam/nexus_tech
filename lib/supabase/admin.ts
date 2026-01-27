import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

/**
 * Client Supabase Admin (service role) pour opérations privilégiées (Auth admin, etc.)
 * IMPORTANT: Ne jamais l'utiliser côté client. Uniquement dans les routes API.
 */
export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

