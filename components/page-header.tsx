'use client'

import { ReactNode } from 'react'
import { Breadcrumbs } from './breadcrumbs'

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: Array<{ label: string; href?: string }>
  actions?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`mb-8 ${className}`}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-1 sm:mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm sm:text-base md:text-lg text-gray-600">{subtitle}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
