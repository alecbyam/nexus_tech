'use client'

import Link from 'next/link'
import { 
  ShoppingCartIcon, 
  HeartIcon, 
  Squares2X2Icon,
  UserIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { useAuth } from './providers'
import { useCartStore } from '@/store/cart-store'

export function QuickActions() {
  const { user } = useAuth()
  const itemCount = useCartStore((state) => state.itemCount)

  if (!user) return null

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Accès rapide</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/catalog"
          className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-primary-50 rounded-xl transition-all duration-200 hover:scale-105 group"
        >
          <Squares2X2Icon className="w-8 h-8 text-gray-600 group-hover:text-primary-600 transition-colors" />
          <span className="text-sm font-semibold text-gray-700 group-hover:text-primary-600">
            Catalogue
          </span>
        </Link>
        
        <Link
          href="/cart"
          className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-primary-50 rounded-xl transition-all duration-200 hover:scale-105 group relative"
        >
          <ShoppingCartIcon className="w-8 h-8 text-gray-600 group-hover:text-primary-600 transition-colors" />
          <span className="text-sm font-semibold text-gray-700 group-hover:text-primary-600">
            Panier
          </span>
          {itemCount > 0 && (
            <span className="absolute top-2 right-2 bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Link>
        
        <Link
          href="/wishlist"
          className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-primary-50 rounded-xl transition-all duration-200 hover:scale-105 group"
        >
          <HeartIcon className="w-8 h-8 text-gray-600 group-hover:text-primary-600 transition-colors" />
          <span className="text-sm font-semibold text-gray-700 group-hover:text-primary-600">
            Favoris
          </span>
        </Link>
        
        <Link
          href="/orders"
          className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-primary-50 rounded-xl transition-all duration-200 hover:scale-105 group"
        >
          <DocumentTextIcon className="w-8 h-8 text-gray-600 group-hover:text-primary-600 transition-colors" />
          <span className="text-sm font-semibold text-gray-700 group-hover:text-primary-600">
            Commandes
          </span>
        </Link>
      </div>
    </div>
  )
}
