'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Oups ! Une erreur est survenue
          </h1>
          <p className="text-gray-600 mb-8">
            {error.message || 'Une erreur inattendue s\'est produite'}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={reset}
              className="bg-primary-500 text-white px-6 py-3 rounded-xl hover:bg-primary-600 transition-colors font-bold"
            >
              Réessayer
            </button>
            <Link
              href="/"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors font-bold"
            >
              Retour à l'accueil
            </Link>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8 text-left bg-gray-100 p-4 rounded-lg">
              <summary className="cursor-pointer font-semibold mb-2">
                Détails de l'erreur (développement)
              </summary>
              <pre className="text-xs overflow-auto">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </main>
    </div>
  )
}
