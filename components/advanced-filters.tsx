'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface AdvancedFiltersProps {
  onFilterChange?: (filters: FilterState) => void
}

export interface FilterState {
  minPrice: string
  maxPrice: string
  condition: 'all' | 'new' | 'refurbished'
  inStock: boolean | null
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'name'
}

export function AdvancedFilters({ onFilterChange }: AdvancedFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    condition: (searchParams.get('condition') as any) || 'all',
    inStock: searchParams.get('inStock') === 'true' ? true : null,
    sortBy: (searchParams.get('sortBy') as any) || 'newest',
  })

  function handleFilterChange(key: keyof FilterState, value: any) {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)

    // Mettre à jour l'URL
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all' && value !== 'newest') {
      params.set(key, value.toString())
    } else {
      params.delete(key)
    }
    router.push(`/catalog?${params.toString()}`, { scroll: false })
  }

  function clearFilters() {
    const clearedFilters: FilterState = {
      minPrice: '',
      maxPrice: '',
      condition: 'all',
      inStock: null,
      sortBy: 'newest',
    }
    setFilters(clearedFilters)
    onFilterChange?.(clearedFilters)
    router.push('/catalog')
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-primary-600 hover:text-primary-700 font-semibold"
        >
          {showFilters ? 'Masquer les filtres' : 'Filtres avancés'}
        </button>
        {(filters.minPrice || filters.maxPrice || filters.condition !== 'all' || filters.inStock) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
          >
            <XMarkIcon className="w-4 h-4" />
            Réinitialiser
          </button>
        )}
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 grid md:grid-cols-4 gap-4">
          {/* Prix */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Prix min</label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Prix max</label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              placeholder="9999"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Condition</label>
            <select
              value={filters.condition}
              onChange={(e) => handleFilterChange('condition', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Toutes</option>
              <option value="new">Neuf</option>
              <option value="refurbished">Reconditionné</option>
            </select>
          </div>

          {/* Tri */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Trier par</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="newest">Plus récent</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="name">Nom A-Z</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
