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

// Cache en mémoire pour le statut admin (évite les requêtes répétées)
const adminCache = new Map<string, { isAdmin: boolean; timestamp: number }>()
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes (augmenté de 5 à 10)

// Fonction pour sauvegarder dans localStorage
function saveAdminCacheToStorage(userId: string, isAdmin: boolean) {
  if (typeof window === 'undefined') return
  try {
    const cacheData = {
      userId,
      isAdmin,
      timestamp: Date.now(),
    }
    localStorage.setItem('admin_cache', JSON.stringify(cacheData))
  } catch (error) {
    // Ignorer les erreurs localStorage (mode privé, quota, etc.)
  }
}

// Fonction pour charger depuis localStorage
function loadAdminCacheFromStorage(userId: string): boolean | null {
  if (typeof window === 'undefined') return null
  try {
    const cached = localStorage.getItem('admin_cache')
    if (!cached) return null
    
    const cacheData = JSON.parse(cached)
    // Vérifier que c'est pour le même utilisateur et que le cache est encore valide
    if (
      cacheData.userId === userId &&
      Date.now() - cacheData.timestamp < CACHE_DURATION
    ) {
      return cacheData.isAdmin
    }
  } catch (error) {
    // Ignorer les erreurs
  }
  return null
}

export function useAuth() {
  return useContext(AuthContext)
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = useMemo(() => createSupabaseClient(), [])
  const router = useRouter()

  const checkAdminStatus = useCallback(async (userId: string, useCache: boolean = true) => {
    // 1. Vérifier le cache en mémoire d'abord
    if (useCache) {
      const cached = adminCache.get(userId)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setIsAdmin(cached.isAdmin)
        setLoading(false)
        return
      }

      // 2. Vérifier le cache localStorage
      const localStorageCache = loadAdminCacheFromStorage(userId)
      if (localStorageCache !== null) {
        setIsAdmin(localStorageCache)
        setLoading(false)
        // Mettre à jour le cache en mémoire
        adminCache.set(userId, { isAdmin: localStorageCache, timestamp: Date.now() })
        return
      }
    }

    try {
      // 3. Requête optimisée - seulement le champ nécessaire, avec maybeSingle pour éviter les erreurs
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .maybeSingle() // Utilise maybeSingle au lieu de single pour éviter les erreurs si pas de profil

      if (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
        const cacheValue = { isAdmin: false, timestamp: Date.now() }
        adminCache.set(userId, cacheValue)
        saveAdminCacheToStorage(userId, false)
      } else {
        const adminValue = data?.is_admin ?? false
        setIsAdmin(adminValue)
        // Mettre en cache (mémoire + localStorage)
        const cacheValue = { isAdmin: adminValue, timestamp: Date.now() }
        adminCache.set(userId, cacheValue)
        saveAdminCacheToStorage(userId, adminValue)
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
        // Vérifier le cache immédiatement avant de faire la requête
        const cached = adminCache.get(session.user.id)
        const localStorageCache = loadAdminCacheFromStorage(session.user.id)
        
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          setIsAdmin(cached.isAdmin)
          setLoading(false)
        } else if (localStorageCache !== null) {
          setIsAdmin(localStorageCache)
          setLoading(false)
          adminCache.set(session.user.id, { isAdmin: localStorageCache, timestamp: Date.now() })
        } else {
          // Pas de cache, faire la requête
          checkAdminStatus(session.user.id, false)
        }
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
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin_cache')
        }
        await checkAdminStatus(session.user.id, false)
      } else {
        setIsAdmin(false)
        setLoading(false)
        // Nettoyer le cache
        adminCache.clear()
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin_cache')
        }
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
      // Nettoyer les caches
      adminCache.clear()
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_cache')
      }
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
