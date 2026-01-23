import { useEffect, useState } from 'react'

/**
 * Hook pour générer et maintenir un ID de session unique
 */
export function useSessionId(): string | null {
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    // Récupérer ou créer un ID de session
    let id = sessionStorage.getItem('session_id')
    if (!id) {
      id = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
      sessionStorage.setItem('session_id', id)
    }
    setSessionId(id)
  }, [])

  return sessionId
}
