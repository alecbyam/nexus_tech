'use client'

// Ce fichier est conservé pour compatibilité
// Utilisez RoleGuard depuis components/RoleGuard.tsx pour de nouvelles pages
import { RoleGuard } from './RoleGuard'

/**
 * Composant de protection pour les pages admin
 * @deprecated Utilisez RoleGuard avec allowedRoles={['admin']} à la place
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['admin']}>{children}</RoleGuard>
}
