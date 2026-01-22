import Link from 'next/link'
import type { Database } from '@/types/database.types'

type Category = Database['public']['Tables']['categories']['Row']

const categoryIcons: Record<string, string> = {
  phones: '📱',
  computers: '💻',
  accessories: '🎧',
  services: '🔧',
  wearables: '⌚',
  cameras: '📷',
  storage: '💾',
  electronics: '⚡',
}

interface CategoryGridProps {
  categories: Category[]
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {categories.map((category, index) => (
        <Link
          key={category.id}
          href={`/catalog?category=${category.key}`}
          className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 text-center card-hover border border-gray-100"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
            {categoryIcons[category.key] || '📦'}
          </div>
          <h3 className="font-bold text-gray-900 text-lg group-hover:text-primary-500 transition-colors duration-200">
            {category.name}
          </h3>
          <div className="mt-4 h-1 w-0 group-hover:w-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300 mx-auto rounded-full" />
        </Link>
      ))}
    </div>
  )
}

