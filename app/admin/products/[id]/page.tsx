'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers'
import { Header } from '@/components/header'
import type { Database } from '@/types/database.types'
import { uploadProductImage, attachProductImage, deleteProductImage } from '@/lib/utils/image-upload'

type Product = Database['public']['Tables']['products']['Row']
type Category = Database['public']['Tables']['categories']['Row']
type ProductImage = Database['public']['Tables']['product_images']['Row']

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAdmin, loading: authLoading } = useAuth()
  const supabase = createSupabaseClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [existingImages, setExistingImages] = useState<ProductImage[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    sku: '',
    price_cents: '',
    compare_at_price_cents: '',
    stock: '0',
    currency: 'USD',
    is_refurbished: false,
    is_active: true,
  })

  const productId = params.id as string

  useEffect(() => {
    if (authLoading) return

    if (!user || !isAdmin) {
      router.push('/')
      return
    }

    loadProduct()
    loadCategories()
  }, [user, isAdmin, authLoading, router, productId])

  async function loadProduct() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (error) throw error

      setProduct(data)

      // Charger les images existantes
      const { data: images } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('is_primary', { ascending: false })

      setExistingImages(images || [])

      setFormData({
        name: data.name,
        description: data.description || '',
        category_id: data.category_id,
        sku: data.sku || '',
        price_cents: (data.price_cents / 100).toFixed(2),
        compare_at_price_cents: data.compare_at_price_cents
          ? (data.compare_at_price_cents / 100).toFixed(2)
          : '',
        stock: data.stock.toString(),
        currency: data.currency,
        is_refurbished: data.is_refurbished,
        is_active: data.is_active,
      })
    } catch (error: any) {
      console.error('Error loading product:', error)
      setError('Produit non trouvé')
    } finally {
      setLoading(false)
    }
  }

  async function loadCategories() {
    try {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      setCategories(data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    setError(null)
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5MB')
      return
    }

    setSelectedImage(file)
    setError(null)

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function handleDeleteImage(imageId: string, storagePath: string) {
    if (!confirm('Supprimer cette image ?')) return

    try {
      await deleteProductImage(imageId, storagePath)
      await loadProduct()
    } catch (error: any) {
      console.error('Error deleting image:', error)
      setError('Erreur lors de la suppression de l\'image')
    }
  }

  async function handleSetPrimary(imageId: string) {
    try {
      // Désactiver toutes les autres images principales
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId)

      // Activer cette image comme principale
      await supabase
        .from('product_images')
        .update({ is_primary: true })
        .eq('id', imageId)

      await loadProduct()
    } catch (error: any) {
      console.error('Error setting primary image:', error)
      setError('Erreur lors de la mise à jour')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const priceCents = Math.round(parseFloat(formData.price_cents) * 100)
    if (isNaN(priceCents) || priceCents < 0) {
      setError('Le prix doit être un nombre positif')
      return
    }

    const compareAtPriceCents = formData.compare_at_price_cents
      ? Math.round(parseFloat(formData.compare_at_price_cents) * 100)
      : null

    if (compareAtPriceCents !== null && (isNaN(compareAtPriceCents) || compareAtPriceCents < priceCents)) {
      setError('Le prix d\'ancrage doit être supérieur au prix de vente')
      return
    }

    const stock = parseInt(formData.stock)
    if (isNaN(stock) || stock < 0) {
      setError('Le stock doit être un nombre positif')
      return
    }

    setSaving(true)

    try {
      // Vérifier que l'utilisateur est bien authentifié
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        throw new Error('Vous devez être connecté pour modifier un produit')
      }

      // Vérifier que l'utilisateur est admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', currentUser.id)
        .single()

      if (!profile?.is_admin) {
        throw new Error('Vous devez être administrateur pour modifier un produit')
      }

      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          description: formData.description || null,
          category_id: formData.category_id,
          sku: formData.sku || null,
          price_cents: priceCents,
          compare_at_price_cents: compareAtPriceCents,
          currency: formData.currency,
          stock: stock,
          is_refurbished: formData.is_refurbished,
          condition: formData.is_refurbished ? 'refurbished' : 'new',
          is_active: formData.is_active,
        })
        .eq('id', productId)

      if (error) {
        console.error('Product update error:', error)
        // Messages d'erreur plus détaillés
        if (error.code === '42501') {
          throw new Error('Permission refusée. Vérifiez que vous êtes bien administrateur.')
        } else if (error.code === '23503') {
          throw new Error('La catégorie sélectionnée n\'existe pas.')
        } else if (error.code === '23505') {
          throw new Error('Un produit avec ce SKU existe déjà.')
        } else {
          throw new Error(error.message || 'Erreur lors de la mise à jour du produit')
        }
      }

      // Upload de la nouvelle image si sélectionnée
      if (selectedImage) {
        setUploadingImage(true)
        try {
          const { storagePath } = await uploadProductImage(productId, selectedImage)
          await attachProductImage(productId, storagePath, true)
        } catch (imageError: any) {
          console.error('Error uploading image:', imageError)
          setError('Produit mis à jour mais erreur lors de l\'upload de l\'image')
        } finally {
          setUploadingImage(false)
        }
      }

      router.push('/admin/products')
    } catch (error: any) {
      console.error('Error updating product:', error)
      setError(error.message || 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
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

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-700 font-semibold">{error || 'Produit non trouvé'}</p>
            <button
              onClick={() => router.push('/admin/products')}
              className="mt-4 text-primary-600 hover:underline"
            >
              Retour à la liste
            </button>
          </div>
        </main>
      </div>
    )
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="text-primary-600 hover:text-primary-700 font-semibold mb-4 inline-flex items-center"
            >
              ← Retour
            </button>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
              Modifier le Produit
            </h1>
            <p className="text-gray-600">ID: {product.id.slice(0, 8)}...</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Nom */}
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom du produit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
              </div>

              {/* Catégorie */}
              <div>
                <label htmlFor="category_id" className="block text-sm font-semibold text-gray-700 mb-2">
                  Catégorie <span className="text-red-500">*</span>
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* SKU */}
              <div>
                <label htmlFor="sku" className="block text-sm font-semibold text-gray-700 mb-2">
                  SKU (Référence)
                </label>
                <input
                  type="text"
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
              </div>

              {/* Prix de vente */}
              <div>
                <label htmlFor="price_cents" className="block text-sm font-semibold text-gray-700 mb-2">
                  Prix de vente (USD) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price_cents"
                  name="price_cents"
                  value={formData.price_cents}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
              </div>

              {/* Prix d'ancrage */}
              <div>
                <label htmlFor="compare_at_price_cents" className="block text-sm font-semibold text-gray-700 mb-2">
                  Prix d'ancrage (USD)
                  <span className="text-xs text-gray-500 ml-2">(Prix barré pour comparaison)</span>
                </label>
                <input
                  type="number"
                  id="compare_at_price_cents"
                  name="compare_at_price_cents"
                  value={formData.compare_at_price_cents}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Doit être supérieur au prix de vente pour afficher un prix barré
                </p>
              </div>

              {/* Stock */}
              <div>
                <label htmlFor="stock" className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
                {parseInt(formData.stock) <= 10 && parseInt(formData.stock) > 0 && (
                  <p className="mt-2 text-sm text-yellow-600 font-semibold">⚠️ Stock faible</p>
                )}
                {parseInt(formData.stock) === 0 && (
                  <p className="mt-2 text-sm text-red-600 font-semibold">❌ Rupture de stock</p>
                )}
              </div>

              {/* Images existantes */}
              {existingImages.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Images existantes
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingImages.map((image) => {
                      const imageUrl = `${supabaseUrl}/storage/v1/object/public/product-images/${image.storage_path}`
                      return (
                        <div key={image.id} className="relative group">
                          <img
                            src={imageUrl}
                            alt="Produit"
                            className="w-full h-32 object-cover rounded-xl border-2 border-gray-200"
                          />
                          {image.is_primary && (
                            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                              Principale
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                            {!image.is_primary && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimary(image.id)}
                                className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-blue-600"
                              >
                                Définir principale
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteImage(image.id, image.storage_path)}
                              className="bg-red-500 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-red-600"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Nouvelle image */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ajouter une nouvelle image
                </label>
                <div className="space-y-4">
                  {imagePreview && (
                    <div className="relative w-full max-w-xs">
                      <img
                        src={imagePreview}
                        alt="Aperçu"
                        className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null)
                          setImagePreview(null)
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  />
                  <p className="text-xs text-gray-500">
                    Formats acceptés: JPG, PNG, WEBP. Taille max: 5MB
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
              </div>

              {/* Options */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_refurbished"
                    name="is_refurbished"
                    checked={formData.is_refurbished}
                    onChange={(e) =>
                      setFormData({ ...formData, is_refurbished: e.target.checked })
                    }
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="is_refurbished" className="ml-3 text-sm font-semibold text-gray-700">
                    Produit reconditionné
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="is_active" className="ml-3 text-sm font-semibold text-gray-700">
                    Produit actif (visible dans le catalogue)
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                type="submit"
                disabled={saving || uploadingImage}
                className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-4 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {saving || uploadingImage
                  ? uploadingImage
                    ? '📤 Upload de l\'image...'
                    : '⏳ Sauvegarde...'
                  : '💾 Enregistrer les modifications'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-bold"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
