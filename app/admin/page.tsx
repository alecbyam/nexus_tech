'use client'

import { AdminGuard } from '@/components/AdminGuard'
import { Header } from '@/components/header'
import Link from 'next/link'
import { memo } from 'react'

// Composant de carte mémorisé pour éviter les re-renders
const AdminCard = memo(({ href, title, description }: { href: string; title: string; description: string }) => (
  <Link
    href={href}
    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100 hover:border-primary-300"
  >
    <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
    <p className="text-gray-600">{description}</p>
  </Link>
))
AdminCard.displayName = 'AdminCard'

function AdminPageContent() {

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Admin</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/products"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100 hover:border-primary-300"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-2">Gérer les produits</h2>
            <p className="text-gray-600">Ajouter, modifier ou supprimer des produits</p>
          </Link>

          <Link
            href="/admin/orders"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100 hover:border-primary-300"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-2">Gérer les commandes</h2>
            <p className="text-gray-600">Voir et gérer toutes les commandes</p>
          </Link>

          <Link
            href="/admin/users"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100 hover:border-primary-300"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-2">Gérer les utilisateurs</h2>
            <p className="text-gray-600">Voir et gérer tous les utilisateurs</p>
          </Link>

          <Link
            href="/admin/interests"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100 hover:border-primary-300"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-2">Intérêts des clients</h2>
            <p className="text-gray-600">Voir les produits consultés et recherches</p>
          </Link>

          <Link
            href="/admin/stats"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100 hover:border-primary-300"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-2">Statistiques</h2>
            <p className="text-gray-600">Analytics et performances</p>
          </Link>

          <Link
            href="/admin/categories"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100 hover:border-primary-300"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-2">Gérer les catégories</h2>
            <p className="text-gray-600">Créer, modifier ou supprimer des catégories</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
