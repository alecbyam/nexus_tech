'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SearchSuggestionsProps {
  query: string
  onSelect?: () => void
}

export function SearchSuggestions({ query, onSelect }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([])
      return
    }

    const fetchSuggestions = async () => {
      setLoading(true)
      try {
        // Récupérer les suggestions depuis les recherches précédentes
        const { data } = await supabase
          .from('search_queries')
          .select('query')
          .ilike('query', `%${query}%`)
          .order('created_at', { ascending: false })
          .limit(5)

        if (data) {
          const uniqueQueries = Array.from(new Set(data.map((item) => item.query)))
          setSuggestions(uniqueQueries.slice(0, 5))
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error)
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timeoutId)
  }, [query, supabase])

  if (suggestions.length === 0 || query.trim().length < 2) {
    return null
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
      {loading ? (
        <div className="p-4 text-center text-gray-500">Chargement...</div>
      ) : (
        <ul className="py-2">
          {suggestions.map((suggestion, index) => (
            <li key={index}>
              <Link
                href={`/catalog?search=${encodeURIComponent(suggestion)}`}
                onClick={onSelect}
                className="block px-4 py-3 hover:bg-primary-50 transition-colors text-gray-700 hover:text-primary-600"
              >
                <span className="font-medium">{suggestion}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
