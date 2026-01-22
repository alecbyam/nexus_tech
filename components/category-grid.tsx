import Link from 'next/link'
import type { Category } from '@/lib/categories'

interface CategoryGridProps {
  categories: Category[]
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  // Filtrer uniquement les catégories principales (sans parent)
  const mainCategories = categories.filter((cat) => cat.parent_id === null)

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {mainCategories.map((category, index) => (
        <Link
          key={category.id}
          href={`/catalog?category=${category.slug}`}
          className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 text-center card-hover border border-gray-100"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
            {category.icon || '📦'}
          </div>
          <h3 className="font-bold text-gray-900 text-lg group-hover:text-primary-500 transition-colors duration-200">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
              {category.description}
            </p>
          )}
          <div className="mt-4 h-1 w-0 group-hover:w-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300 mx-auto rounded-full" />
        </Link>
      ))}
    </div>
  )
}

