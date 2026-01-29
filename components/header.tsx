'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from './providers'
import { ShoppingCartIcon, UserIcon, Bars3Icon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { useCartStore } from '@/store/cart-store'
import { useState, memo } from 'react'
import { MobileMenu } from './mobile-menu'

export const Header = memo(function Header() {
  const { user, loading, isAdmin, signOut } = useAuth()
  const itemCount = useCartStore((state) => state.itemCount)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
              <Image
                src="/logo-onatech.png"
                alt="ONATECH Logo"
                width={48}
                height={48}
                className="object-contain"
                priority
                sizes="(max-width: 640px) 40px, 48px"
                onError={(e) => {
                  // Fallback si l'image n'existe pas encore (uniquement côté client)
                  if (typeof window === 'undefined') return
                  const target = e.currentTarget as HTMLImageElement
                  target.style.display = 'none'
                  const parent = target.parentElement
                  if (parent && !parent.querySelector('.logo-fallback')) {
                    const fallback = document.createElement('div')
                    fallback.className = 'logo-fallback w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center'
                    fallback.innerHTML = '<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/></svg>'
                    parent.appendChild(fallback)
                  }
                }}
              />
            </div>
            <span className="text-xl sm:text-2xl md:text-3xl font-black gradient-text group-hover:scale-105 transition-transform">
              ONATECH
            </span>
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
                  href="/wishlist"
                  className="text-gray-700 hover:text-primary-500 font-medium transition-all duration-200 hover:scale-105"
                >
                  Favoris
                </Link>
                <Link
                  href="/compare"
                  className="text-gray-700 hover:text-primary-500 font-medium transition-all duration-200 hover:scale-105"
                >
                  Comparer
                </Link>
                <Link
                  href="/orders"
                  className="text-gray-700 hover:text-primary-500 font-medium transition-all duration-200 hover:scale-105"
                >
                  Mes commandes
                </Link>
                {isAdmin && (
                  <>
                    <Link
                      href="/admin"
                      className="text-gray-700 hover:text-primary-500 font-medium transition-all duration-200 hover:scale-105"
                    >
                      Admin
                    </Link>
                    <Link
                      href="/admin/notifications"
                      className="relative text-gray-700 hover:text-primary-500 font-medium transition-all duration-200 hover:scale-105"
                    >
                      🔔 Notifications
                    </Link>
                  </>
                )}
              </>
            )}

            <a
              href="https://wa.me/243818510311?text=Bonjour%20ONATECH,%20j%27aimerais%20vous%20contacter"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-green-600 hover:text-green-700 transition-all duration-200 hover:bg-green-50 rounded-lg"
              title="Nous contacter via WhatsApp"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </a>

            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-primary-500 transition-all duration-200 hover:bg-primary-50 rounded-lg"
              aria-label={`Panier${itemCount > 0 ? ` avec ${itemCount} article${itemCount > 1 ? 's' : ''}` : ''}`}
            >
              <ShoppingCartIcon className="w-6 h-6" />
              {itemCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse"
                  aria-label={`${itemCount} article${itemCount > 1 ? 's' : ''} dans le panier`}
                >
                  {itemCount}
                </span>
              )}
            </Link>

            {loading ? (
              <div className="w-6 h-6 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-green-700">Connecté</span>
                </div>
                <Link
                  href="/profile"
                  className="p-2 text-gray-700 hover:text-primary-500 transition-all duration-200 hover:bg-primary-50 rounded-lg"
                  title="Mon profil"
                >
                  <UserIcon className="w-6 h-6" />
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="p-2 text-gray-700 hover:text-red-500 transition-all duration-200 hover:bg-red-50 rounded-lg"
                  title="Se déconnecter"
                >
                  <ArrowRightOnRectangleIcon className="w-6 h-6" />
                </button>
              </div>
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
            className="md:hidden p-2 text-gray-700 hover:text-primary-500 transition-colors rounded-lg hover:bg-gray-100"
            aria-label="Menu mobile"
            aria-expanded={mobileMenuOpen}
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      </div>
    </header>
  )
})
