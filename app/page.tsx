import Link from 'next/link'
import { getCategories } from '@/lib/services/categories'
import { CategoryGrid } from '@/components/category-grid'
import { Header } from '@/components/header'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/loading-spinner'

// Cache les catégories pendant 60 secondes
export const revalidate = 60

async function CategoriesSection() {
  const categories = await getCategories()
  return <CategoryGrid categories={categories || []} />
}

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-white">
      <Header />
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
            Bienvenue chez{' '}
            <span className="gradient-text">NEXUS TECH</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Votre destination tech de confiance : smartphones, ordinateurs, accessoires et services de qualité
          </p>
          <Link
            href="/catalog"
            className="inline-block bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            Découvrir le catalogue
          </Link>
        </div>

        {/* Categories Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Nos catégories
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Explorez notre sélection de produits tech
          </p>
        </div>        <Suspense fallback={<LoadingSpinner size="lg" text="Chargement des catégories..." />}>
          <CategoriesSection />
        </Suspense>
      </main>
    </div>
  )
}
