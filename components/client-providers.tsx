'use client'

import { ToastProvider } from './toast'
import { ScrollToTop } from './scroll-to-top'
import { useEffect, useState } from 'react'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Attendre que le composant soit monté côté client pour éviter les erreurs d'hydratation
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ToastProvider>
      {children}
      <ScrollToTop />
    </ToastProvider>
  )
}
