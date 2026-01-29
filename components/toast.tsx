'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (message: string, type?: ToastType, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    // Pendant le SSR ou si le provider n'est pas monté, retourner une fonction no-op
    if (typeof window === 'undefined') {
      return {
        toasts: [],
        showToast: () => {},
        removeToast: () => {},
      }
    }
    // En développement, afficher un avertissement mais ne pas crasher
    if (process.env.NODE_ENV === 'development') {
      console.warn('useToast called outside ToastProvider - returning no-op')
    }
    return {
      toasts: [],
      showToast: () => {},
      removeToast: () => {},
    }
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 5000) => {
    const id = Math.random().toString(36).substring(7)
    const newToast: Toast = { id, message, type, duration }
    
    setToasts((prev) => [...prev, newToast])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none max-w-md w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const icons = {
    success: CheckCircleIcon,
    error: ExclamationTriangleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
  }

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  }

  const Icon = icons[toast.type]

  return (
    <div
      className={`
        ${colors[toast.type]}
        border-2 rounded-xl shadow-xl p-4 flex items-start gap-3
        animate-slide-in pointer-events-auto
        backdrop-blur-sm
      `}
      role="alert"
      aria-live="polite"
    >
      <Icon className={`w-6 h-6 flex-shrink-0 ${iconColors[toast.type]}`} />
      <p className="flex-1 font-medium text-sm leading-relaxed">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Fermer la notification"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  )
}
