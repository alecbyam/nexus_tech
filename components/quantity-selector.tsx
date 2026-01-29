'use client'

import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max,
  className = '',
  size = 'md',
}: QuantitySelectorProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  }

  const inputSizeClasses = {
    sm: 'w-16 text-sm',
    md: 'w-20 text-base',
    lg: 'w-24 text-lg',
  }

  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }

  const handleIncrease = () => {
    if (!max || value < max) {
      onChange(value + 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || min
    const clampedValue = Math.max(min, max ? Math.min(newValue, max) : newValue)
    onChange(clampedValue)
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleDecrease}
        disabled={value <= min}
        className={`
          ${sizeClasses[size]}
          bg-gray-100 hover:bg-gray-200 
          disabled:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed
          rounded-lg font-bold transition-colors 
          flex items-center justify-center
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        `}
        aria-label="Diminuer la quantité"
      >
        <MinusIcon className="w-4 h-4" />
      </button>
      
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        className={`
          ${inputSizeClasses[size]}
          px-2 py-2 border-2 border-gray-200 rounded-lg
          focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          font-semibold text-center
          transition-all duration-200
        `}
        aria-label="Quantité"
      />
      
      <button
        type="button"
        onClick={handleIncrease}
        disabled={max !== undefined && value >= max}
        className={`
          ${sizeClasses[size]}
          bg-gray-100 hover:bg-gray-200
          disabled:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed
          rounded-lg font-bold transition-colors
          flex items-center justify-center
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        `}
        aria-label="Augmenter la quantité"
      >
        <PlusIcon className="w-4 h-4" />
      </button>
    </div>
  )
}
