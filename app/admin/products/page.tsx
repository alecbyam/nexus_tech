'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers'
import { Header } from '@/components/header'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/database.types'

type Product = Database['public']['Tables']['products']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row']
  product_images?: Array<{
    storage_path: string
    is_primary: boolean
  }>
}

interface StockStats {
  total: number
  inStock: number
  lowStock: number
  outOfStock: number
  totalValue: number
}

export default function AdminProductsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [stockFilter, setStockFilter] = useState<'all' | 'inStock' | 'lowStock' | 'outOfStock'>('all')
  const [stats, setStats] = useState<StockStats>({
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
  })
  const supabase = createSupabaseClient()

  useEffect(() => {
    if (authLoading) return

    if (!user || !isAdmin) {
      router.push('/')
      return
    }
    loadProducts()
  }, [user, isAdmin, authLoading, router])

  useEffect(() => {
    filterProducts()
  }, [searchQuery, stockFilter, products])

  async function loadProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (*),
          product_images (storage_path, is_primary)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const productsData = (data || []) as Product[]
      setProducts(productsData)
      setFilteredProducts(productsData)

      // Calculer les statistiques
      const stockStats: StockStats = {
        total: productsData.length,
        inStock: productsData.filter((p) => p.stock > 10).length,
        lowStock: productsData.filter((p) => p.stock > 0 && p.stock <= 10).length,
        outOfStock: productsData.filter((p) => p.stock === 0).length,
        totalValue: productsData.reduce((sum, p) => sum + p.price_cents * p.stock, 0) / 100,
      }
      setStats(stockStats)
    } catch (error: any) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  function filterProducts() {
    let filtered = products

    // Filtre de recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.sku?.toLowerCase().includes(query) ||
          p.categories?.name.toLowerCase().includes(query)
      )
    }

    // Filtre de stock
    if (stockFilter === 'inStock') {
      filtered = filtered.filter((p) => p.stock > 10)
    } else if (stockFilter === 'lowStock') {
      filtered = filtered.filter((p) => p.stock > 0 && p.stock <= 10)
    } else if (stockFilter === 'outOfStock') {
      filtered = filtered.filter((p) => p.stock === 0)
    }

    setFilteredProducts(filtered)
  }

  async function handleDelete(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
      return
    }

    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      await loadProducts()
    } catch (error: any) {
      console.error('Error deleting product:', error)
      alert('Erreur lors de la suppression')
    }
  }

  async function handleToggleActive(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      await loadProducts()
    } catch (error: any) {
      console.error('Error updating product:', error)
      alert('Erreur lors de la mise à jour')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
                Gestion des Produits
              </h1>
              <p className="text-gray-600 text-lg">
                {stats.total} {stats.total === 1 ? 'produit' : 'produits'} au total
              </p>
            </div>
            <Link
              href="/admin/products/new"
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              + Ajouter un produit
            </Link>
          </div>

          {/* Statistiques de Stock */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="text-3xl font-black mb-2">{stats.total}</div>
              <div className="text-sm font-semibold opacity-90">Total Produits</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="text-3xl font-black mb-2">{stats.inStock}</div>
              <div className="text-sm font-semibold opacity-90">En Stock (>10)</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
              <div className="text-3xl font-black mb-2">{stats.lowStock}</div>
              <div className="text-sm font-semibold opacity-90">Stock Faible (≤10)</div>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
              <div className="text-3xl font-black mb-2">{stats.outOfStock}</div>
              <div className="text-sm font-semibold opacity-90">Rupture de Stock</div>
            </div>
          </div>

          {/* Valeur totale du stock */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Valeur Totale du Stock</h3>
                <p className="text-sm text-gray-600">Valeur estimée de tous les produits en stock</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-primary-600">
                  ${stats.totalValue.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">USD</div>
              </div>
            </div>
          </div>

          {/* Filtres et Recherche */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rechercher un produit
                </label>
                <input
                  type="text"
                  placeholder="Nom, SKU ou catégorie..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Filtrer par stock
                </label>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value as any)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                >
                  <option value="all">Tous les produits</option>
                  <option value="inStock">En stock (>10)</option>
                  <option value="lowStock">Stock faible (≤10)</option>
                  <option value="outOfStock">Rupture de stock</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des Produits */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-primary-500 to-primary-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Valeur Stock
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <p className="text-gray-500">
                        {searchQuery || stockFilter !== 'all'
                          ? 'Aucun produit trouvé avec ces filtres'
                          : 'Aucun produit. Commencez par en ajouter un !'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const stockValue = (product.price_cents * product.stock) / 100
                    const isLowStock = product.stock > 0 && product.stock <= 10
                    const isOutOfStock = product.stock === 0

                    return (
                      <tr
                        key={product.id}
                        className={`hover:bg-gray-50 transition-colors duration-150 ${
                          isOutOfStock ? 'bg-red-50' : isLowStock ? 'bg-yellow-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {product.product_images && product.product_images.length > 0 ? (
                              <img
                                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${product.product_images[0].storage_path}`}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                                📦
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-bold text-gray-900">{product.name}</div>
                              {product.sku && (
                                <div className="text-xs text-gray-500 font-mono">SKU: {product.sku}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-700">
                            {product.categories?.name || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-black text-primary-600">
                            ${(product.price_cents / 100).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-bold px-3 py-1 rounded-full ${
                                isOutOfStock
                                  ? 'bg-red-100 text-red-700'
                                  : isLowStock
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {product.stock}
                            </span>
                            {isLowStock && (
                              <span className="text-xs text-yellow-600 font-semibold">⚠️ Faible</span>
                            )}
                            {isOutOfStock && (
                              <span className="text-xs text-red-600 font-semibold">❌ Rupture</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-700">
                            ${stockValue.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleActive(product.id, product.is_active)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
                              product.is_active
                                ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-md hover:shadow-lg'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                            }`}
                          >
                            {product.is_active ? '✓ Actif' : 'Inactif'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-semibold text-sm hover:bg-primary-200 transition-all"
                            >
                              ✏️ Modifier
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold text-sm hover:bg-red-200 transition-all"
                            >
                              🗑️ Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}