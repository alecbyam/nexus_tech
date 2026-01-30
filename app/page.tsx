import Link from 'next/link'
import { getCategories } from '@/lib/services/categories'
import { CategoryGrid } from '@/components/category-grid'
import { Header } from '@/components/header'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/loading-spinner'
import { ProductGridSkeleton } from '@/components/skeleton-loader'
import { getProducts } from '@/lib/services/products'

// Cache les catégories pendant 60 secondes
export const revalidate = 60

async function CategoriesSection() {
  const categories = await getCategories()
  return <CategoryGrid categories={categories || []} />
}

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-400/10 rounded-full blur-3xl"></div>
      </div>
      
      <Header />
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16 animate-slide-up">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-100/80 backdrop-blur-sm rounded-full border border-blue-200/50">
            <span className="text-sm font-semibold text-blue-700">✨ Nouvelle collection disponible</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
            Bienvenue chez{' '}
            <span className="gradient-text block sm:inline">NEXUS TECH</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4">
            Votre destination tech de confiance : smartphones, ordinateurs, accessoires et services de qualité
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/catalog"
              className="group relative inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Découvrir le catalogue
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            <Link
              href="/catalog?category=phones"
              className="inline-flex items-center justify-center bg-white/80 backdrop-blur-sm text-gray-900 px-6 py-4 rounded-2xl font-semibold text-base sm:text-lg border-2 border-gray-200 hover:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Voir les téléphones
            </Link>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mb-6 sm:mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2">
              Nos <span className="gradient-text">catégories</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
              Explorez notre sélection de produits tech soigneusement sélectionnés
            </p>
          </div>
          <Suspense fallback={<LoadingSpinner size="lg" text="Chargement des catégories..." />}>
            <CategoriesSection />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
