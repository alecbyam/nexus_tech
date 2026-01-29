'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers'
import { useSessionId } from '@/lib/hooks/use-session-id'
import { SearchSuggestions } from '@/components/search-suggestions'

interface SearchBarProps {
  initialSearch?: string
  initialCategory?: string
}

export function SearchBar({ initialSearch, initialCategory }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const sessionId = useSessionId()
  const supabase = createSupabaseClient()
  const [search, setSearch] = useState(initialSearch || '')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debouncedSearch = useDebounce(search, 500) // Debounce de 500ms
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fermer les suggestions quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Mettre à jour l'URL automatiquement après le debounce
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (debouncedSearch.trim()) {
      params.set('search', debouncedSearch.trim())
    } else {
      params.delete('search')
    }

    // Ne pas naviguer si c'est le chargement initial
    if (debouncedSearch !== initialSearch) {
      router.push(`/catalog?${params.toString()}`, { scroll: false })
    }
  }, [debouncedSearch, router, searchParams, initialSearch])

  // Track search queries
  useEffect(() => {
    const trackSearch = async () => {
      if (!debouncedSearch.trim() || debouncedSearch === initialSearch) return

      try {
        // Compter les résultats (approximatif)
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
          .ilike('name', `%${debouncedSearch.trim()}%`)

        await (supabase.from('search_queries') as any).insert({
          query: debouncedSearch.trim(),
          category_slug: initialCategory || null,
          results_count: count || 0,
          user_id: user?.id || null,
          session_id: sessionId || null,
        })
      } catch (error) {
        // Silently fail - tracking is not critical
        console.error('Error tracking search:', error)
      }
    }

    trackSearch()
  }, [debouncedSearch, initialCategory, user?.id, sessionId, supabase, initialSearch])

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
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
      <div className="flex-1 relative" ref={containerRef}>
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Rechercher un produit..."
          className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl bg-white/90 backdrop-blur-sm text-sm sm:text-base focus:bg-white"
          aria-label="Rechercher un produit"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
        />
        <MagnifyingGlassIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        {showSuggestions && (
          <SearchSuggestions
            query={search}
            onSelect={() => setShowSuggestions(false)}
          />
        )}
      </div>
      <button
        type="submit"
        className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-bold shadow-xl hover:shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 active:scale-95 text-sm sm:text-base whitespace-nowrap overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-2">
          Rechercher
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </button>
    </form>
  )
}
