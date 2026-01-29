'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

interface BackButtonProps {
  href?: string
  label?: string
  className?: string
}

export function BackButton({ href, label = 'Retour', className = '' }: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`
        flex items-center gap-2 text-gray-600 hover:text-primary-600
        font-medium transition-colors mb-4
        ${className}
      `}
      aria-label={label}
    >
      <ArrowLeftIcon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  )
}
