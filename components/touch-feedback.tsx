'use client'

import { ReactNode, useState } from 'react'

interface TouchFeedbackProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export function TouchFeedback({ 
  children, 
  className = '', 
  onClick,
  disabled = false 
}: TouchFeedbackProps) {
  const [isPressed, setIsPressed] = useState(false)

  return (
    <div
      className={`
        transition-all duration-150
        ${isPressed && !disabled ? 'scale-95 opacity-80' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => !disabled && setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </div>
  )
}
