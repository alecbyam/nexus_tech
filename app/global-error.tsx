'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-black text-gray-900 mb-4">
              Erreur Critique
            </h1>
            <p className="text-gray-600 mb-8">
              {error.message || 'Une erreur critique s\'est produite'}
            </p>
            <button
              onClick={reset}
              className="bg-primary-500 text-white px-6 py-3 rounded-xl hover:bg-primary-600 transition-colors font-bold"
            >
              Réessayer
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
