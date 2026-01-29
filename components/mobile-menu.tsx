'use client'

import { useEffect, useRef } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useAuth } from './providers'
import { useCartStore } from '@/store/cart-store'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user, isAdmin, signOut } = useAuth()
  const itemCount = useCartStore((state) => state.itemCount)
  const menuRef = useRef<HTMLDivElement>(null)

  // Fermer le menu en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      // Empêcher le scroll du body quand le menu est ouvert
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Fermer le menu avec la touche Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Menu */}
      <div
        ref={menuRef}
        className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out animate-slide-in-from-right overflow-y-auto"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Fermer le menu"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-2">
            <Link
              href="/"
              onClick={onClose}
              className="block px-4 py-3 rounded-xl hover:bg-primary-50 text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Accueil
            </Link>
            
            <Link
              href="/catalog"
              onClick={onClose}
              className="block px-4 py-3 rounded-xl hover:bg-primary-50 text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Catalogue
            </Link>

            {user && (
              <>
                <div className="my-4 border-t border-gray-200" />
                
                <Link
                  href="/wishlist"
                  onClick={onClose}
                  className="block px-4 py-3 rounded-xl hover:bg-primary-50 text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Favoris
                </Link>
                
                <Link
                  href="/compare"
                  onClick={onClose}
                  className="block px-4 py-3 rounded-xl hover:bg-primary-50 text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Comparer
                </Link>
                
                <Link
                  href="/orders"
                  onClick={onClose}
                  className="block px-4 py-3 rounded-xl hover:bg-primary-50 text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Mes commandes
                </Link>
                
                {isAdmin && (
                  <>
                    <div className="my-4 border-t border-gray-200" />
                    <Link
                      href="/admin"
                      onClick={onClose}
                      className="block px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 font-semibold transition-colors"
                    >
                      Administration
                    </Link>
                  </>
                )}
              </>
            )}

            <div className="my-4 border-t border-gray-200" />
            
            <Link
              href="/cart"
              onClick={onClose}
              className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-primary-50 text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              <span>Panier</span>
              {itemCount > 0 && (
                <span className="bg-primary-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 space-y-3">
            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={onClose}
                  className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  Mon profil
                </Link>
                <button
                  onClick={() => {
                    onClose()
                    signOut()
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors"
                >
                  Se déconnecter
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                onClick={onClose}
                className="block w-full text-center px-4 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold hover:from-primary-600 hover:to-primary-700 transition-all"
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
