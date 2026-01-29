import Link from 'next/link'
import type { Category } from '@/lib/categories'
import { CategoryImage } from './category-image'

interface CategoryGridProps {
  categories: Category[]
}

// Mapping des catégories vers des images représentatives
const categoryImages: Record<string, string> = {
  'telephones': '/categories/phones.jpg',
  'smartphones': '/categories/smartphones.jpg',
  'ordinateurs': '/categories/laptops.jpg',
  'tablettes': '/categories/tablets.jpg',
  'accessoires': '/categories/accessories.jpg',
  'pieces-detachees': '/categories/parts.jpg',
  'televiseurs': '/categories/tv.jpg',
  'appareils-electroniques': '/categories/electronics.jpg',
  'ecouteurs-audio': '/categories/audio.jpg',
  'services': '/categories/services.jpg',
}

// Fallback images avec gradients colorés par catégorie
const categoryGradients: Record<string, string> = {
  'telephones': 'from-blue-500 to-blue-600',
  'smartphones': 'from-purple-500 to-purple-600',
  'ordinateurs': 'from-indigo-500 to-indigo-600',
  'tablettes': 'from-pink-500 to-pink-600',
  'accessoires': 'from-orange-500 to-orange-600',
  'pieces-detachees': 'from-gray-500 to-gray-600',
  'televiseurs': 'from-red-500 to-red-600',
  'appareils-electroniques': 'from-green-500 to-green-600',
  'ecouteurs-audio': 'from-yellow-500 to-yellow-600',
  'services': 'from-cyan-500 to-cyan-600',
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  // Filtrer uniquement les catégories principales (sans parent)
  const mainCategories = categories.filter((cat) => cat.parent_id === null)

  if (mainCategories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucune catégorie disponible pour le moment.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
      {mainCategories.map((category, index) => {
        const categorySlug = category.slug || category.key || ''
        const imagePath = categoryImages[categorySlug.toLowerCase()]
        const gradient = categoryGradients[categorySlug.toLowerCase()] || 'from-primary-500 to-primary-600'
        
        return (
          <Link
            key={category.id}
            href={`/catalog?category=${categorySlug}`}
            className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            style={{ animationDelay: `${index * 0.1}s` }}
            aria-label={`Voir les produits de la catégorie ${category.name}`}
          >
            {/* Image de fond ou gradient */}
            <div className="relative h-32 sm:h-40 md:h-48 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 group">
              <CategoryImage
                imagePath={imagePath}
                categoryName={category.name}
                gradient={gradient}
                icon={category.icon}
              />
              
              {/* Overlay au survol */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
              
              {/* Badge icône si pas d'image */}
              {category.icon && !imagePath && (
                <div className="absolute top-3 right-3 text-3xl opacity-90 transform group-hover:scale-110 transition-transform duration-300 z-10">
                  {category.icon}
                </div>
              )}
            </div>

            {/* Contenu de la carte */}
            <div className="p-3 sm:p-4 md:p-6 bg-white">
              <h3 className="font-black text-gray-900 text-sm sm:text-base md:text-lg mb-1 sm:mb-2 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mb-2 sm:mb-3 hidden sm:block">
                  {category.description}
                </p>
              )}
              
              {/* Ligne de progression au survol */}
              <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300 rounded-full" aria-hidden="true" />
              
              {/* Texte "Explorer" au survol */}
              <div className="mt-2 sm:mt-4 text-xs sm:text-sm font-semibold text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 hidden sm:flex">
                Explorer
                <svg className="w-3 h-3 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
