'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './providers'

interface AdminGuardProps {
  children: React.ReactNode
}

/**
 * Composant de protection optimisé pour les pages admin
 * Évite les re-renders inutiles et les redirections multiples
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Ne rediriger que si le chargement est terminé ET que l'utilisateur n'est pas admin
    if (!loading && (!user || !isAdmin)) {
      router.push('/')
    }
  }, [user, isAdmin, loading, router])

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Ne rien afficher si l'utilisateur n'est pas admin (redirection en cours)
  if (!user || !isAdmin) {
    return null
  }

  return <>{children}</>
}
