import Link from 'next/link'
import type { Category } from '@/lib/categories'
import { CategoryIcon } from './category-icon'

interface CategoryGridProps {
  categories: Category[]
}

// Mapping des catégories vers des icônes SVG et gradients
const categoryIcons: Record<string, React.ReactNode> = {}
const categoryGradients: Record<string, string> = {
  'telephones': 'from-blue-500 to-indigo-600',
  'smartphones': 'from-blue-500 to-indigo-600', // Fusionné avec téléphones
  'phones': 'from-blue-500 to-indigo-600', // Catégorie unifiée
  'ordinateurs': 'from-indigo-500 to-purple-600',
  'computers': 'from-indigo-500 to-purple-600',
  'laptops': 'from-indigo-500 to-purple-600',
  'tablettes': 'from-pink-500 to-rose-600',
  'tablets': 'from-pink-500 to-rose-600',
  'accessoires': 'from-orange-500 to-amber-600',
  'accessories': 'from-orange-500 to-amber-600',
  'pieces-detachees': 'from-gray-500 to-slate-600',
  'parts': 'from-gray-500 to-slate-600',
  'televiseurs': 'from-red-500 to-pink-600',
  'tv': 'from-red-500 to-pink-600',
  'appareils-electroniques': 'from-green-500 to-emerald-600',
  'electronics': 'from-green-500 to-emerald-600',
  'ecouteurs-audio': 'from-yellow-500 to-orange-600',
  'audio': 'from-yellow-500 to-orange-600',
  'headphones': 'from-yellow-500 to-orange-600',
  'services': 'from-cyan-500 to-blue-600',
  'services': 'from-cyan-500 to-blue-600',
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  // Filtrer uniquement les catégories principales (sans parent)
  // Fusionner smartphones et telephones en une seule catégorie
  const mainCategories = categories
    .filter((cat) => cat.parent_id === null)
    .map((cat) => {
      // Normaliser les noms de catégories téléphones/smartphones
      const key = (cat.key || '').toLowerCase()
      const slug = (cat.slug || '').toLowerCase()
      const name = cat.name || ''
      
      // Si c'est une catégorie téléphone ou smartphone, unifier
      if (key.includes('phone') || key.includes('smartphone') || key.includes('telephone') || 
          slug.includes('phone') || slug.includes('smartphone') || slug.includes('telephone') ||
          name.toLowerCase().includes('téléphone') || name.toLowerCase().includes('smartphone')) {
        return {
          ...cat,
          key: 'phones',
          slug: 'phones',
          name: 'Téléphones & Smartphones',
        }
      }
      return cat
    })
    // Supprimer les doublons après fusion
    .filter((cat, index, self) => 
      index === self.findIndex((c) => 
        (c.key === cat.key && c.slug === cat.slug) || 
        (c.id === cat.id)
      )
    )

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
        const categoryKey = category.key || categorySlug
        const gradient = categoryGradients[categoryKey.toLowerCase()] || categoryGradients[categorySlug.toLowerCase()] || 'from-primary-500 to-primary-600'
        
        return (
          <Link
            key={category.id}
            href={`/catalog?category=${categorySlug}`}
            className="group relative bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.03] hover:-translate-y-2 border border-gray-100/50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 animate-slide-up"
            style={{ animationDelay: `${index * 0.05}s` }}
            aria-label={`Voir les produits de la catégorie ${category.name}`}
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/10 group-hover:to-indigo-500/10 transition-all duration-500 z-0"></div>
            
            {/* Zone avec icône et gradient */}
            <div className={`relative h-32 sm:h-40 md:h-48 w-full overflow-hidden bg-gradient-to-br ${gradient} group-hover:opacity-90 transition-all duration-500 flex items-center justify-center`}>
              {/* Icône SVG centrée avec ombre pour meilleure visibilité */}
              <div className="text-white drop-shadow-lg group-hover:drop-shadow-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 z-10">
                <CategoryIcon 
                  categoryKey={categoryKey} 
                  categoryName={category.name || ''}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 stroke-2"
                />
              </div>
              
              {/* Overlay au survol avec effet de brillance */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </div>

            {/* Contenu de la carte */}
            <div className="p-3 sm:p-4 md:p-6 bg-white/95 backdrop-blur-sm relative z-10">
              <h3 className="font-black text-gray-900 text-sm sm:text-base md:text-lg mb-1 sm:mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300 line-clamp-2">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mb-2 sm:mb-3 hidden sm:block group-hover:text-gray-600 transition-colors">
                  {category.description}
                </p>
              )}
              
              {/* Ligne de progression au survol avec gradient */}
              <div className="h-1.5 w-0 group-hover:w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500 rounded-full shadow-lg shadow-blue-500/50" aria-hidden="true" />
              
              {/* Texte "Explorer" au survol */}
              <div className="mt-2 sm:mt-4 text-xs sm:text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 hidden sm:flex">
                Explorer
                <svg className="w-3 h-3 sm:w-4 sm:h-4 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
