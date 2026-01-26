'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, type UserRole } from './providers'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  redirectTo?: string
}

/**
 * Composant de protection basé sur les rôles
 * Permet d'accéder à une page seulement si l'utilisateur a un des rôles autorisés
 */
export function RoleGuard({ 
  children, 
  allowedRoles, 
  redirectTo = '/' 
}: RoleGuardProps) {
  const { user, loading, role } = useAuth()
  const router = useRouter()

  // Vérifier si l'utilisateur a un rôle autorisé
  const isAuthorized = useMemo(() => {
    if (loading || !user || !role) return false
    return allowedRoles.includes(role)
  }, [loading, user, role, allowedRoles])

  const shouldRedirect = useMemo(() => {
    return !loading && (!user || !role || !allowedRoles.includes(role))
  }, [loading, user, role, allowedRoles])

  useEffect(() => {
    if (shouldRedirect) {
      router.push(redirectTo)
    }
  }, [shouldRedirect, router, redirectTo])

  // Afficher un loader pendant le chargement
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

  // Ne rien afficher si l'utilisateur n'est pas autorisé (redirection en cours)
  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}

/**
 * Guard pour les admins uniquement (compatibilité avec AdminGuard)
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['admin']}>{children}</RoleGuard>
}

/**
 * Guard pour les staff et admin
 */
export function StaffGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['staff', 'admin']}>{children}</RoleGuard>
}

/**
 * Guard pour les tech et admin
 */
export function TechGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['tech', 'admin']}>{children}</RoleGuard>
}
