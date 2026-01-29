'use client'

import { LoadingSpinner } from './loading-spinner'

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
}

export function LoadingOverlay({ isLoading, message }: LoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 min-w-[200px]">
        <LoadingSpinner />
        {message && (
          <p className="text-gray-700 font-medium">{message}</p>
        )}
      </div>
    </div>
  )
}
