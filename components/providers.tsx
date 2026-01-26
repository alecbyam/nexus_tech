'use client'

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export type UserRole = 'client' | 'staff' | 'admin' | 'tech'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean // Conservé pour compatibilité
  role: UserRole | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  role: null,
  signOut: async () => {},
})

// Cache en mémoire pour le rôle utilisateur (évite les requêtes répétées)
interface RoleCache {
  role: UserRole
  timestamp: number
}

const roleCache = new Map<string, RoleCache>()
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

// Fonction pour sauvegarder dans localStorage
function saveRoleCacheToStorage(userId: string, role: UserRole) {
  if (typeof window === 'undefined') return
  try {
    const cacheData = {
      userId,
      role,
      timestamp: Date.now(),
    }
    localStorage.setItem('role_cache', JSON.stringify(cacheData))
  } catch (error) {
    // Ignorer les erreurs localStorage (mode privé, quota, etc.)
  }
}

// Fonction pour charger depuis localStorage
function loadRoleCacheFromStorage(userId: string): UserRole | null {
  if (typeof window === 'undefined') return null
  try {
    const cached = localStorage.getItem('role_cache')
    if (!cached) return null
    
    const cacheData = JSON.parse(cached)
    // Vérifier que c'est pour le même utilisateur et que le cache est encore valide
    if (
      cacheData.userId === userId &&
      Date.now() - cacheData.timestamp < CACHE_DURATION
    ) {
      return cacheData.role
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
  const [role, setRole] = useState<UserRole | null>(null)
  const supabase = useMemo(() => createSupabaseClient(), [])
  const router = useRouter()

  // Calculer isAdmin à partir du rôle (pour compatibilité)
  const isAdmin = role === 'admin'

  const checkUserRole = useCallback(async (userId: string, useCache: boolean = true) => {
    // 1. Vérifier le cache en mémoire d'abord
    if (useCache) {
      const cached = roleCache.get(userId)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setRole(cached.role)
        setLoading(false)
        return
      }

      // 2. Vérifier le cache localStorage
      const localStorageCache = loadRoleCacheFromStorage(userId)
      if (localStorageCache !== null) {
        setRole(localStorageCache)
        setLoading(false)
        // Mettre à jour le cache en mémoire
        roleCache.set(userId, { role: localStorageCache, timestamp: Date.now() })
        return
      }
    }

    try {
      // 3. Requête optimisée - récupérer le rôle
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error checking user role:', error)
        setRole('client') // Rôle par défaut en cas d'erreur
        const cacheValue = { role: 'client' as UserRole, timestamp: Date.now() }
        roleCache.set(userId, cacheValue)
        saveRoleCacheToStorage(userId, 'client')
      } else {
        const userRole = (data?.role as UserRole) || 'client'
        setRole(userRole)
        // Mettre en cache (mémoire + localStorage)
        const cacheValue = { role: userRole, timestamp: Date.now() }
        roleCache.set(userId, cacheValue)
        saveRoleCacheToStorage(userId, userRole)
      }
    } catch (error) {
      console.error('Error checking user role:', error)
      setRole('client')
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
        const cached = roleCache.get(session.user.id)
        const localStorageCache = loadRoleCacheFromStorage(session.user.id)
        
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          setRole(cached.role)
          setLoading(false)
        } else if (localStorageCache !== null) {
          setRole(localStorageCache)
          setLoading(false)
          roleCache.set(session.user.id, { role: localStorageCache, timestamp: Date.now() })
        } else {
          // Pas de cache, faire la requête
          checkUserRole(session.user.id, false)
        }
      } else {
        setRole(null)
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
        roleCache.delete(session.user.id)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('role_cache')
        }
        await checkUserRole(session.user.id, false)
      } else {
        setRole(null)
        setLoading(false)
        // Nettoyer le cache
        roleCache.clear()
        if (typeof window !== 'undefined') {
          localStorage.removeItem('role_cache')
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
      setRole(null)
      // Nettoyer les caches
      roleCache.clear()
      if (typeof window !== 'undefined') {
        localStorage.removeItem('role_cache')
      }
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin: role === 'admin', role, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
