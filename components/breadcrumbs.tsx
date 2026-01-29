'use client'

import Link from 'next/link'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'
import { usePathname } from 'next/navigation'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const pathname = usePathname()
  
  // Générer automatiquement les breadcrumbs depuis le pathname si non fournis
  const breadcrumbs = items || generateBreadcrumbs(pathname)

  if (breadcrumbs.length === 0) return null

  return (
    <nav 
      aria-label="Fil d'Ariane" 
      className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm mb-4 sm:mb-6 overflow-x-auto ${className}`}
    >
      <Link
        href="/"
        className="flex items-center gap-1 text-gray-500 hover:text-primary-600 transition-colors"
        aria-label="Accueil"
      >
        <HomeIcon className="w-4 h-4" />
      </Link>
      
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1
        
        return (
          <div key={index} className="flex items-center gap-2">
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            {isLast || !item.href ? (
              <span 
                className={`font-medium ${
                  isLast ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-gray-500 hover:text-primary-600 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []
  
  let currentPath = ''
  
  paths.forEach((path, index) => {
    currentPath += `/${path}`
    
    // Mapper les chemins à des labels lisibles
    const label = formatPathLabel(path)
    
    breadcrumbs.push({
      label,
      href: index < paths.length - 1 ? currentPath : undefined,
    })
  })
  
  return breadcrumbs
}

function formatPathLabel(path: string): string {
  const labels: Record<string, string> = {
    catalog: 'Catalogue',
    cart: 'Panier',
    orders: 'Mes commandes',
    auth: 'Connexion',
    profile: 'Mon profil',
    admin: 'Administration',
    products: 'Produits',
    categories: 'Catégories',
    coupons: 'Codes promo',
    wishlist: 'Favoris',
    compare: 'Comparer',
  }
  
  // Si c'est un ID (UUID), essayer de déterminer le contexte
  if (path.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    return 'Détails'
  }
  
  return labels[path] || path.charAt(0).toUpperCase() + path.slice(1)
}
