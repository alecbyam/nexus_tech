'use client'

import Link from 'next/link'
import { useAuth } from './providers'
import { ShoppingCartIcon, UserIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { useCartStore } from '@/store/cart-store'
import { useState } from 'react'

export function Header() {
  const { user, loading, isAdmin } = useAuth()
  const itemCount = useCartStore((state) => state.itemCount)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="text-3xl font-black gradient-text">
            NEXUS TECH
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/catalog"
              className="text-gray-700 hover:text-primary-500 font-medium transition-all duration-200 hover:scale-105"
            >
              Catalogue
            </Link>

            {user && (
              <>
                <Link
                  href="/orders"
                  className="text-gray-700 hover:text-primary-500 font-medium transition-all duration-200 hover:scale-105"
                >
                  Mes commandes
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-gray-700 hover:text-primary-500 font-medium transition-all duration-200 hover:scale-105"
                  >
                    Admin
                  </Link>
                )}
              </>
            )}

            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-primary-500 transition-all duration-200 hover:bg-primary-50 rounded-lg"
            >
              <ShoppingCartIcon className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
                  {itemCount}
                </span>
              )}
            </Link>

            {loading ? (
              <div className="w-6 h-6 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
            ) : user ? (
              <Link
                href="/profile"
                className="p-2 text-gray-700 hover:text-primary-500 transition-all duration-200 hover:bg-primary-50 rounded-lg"
              >
                <UserIcon className="w-6 h-6" />
              </Link>
            ) : (
              <Link
                href="/auth"
                className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2.5 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Connexion
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-primary-500 transition-colors"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-100 animate-slide-in">
            <div className="flex flex-col gap-4">
              <Link
                href="/catalog"
                className="text-gray-700 hover:text-primary-500 font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Catalogue
              </Link>
              {user && (
                <>
                  <Link
                    href="/orders"
                    className="text-gray-700 hover:text-primary-500 font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mes commandes
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="text-gray-700 hover:text-primary-500 font-medium py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                </>
              )}
              <Link
                href="/cart"
                className="text-gray-700 hover:text-primary-500 font-medium py-2 flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Panier {itemCount > 0 && `(${itemCount})`}
              </Link>
              {!user && (
                <Link
                  href="/auth"
                  className="bg-primary-500 text-white px-6 py-2.5 rounded-lg text-center font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Connexion
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

