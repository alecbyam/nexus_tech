import { createSupabaseClient } from '@/lib/supabase/client'

export interface UploadImageResult {
  storagePath: string
  publicUrl: string
}

/**
 * Upload une image de produit vers Supabase Storage
 */
export async function uploadProductImage(
  productId: string,
  file: File
): Promise<UploadImageResult> {
  const supabase = createSupabaseClient()

  // Générer un nom de fichier unique
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `products/${productId}/${fileName}`

  // Upload du fichier
  const { data, error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    throw new Error(`Erreur lors de l'upload: ${uploadError.message}`)
  }

  if (!data) {
    throw new Error('Aucune donnée retournée après upload')
  }

  // Obtenir l'URL publique
  const {
    data: { publicUrl },
  } = supabase.storage.from('product-images').getPublicUrl(filePath)

  return {
    storagePath: filePath,
    publicUrl,
  }
}

/**
 * Attache une image à un produit dans la table product_images
 */
export async function attachProductImage(
  productId: string,
  storagePath: string,
  isPrimary: boolean = true
): Promise<void> {
  const supabase = createSupabaseClient()

  // Si c'est l'image principale, désactiver les autres
  if (isPrimary) {
    await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', productId)
  }

  // Insérer la nouvelle image
  const { error } = await supabase.from('product_images').insert({
    product_id: productId,
    storage_path: storagePath,
    is_primary: isPrimary,
  })

  if (error) {
    throw new Error(`Erreur lors de l'attachement: ${error.message}`)
  }
}

/**
 * Supprime une image de produit
 */
export async function deleteProductImage(imageId: string, storagePath: string): Promise<void> {
  const supabase = createSupabaseClient()

  // Supprimer de la table
  const { error: dbError } = await supabase.from('product_images').delete().eq('id', imageId)

  if (dbError) {
    throw new Error(`Erreur lors de la suppression de la base: ${dbError.message}`)
  }

  // Supprimer du storage
  const { error: storageError } = await supabase.storage
    .from('product-images')
    .remove([storagePath])

  if (storageError) {
    console.warn(`Erreur lors de la suppression du storage: ${storageError.message}`)
    // On continue même si la suppression du storage échoue
  }
}
