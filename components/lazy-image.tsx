'use client'

import Image from 'next/image'
import { useState } from 'react'

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  fill,
  className = '',
  priority = false,
  sizes,
  quality = 85,
}: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-xs">Image non disponible</span>
      </div>
    )
  }

  const imageProps = fill
    ? {
        fill: true,
        sizes: sizes || '(max-width: 768px) 100vw, 50vw',
      }
    : {
        width: width || 400,
        height: height || 400,
      }

  return (
    <div className={`relative ${isLoading ? 'bg-gray-200 animate-pulse' : ''} ${className}`}>
      <Image
        src={src}
        alt={alt}
        {...imageProps}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        priority={priority}
        quality={quality}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
        }}
      />
    </div>
  )
}
