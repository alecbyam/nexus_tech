'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './providers'

interface AdminGuardProps {
  children: React.ReactNode
}

/**
 * Composant de protection optimisé pour les pages admin
 * Évite les re-renders inutiles et les redirections multiples
 * Utilise useMemo pour éviter les recalculs
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()

  // Mémoriser le statut d'autorisation pour éviter les recalculs
  const isAuthorized = useMemo(() => {
    return !loading && user && isAdmin
  }, [loading, user, isAdmin])

  const shouldRedirect = useMemo(() => {
    return !loading && (!user || !isAdmin)
  }, [loading, user, isAdmin])

  useEffect(() => {
    // Ne rediriger que si le chargement est terminé ET que l'utilisateur n'est pas admin
    if (shouldRedirect) {
      router.push('/')
    }
  }, [shouldRedirect, router])

  // Afficher un loader optimisé pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  // Ne rien afficher si l'utilisateur n'est pas admin (redirection en cours)
  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
