'use client'

import Image from 'next/image'
import { useState } from 'react'

interface CategoryImageProps {
  imagePath: string | undefined
  categoryName: string
  gradient: string
  icon?: string
}

export function CategoryImage({ imagePath, categoryName, gradient, icon }: CategoryImageProps) {
  const [imageError, setImageError] = useState(false)

  if (!imagePath || imageError) {
    return (
      <div className={`h-full w-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <span className="text-6xl opacity-80">
          {icon || '📦'}
        </span>
      </div>
    )
  }

  return (
    <Image
      src={imagePath}
      alt={categoryName}
      fill
      className="object-cover group-hover:scale-110 transition-transform duration-500"
      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
      onError={() => setImageError(true)}
    />
  )
}
