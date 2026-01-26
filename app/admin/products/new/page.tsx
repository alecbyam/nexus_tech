'use client'

import { useEffect, useState, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { AdminGuard } from '@/components/AdminGuard'
import { Header } from '@/components/header'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/database.types'
import { uploadProductImage, attachProductImage } from '@/lib/utils/image-upload'

type Category = Database['public']['Tables']['categories']['Row']

function NewProductPageContent() {
  const router = useRouter()
  const supabase = createSupabaseClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    sku: '',
    price_cents: '',
    compare_at_price_cents: '', // Prix d'ancrage
    stock: '0',
    currency: 'USD',
    is_refurbished: false,
    is_active: true,
  })

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  const loadCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .limit(100) // Limite pour performance

      if (error) throw error
      setCategories(data || [])
    } catch (error: any) {
      console.error('Error loading categories:', error)
      setError('Erreur lors du chargement des catégories')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? value : value,
    })
    setError(null)
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const validFiles: File[] = []
    const newPreviews: string[] = []
    let loadedCount = 0

    // Valider chaque fichier
    for (const file of files) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        setError(`Le fichier ${file.name} n'est pas une image valide`)
        continue
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(`L'image ${file.name} dépasse 5MB`)
        continue
      }

      validFiles.push(file)

      // Créer un aperçu de manière asynchrone
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        loadedCount++
        // Mettre à jour les previews une fois toutes les images chargées
        if (loadedCount === validFiles.length) {
          setImagePreviews((prev) => [...prev, ...newPreviews])
        }
      }
      reader.readAsDataURL(file)
    }

    if (validFiles.length > 0) {
      setSelectedImages((prev) => [...prev, ...validFiles])
      setError(null)
    }
    
    // Réinitialiser l'input pour permettre de sélectionner les mêmes fichiers
    e.target.value = ''
  }

  function removeImage(index: number) {
    setSelectedImages(selectedImages.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.name || !formData.category_id) {
      setError('Le nom et la catégorie sont requis')
      return
    }

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
        throw new Error('Vous devez être connecté pour créer un produit')
      }

      // Vérifier que l'utilisateur est admin (utiliser maybeSingle pour éviter les erreurs)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', currentUser.id)
        .maybeSingle()

      if (profileError) {
        console.error('Error checking admin status:', profileError)
        throw new Error('Erreur lors de la vérification des permissions')
      }

      if (!profile?.is_admin) {
        throw new Error('Vous devez être administrateur pour créer un produit')
      }

      // Créer le produit
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
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
        .select()
        .single()

      if (productError) {
        console.error('Product creation error:', productError)
        // Messages d'erreur plus détaillés
        if (productError.code === '42501') {
          throw new Error('Permission refusée. Vérifiez que vous êtes bien administrateur.')
        } else if (productError.code === '23503') {
          throw new Error('La catégorie sélectionnée n\'existe pas.')
        } else if (productError.code === '23505') {
          throw new Error('Un produit avec ce SKU existe déjà.')
        } else {
          throw new Error(productError.message || 'Erreur lors de la création du produit')
        }
      }

      // Upload des images si sélectionnées (au moins 3 recommandées)
      if (selectedImages.length > 0 && product) {
        setUploadingImages(true)
        try {
          const uploadPromises = selectedImages.map(async (image, index) => {
            const { storagePath } = await uploadProductImage(product.id, image)
            // La première image est marquée comme primaire
            await attachProductImage(product.id, storagePath, index === 0)
          })
          
          await Promise.all(uploadPromises)
        } catch (imageError: any) {
          console.error('Error uploading images:', imageError)
          // On continue même si l'upload d'image échoue
          setError('Produit créé mais erreur lors de l\'upload de certaines images')
        } finally {
          setUploadingImages(false)
        }
      }

      if (product) {
        router.push(`/admin/products/${product.id}`)
      } else {
        throw new Error('Le produit a été créé mais aucune donnée n\'a été retournée')
      }
    } catch (error: any) {
      console.error('Error creating product:', error)
      setError(error.message || 'Erreur lors de la création du produit. Vérifiez votre connexion et vos permissions.')
      setSaving(false)
    }
  }

  if (loading) {
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="text-primary-600 hover:text-primary-700 font-semibold mb-4 inline-flex items-center"
            >
              ← Retour
            </button>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
              Nouveau Produit
            </h1>
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
                  placeholder="iPhone 15 Pro Max 256GB"
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
                  placeholder="IPH15PM256"
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
                  placeholder="999.99"
                />
              </div>

              {/* Prix d'ancrage (comparaison) */}
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
                  placeholder="1299.99"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Doit être supérieur au prix de vente pour afficher un prix barré
                </p>
              </div>

              {/* Stock */}
              <div>
                <label htmlFor="stock" className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock initial <span className="text-red-500">*</span>
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
                  placeholder="10"
                />
              </div>

              {/* Images du produit */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Images du produit <span className="text-primary-600">(Minimum 3 recommandées)</span>
                </label>
                <div className="space-y-4">
                  {/* Aperçus des images sélectionnées */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Aperçu ${index + 1}`}
                            className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                            loading="lazy"
                          />
                          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            {index === 0 ? '⭐ Principale' : `Image ${index + 1}`}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            aria-label="Supprimer l'image"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Input pour ajouter des images */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors">
                    <input
                      type="file"
                      id="images"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="images"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <div className="text-4xl">📷</div>
                      <span className="text-sm font-semibold text-gray-700">
                        {selectedImages.length === 0
                          ? 'Cliquez pour ajouter des images'
                          : `Ajouter plus d'images (${selectedImages.length} sélectionnée${selectedImages.length > 1 ? 's' : ''})`}
                      </span>
                      <span className="text-xs text-gray-500">
                        Formats: JPG, PNG, WEBP • Max 5MB par image
                      </span>
                    </label>
                  </div>
                  
                  {selectedImages.length > 0 && selectedImages.length < 3 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        💡 <strong>Recommandation:</strong> Ajoutez au moins 3 images pour une meilleure présentation du produit.
                      </p>
                    </div>
                  )}
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
                  placeholder="Description détaillée du produit..."
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
                disabled={saving || uploadingImages}
                className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-4 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {saving || uploadingImages
                  ? uploadingImages
                    ? `📤 Upload de ${selectedImages.length} image${selectedImages.length > 1 ? 's' : ''}...`
                    : '⏳ Création...'
                  : '✅ Créer le produit'}
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

export default function NewProductPage() {
  return (
    <AdminGuard>
      <NewProductPageContent />
    </AdminGuard>
  )
}
