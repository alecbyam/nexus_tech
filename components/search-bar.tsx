'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers'
import { useSessionId } from '@/lib/hooks/use-session-id'

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
  const debouncedSearch = useDebounce(search, 500) // Debounce de 500ms

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

        await supabase.from('search_queries').insert({
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
