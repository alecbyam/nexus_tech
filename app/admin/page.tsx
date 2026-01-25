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
          <AdminCard
            href="/admin/products"
            title="Gérer les produits"
            description="Ajouter, modifier ou supprimer des produits"
          />
          <AdminCard
            href="/admin/orders"
            title="Gérer les commandes"
            description="Voir et gérer toutes les commandes"
          />
          <AdminCard
            href="/admin/users"
            title="Gérer les utilisateurs"
            description="Voir et gérer tous les utilisateurs"
          />
          <AdminCard
            href="/admin/interests"
            title="Intérêts des clients"
            description="Voir les produits consultés et recherches"
          />
          <AdminCard
            href="/admin/stats"
            title="Statistiques"
            description="Analytics et performances"
          />
          <AdminCard
            href="/admin/categories"
            title="Gérer les catégories"
            description="Créer, modifier ou supprimer des catégories"
          />
        </div>
      </main>
    </div>
  )
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminPageContent />
    </AdminGuard>
  )
}