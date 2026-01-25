'use client'

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
})

// Cache pour le statut admin (évite les requêtes répétées)
const adminCache = new Map<string, { isAdmin: boolean; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useAuth() {
  return useContext(AuthContext)
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = useMemo(() => createSupabaseClient(), [])
  const router = useRouter()

  const checkAdminStatus = useCallback(async (userId: string) => {
    // Vérifier le cache d'abord
    const cached = adminCache.get(userId)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setIsAdmin(cached.isAdmin)
      setLoading(false)
      return
    }

    try {
      // Requête optimisée - seulement le champ nécessaire
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
        adminCache.set(userId, { isAdmin: false, timestamp: Date.now() })
      } else {
        const adminValue = data?.is_admin ?? false
        setIsAdmin(adminValue)
        // Mettre en cache
        adminCache.set(userId, { isAdmin: adminValue, timestamp: Date.now() })
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    let mounted = true

    // Get initial session (plus rapide avec cache)
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return
      
      if (error) {
        console.error('Error getting session:', error)
        setLoading(false)
        return
      }

      setUser(session?.user ?? null)
      if (session?.user) {
        checkAdminStatus(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      setUser(session?.user ?? null)
      if (session?.user) {
        // Invalider le cache lors d'un changement d'auth
        adminCache.delete(session.user.id)
        await checkAdminStatus(session.user.id)
      } else {
        setIsAdmin(false)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, checkAdminStatus])

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setIsAdmin(false)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
