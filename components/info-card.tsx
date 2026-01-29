'use client'

import { ReactNode } from 'react'

interface InfoCardProps {
  icon?: ReactNode
  title: string
  description?: string
  variant?: 'info' | 'success' | 'warning' | 'error'
  className?: string
}

export function InfoCard({
  icon,
  title,
  description,
  variant = 'info',
  className = '',
}: InfoCardProps) {
  const variantClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  }

  return (
    <div className={`p-4 rounded-xl border-2 ${variantClasses[variant]} ${className}`}>
      <div className="flex items-start gap-3">
        {icon && <div className="flex-shrink-0 text-xl">{icon}</div>}
        <div className="flex-1">
          <h4 className="font-bold mb-1">{title}</h4>
          {description && <p className="text-sm opacity-90">{description}</p>}
        </div>
      </div>
    </div>
  )
}
