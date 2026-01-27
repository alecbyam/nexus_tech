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
  refreshRole: () => Promise<void> // Fonction pour forcer le rechargement du rôle
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  role: null,
  signOut: async () => {},
  refreshRole: async () => {},
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

  // Fonction pour vérifier le rôle utilisateur (définie en premier pour éviter les problèmes d'ordre)
  const checkUserRole = useCallback(async (userId: string, useCache: boolean = true, forceRefresh: boolean = false, retryCount: number = 0) => {
    const MAX_RETRIES = 2
    
    // Si forceRefresh, ignorer le cache
    if (!forceRefresh && useCache) {
      // 1. Vérifier le cache en mémoire d'abord
      const cached = roleCache.get(userId)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('[Auth] Role from memory cache:', cached.role)
        setRole(cached.role)
        setLoading(false)
        return
      }

      // 2. Vérifier le cache localStorage
      const localStorageCache = loadRoleCacheFromStorage(userId)
      if (localStorageCache !== null) {
        console.log('[Auth] Role from localStorage cache:', localStorageCache)
        setRole(localStorageCache)
        setLoading(false)
        // Mettre à jour le cache en mémoire
        roleCache.set(userId, { role: localStorageCache, timestamp: Date.now() })
        return
      }
    }

    try {
      console.log('[Auth] Fetching role from database for user:', userId, `(attempt ${retryCount + 1})`)
      setLoading(true)
      
      // 3. Requête optimisée - récupérer le rôle avec timeout
      const rolePromise = supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle()

      // Timeout de 5 secondes
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      )

      const { data, error } = await Promise.race([
        rolePromise,
        timeoutPromise
      ]) as any

      if (error) {
        console.error('[Auth] Error checking user role:', error)
        
        // Retry si on n'a pas atteint le max
        if (retryCount < MAX_RETRIES) {
          console.log('[Auth] Retrying role fetch...')
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))) // Backoff exponentiel
          return checkUserRole(userId, false, false, retryCount + 1)
        }
        
        // En cas d'erreur après retry, essayer de récupérer depuis le cache même expiré
        const expiredCache = roleCache.get(userId)
        const localStorageCache = loadRoleCacheFromStorage(userId)
        
        if (expiredCache) {
          console.log('[Auth] Using expired memory cache due to error:', expiredCache.role)
          setRole(expiredCache.role)
          setLoading(false)
          return
        }
        
        if (localStorageCache) {
          console.log('[Auth] Using expired localStorage cache due to error:', localStorageCache)
          setRole(localStorageCache)
          setLoading(false)
          roleCache.set(userId, { role: localStorageCache, timestamp: Date.now() })
          return
        }
        
        // Dernier recours : rôle par défaut
        console.warn('[Auth] No cache available, defaulting to client')
        setRole('client')
        const cacheValue = { role: 'client' as UserRole, timestamp: Date.now() }
        roleCache.set(userId, cacheValue)
        saveRoleCacheToStorage(userId, 'client')
      } else {
        const userRole = (data?.role as UserRole) || 'client'
        console.log('[Auth] Role fetched from database:', userRole)
        setRole(userRole)
        // Mettre en cache (mémoire + localStorage)
        const cacheValue = { role: userRole, timestamp: Date.now() }
        roleCache.set(userId, cacheValue)
        saveRoleCacheToStorage(userId, userRole)
      }
    } catch (error: any) {
      console.error('[Auth] Exception checking user role:', error)
      
      // Retry si timeout et qu'on n'a pas atteint le max
      if (error.message === 'Timeout' && retryCount < MAX_RETRIES) {
        console.log('[Auth] Timeout, retrying...')
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
        return checkUserRole(userId, false, false, retryCount + 1)
      }
      
      // En cas d'exception, essayer le cache expiré
      const expiredCache = roleCache.get(userId)
      const localStorageCache = loadRoleCacheFromStorage(userId)
      
      if (expiredCache) {
        console.log('[Auth] Using expired memory cache due to exception:', expiredCache.role)
        setRole(expiredCache.role)
        setLoading(false)
        return
      }
      
      if (localStorageCache) {
        console.log('[Auth] Using expired localStorage cache due to exception:', localStorageCache)
        setRole(localStorageCache)
        setLoading(false)
        roleCache.set(userId, { role: localStorageCache, timestamp: Date.now() })
        return
      }
      
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
        // Toujours vérifier le rôle, même avec le cache
        // Le cache sera utilisé dans checkUserRole si disponible
        checkUserRole(session.user.id, true, false)
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
        // Forcer le rechargement du rôle lors d'un changement d'auth
        // Invalider le cache pour forcer une requête fraîche
        roleCache.delete(session.user.id)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('role_cache')
        }
        await checkUserRole(session.user.id, false, true)
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
  }, [supabase, checkUserRole])

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
    <AuthContext.Provider value={{ user, loading, isAdmin: role === 'admin', role, signOut, refreshRole }}>
      {children}
    </AuthContext.Provider>
  )
}
