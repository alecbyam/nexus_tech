'use client'

import { ReactNode } from 'react'
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface FormFieldProps {
  label: string
  htmlFor?: string
  required?: boolean
  error?: string
  success?: boolean
  hint?: string
  children: ReactNode
  className?: string
}

export function FormField({
  label,
  htmlFor,
  required = false,
  error,
  success = false,
  hint,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-semibold text-gray-700 mb-2"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {children}
        
        {error && (
          <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
            <ExclamationCircleIcon className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
        
        {success && !error && (
          <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
            <CheckCircleIcon className="w-4 h-4" />
            <span>Valide</span>
          </div>
        )}
      </div>
      
      {hint && !error && (
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
      )}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  success?: boolean
}

export function Input({ error, success, className = '', ...props }: InputProps) {
  const baseClasses = 'w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:outline-none transition-all duration-200'
  const stateClasses = error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50'
    : success
    ? 'border-green-300 focus:border-green-500 focus:ring-green-200 bg-green-50'
    : 'border-gray-200 focus:border-primary-500 focus:ring-primary-200 bg-white hover:border-gray-300'
  
  return (
    <input
      className={`${baseClasses} ${stateClasses} ${className}`}
      {...props}
    />
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
  success?: boolean
}

export function Textarea({ error, success, className = '', ...props }: TextareaProps) {
  const baseClasses = 'w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:outline-none transition-all duration-200 resize-none'
  const stateClasses = error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50'
    : success
    ? 'border-green-300 focus:border-green-500 focus:ring-green-200 bg-green-50'
    : 'border-gray-200 focus:border-primary-500 focus:ring-primary-200 bg-white hover:border-gray-300'
  
  return (
    <textarea
      className={`${baseClasses} ${stateClasses} ${className}`}
      {...props}
    />
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  success?: boolean
}

export function Select({ error, success, className = '', children, ...props }: SelectProps) {
  const baseClasses = 'w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:outline-none transition-all duration-200 bg-white'
  const stateClasses = error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50'
    : success
    ? 'border-green-300 focus:border-green-500 focus:ring-green-200 bg-green-50'
    : 'border-gray-200 focus:border-primary-500 focus:ring-primary-200 hover:border-gray-300'
  
  return (
    <select
      className={`${baseClasses} ${stateClasses} ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}
