'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers'
import { getProductReviews, addReview, hasUserReviewed, getProductRating } from '@/lib/services/reviews'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ProductReviewsProps {
  productId: string
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<any[]>([])
  const [rating, setRating] = useState<{ average: number; count: number }>({ average: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ rating: 5, comment: '' })

  useEffect(() => {
    loadReviews()
    if (user) {
      checkHasReviewed()
    }
  }, [productId, user])

  async function loadReviews() {
    try {
      const [reviewsData, ratingData] = await Promise.all([
        getProductReviews(productId).catch(() => []),
        getProductRating(productId).catch(() => ({ average: 0, count: 0 })),
      ])
      setReviews(reviewsData)
      setRating(ratingData)
    } catch (error) {
      console.warn('Error loading reviews:', error)
      setReviews([])
      setRating({ average: 0, count: 0 })
    } finally {
      setLoading(false)
    }
  }

  async function checkHasReviewed() {
    if (!user) return
    try {
      const reviewed = await hasUserReviewed(productId, user.id)
      setHasReviewed(reviewed)
    } catch (error) {
      console.error('Error checking review:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    try {
      await addReview(productId, user.id, formData.rating, formData.comment)
      await loadReviews()
      setShowForm(false)
      setFormData({ rating: 5, comment: '' })
      setHasReviewed(true)
      alert('Votre avis a été soumis et sera publié après modération')
    } catch (error: any) {
      alert(error.message || 'Erreur lors de l\'ajout de l\'avis')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Chargement des avis...</div>
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Avis clients</h2>
          <div className="flex items-center gap-2">
            {rating.average > 0 ? (
              <>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(rating.average)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {rating.average} ({rating.count} avis)
                </span>
              </>
            ) : (
              <span className="text-gray-600">Aucun avis pour le moment</span>
            )}
          </div>
        </div>
        {user && !hasReviewed && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
          >
            {showForm ? 'Annuler' : 'Laisser un avis'}
          </button>
        )}
      </div>

      {showForm && user && !hasReviewed && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Note</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="focus:outline-none"
                >
                  {star <= formData.rating ? (
                    <StarIcon className="w-8 h-8 text-yellow-400" />
                  ) : (
                    <StarIconOutline className="w-8 h-8 text-gray-300" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-semibold text-gray-700 mb-2">
              Commentaire
            </label>
            <textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Partagez votre expérience..."
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Envoi...' : 'Publier l\'avis'}
          </button>
        </form>
      )}

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            Soyez le premier à laisser un avis !
          </p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-900">
                    {review.profiles?.full_name || 'Client anonyme'}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {format(new Date(review.created_at), 'PP', { locale: fr })}
                </span>
              </div>
              {review.comment && (
                <p className="text-gray-700 mt-3">{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
