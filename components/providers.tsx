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
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes (augmenté pour réduire les requêtes)
const ROLE_REFRESH_INTERVAL = 5 * 60 * 1000 // Rafraîchissement toutes les 5 minutes

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
  // Créer le client Supabase uniquement côté client
  const supabase = useMemo(() => {
    if (typeof window === 'undefined') {
      // Retourner null côté serveur - sera créé côté client
      return null as any
    }
    return createSupabaseClient()
  }, [])
  
  // useRouter doit être appelé même si on retourne tôt
  const router = useRouter()

  // Calculer isAdmin à partir du rôle (pour compatibilité)
  const isAdmin = role === 'admin'

  // Fonction pour vérifier le rôle utilisateur (définie en premier pour éviter les problèmes d'ordre)
  const checkUserRole = useCallback(async (userId: string, useCache: boolean = true, forceRefresh: boolean = false, retryCount: number = 0) => {
    const MAX_RETRIES = 2
    
    // Vérifier que supabase est disponible
    if (!supabase) {
      console.warn('[Auth] Supabase client not available')
      setLoading(false)
      return
    }
    
    // Si forceRefresh, ignorer le cache
    if (!forceRefresh && useCache) {
      // 1. Vérifier le cache en mémoire d'abord
      const cached = roleCache?.get(userId)
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
        if (roleCache) {
          roleCache.set(userId, { role: localStorageCache, timestamp: Date.now() })
        }
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
        const expiredCache = roleCache?.get(userId)
        const localStorageCache = loadRoleCacheFromStorage(userId)
        
        // Prioriser le cache admin même expiré pour éviter la perte du rôle admin
        if (expiredCache) {
          console.log('[Auth] Using expired memory cache due to error:', expiredCache.role)
          setRole(expiredCache.role)
          setLoading(false)
          // Si c'est un admin, prolonger le cache même expiré
          if (expiredCache.role === 'admin' && roleCache) {
            roleCache.set(userId, { role: expiredCache.role, timestamp: Date.now() })
            saveRoleCacheToStorage(userId, expiredCache.role)
          }
          return
        }
        
        if (localStorageCache) {
          console.log('[Auth] Using expired localStorage cache due to error:', localStorageCache)
          setRole(localStorageCache)
          setLoading(false)
          if (roleCache) {
            roleCache.set(userId, { role: localStorageCache, timestamp: Date.now() })
          }
          // Si c'est un admin, s'assurer qu'il persiste
          if (localStorageCache === 'admin') {
            saveRoleCacheToStorage(userId, localStorageCache)
          }
          return
        }
        
        // Dernier recours : rôle par défaut (mais ne pas écraser un rôle admin existant)
        console.warn('[Auth] No cache available, defaulting to client')
        // Ne pas définir 'client' si on avait un rôle admin avant (éviter la perte)
        const currentRole = role
        if (currentRole !== 'admin') {
          setRole('client')
          const cacheValue = { role: 'client' as UserRole, timestamp: Date.now() }
          if (roleCache) {
            roleCache.set(userId, cacheValue)
          }
          saveRoleCacheToStorage(userId, 'client')
        }
      } else {
        const userRole = (data?.role as UserRole) || 'client'
        console.log('[Auth] Role fetched from database:', userRole)
        setRole(userRole)
        // Mettre en cache (mémoire + localStorage)
        const cacheValue = { role: userRole, timestamp: Date.now() }
        if (roleCache) {
          roleCache.set(userId, cacheValue)
        }
        saveRoleCacheToStorage(userId, userRole)
        
        // Si le rôle est admin, s'assurer qu'il persiste même en cas d'erreur future
        if (userRole === 'admin') {
          console.log('[Auth] Admin role confirmed, ensuring persistence')
        }
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
      const expiredCache = roleCache?.get(userId)
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

  // Fonction pour forcer le rechargement du rôle (définie après checkUserRole)
  const refreshRole = useCallback(async () => {
    if (user?.id) {
      console.log('[Auth] Force refreshing role for user:', user.id)
      if (roleCache) {
        roleCache.delete(user.id)
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem('role_cache')
      }
      await checkUserRole(user.id, false, true)
    }
  }, [user, checkUserRole])

  useEffect(() => {
    // Ne rien faire si supabase n'est pas disponible (côté serveur)
    if (!supabase) return
    
    let mounted = true
    let roleRefreshInterval: NodeJS.Timeout | null = null

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
        
        // Configurer le rafraîchissement périodique du rôle (toutes les 5 minutes)
        // Cela garantit que le rôle admin ne disparaît pas
        roleRefreshInterval = setInterval(() => {
          if (!mounted) return
          // Utiliser une fonction pour obtenir l'utilisateur actuel depuis l'état
          supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
            if (!mounted || !currentUser) return
            console.log('[Auth] Periodic role refresh for user:', currentUser.id)
            // Vérifier si le cache est expiré ou proche de l'expiration
            const cached = roleCache?.get(currentUser.id)
            const cacheExpired = !cached || (Date.now() - cached.timestamp) >= CACHE_DURATION * 0.8 // Rafraîchir à 80% de la durée
            
            if (cacheExpired) {
              console.log('[Auth] Cache expired or expiring soon, refreshing role')
              checkUserRole(currentUser.id, false, true)
            } else {
              // Même si le cache est valide, vérifier périodiquement pour s'assurer que le rôle n'a pas changé
              // Utiliser le cache mais forcer une vérification en arrière-plan
              checkUserRole(currentUser.id, true, false)
            }
          }).catch(err => {
            console.error('[Auth] Error getting user for periodic refresh:', err)
          })
        }, ROLE_REFRESH_INTERVAL) // Toutes les 5 minutes
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

      // Nettoyer l'intervalle précédent
      if (roleRefreshInterval) {
        clearInterval(roleRefreshInterval)
        roleRefreshInterval = null
      }

      setUser(session?.user ?? null)
      if (session?.user) {
        // Forcer le rechargement du rôle lors d'un changement d'auth
        // Invalider le cache pour forcer une requête fraîche
        if (roleCache) {
          roleCache.delete(session.user.id)
        }
        if (typeof window !== 'undefined') {
          localStorage.removeItem('role_cache')
        }
        await checkUserRole(session.user.id, false, true)
        
        // Configurer le rafraîchissement périodique pour le nouvel utilisateur
        roleRefreshInterval = setInterval(() => {
          if (!mounted) return
          // Utiliser une fonction pour obtenir l'utilisateur actuel depuis l'état
          supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
            if (!mounted || !currentUser) return
            console.log('[Auth] Periodic role refresh for user:', currentUser.id)
            const cached = roleCache?.get(currentUser.id)
            const cacheExpired = !cached || (Date.now() - cached.timestamp) >= CACHE_DURATION * 0.8
            
            if (cacheExpired) {
              console.log('[Auth] Cache expired or expiring soon, refreshing role')
              checkUserRole(currentUser.id, false, true)
            } else {
              checkUserRole(currentUser.id, true, false)
            }
          }).catch(err => {
            console.error('[Auth] Error getting user for periodic refresh:', err)
          })
        }, ROLE_REFRESH_INTERVAL) // Toutes les 5 minutes
      } else {
        setRole(null)
        setLoading(false)
        // Nettoyer le cache
        if (roleCache) {
          roleCache.clear()
        }
        if (typeof window !== 'undefined') {
          localStorage.removeItem('role_cache')
        }
      }
    })

    // Rafraîchir le rôle quand la fenêtre reprend le focus (utilisateur revient sur l'onglet)
    const handleFocus = () => {
      if (!mounted || !supabase) return
      supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
        if (!mounted || !currentUser) return
        const cached = roleCache?.get(currentUser.id)
        // Si le cache est expiré ou proche de l'expiration, rafraîchir
        if (!cached || (Date.now() - cached.timestamp) >= CACHE_DURATION * 0.7) {
          console.log('[Auth] Window focused, refreshing role if needed')
          checkUserRole(currentUser.id, false, true)
        }
      }).catch(err => {
        console.error('[Auth] Error getting user on focus:', err)
      })
    }

    // Écouter les événements de focus de la fenêtre
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus)
    }

    return () => {
      mounted = false
      subscription.unsubscribe()
      if (roleRefreshInterval) {
        clearInterval(roleRefreshInterval)
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleFocus)
      }
    }
  }, [supabase, checkUserRole])

  // Si supabase n'est pas disponible (côté serveur), ne rien rendre
  if (!supabase) {
    return <>{children}</>
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setRole(null)
      // Nettoyer les caches
      if (roleCache) {
        roleCache.clear()
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem('role_cache')
      }
      if (router) {
        router.push('/')
        router.refresh()
      } else if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
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
