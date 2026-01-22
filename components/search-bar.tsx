'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface SearchBarProps {
  initialSearch?: string
  initialCategory?: string
}

export function SearchBar({ initialSearch, initialCategory }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(initialSearch || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (search.trim()) {
      params.set('search', search.trim())
    } else {
      params.delete('search')
    }
    router.push(`/catalog?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="flex-1 relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un produit..."
          className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 shadow-sm hover:shadow-md bg-white"
        />
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>
      <button
        type="submit"
        className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-3.5 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        Rechercher
      </button>
    </form>
  )
}

