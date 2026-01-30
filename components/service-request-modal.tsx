'use client'

import { useState } from 'react'
import type { Service } from '@/lib/services/services'
import { useAuth } from '@/components/providers'
import { useToast } from '@/components/toast'
import { FormField } from './form-field'
import { Input } from './form-field'
import { Textarea } from './form-field'

interface ServiceRequestModalProps {
  service: Service
  onClose: () => void
}

export function ServiceRequestModal({ service, onClose }: ServiceRequestModalProps) {
  const { user } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customerName: user?.user_metadata?.full_name || '',
    customerEmail: user?.email || '',
    customerPhone: user?.user_metadata?.phone || '',
    notes: '',
    requestType: 'order' as 'order' | 'quote',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/services/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          customerName: formData.customerName || undefined,
          customerEmail: formData.customerEmail || undefined,
          customerPhone: formData.customerPhone,
          notes: formData.notes || undefined,
          requestType: formData.requestType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la demande')
      }

      toast.showToast(
        formData.requestType === 'order'
          ? 'Demande de service créée avec succès !'
          : 'Demande de devis envoyée avec succès !',
        'success'
      )

      onClose()
    } catch (error: any) {
      toast.showToast(error.message || 'Erreur lors de la création de la demande', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* En-tête */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 sm:p-6 flex items-center justify-between rounded-t-2xl sm:rounded-t-3xl">
          <div>
            <h2 className="text-xl sm:text-2xl font-black mb-1">Demande de service</h2>
            <p className="text-sm sm:text-base text-blue-100">{service.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors p-2"
            aria-label="Fermer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Type de demande */}
          <div className="flex gap-3">
            <label className="flex-1 cursor-pointer">
              <input
                type="radio"
                name="requestType"
                value="order"
                checked={formData.requestType === 'order'}
                onChange={(e) => setFormData({ ...formData, requestType: e.target.value as 'order' | 'quote' })}
                className="sr-only"
              />
              <div className={`p-4 rounded-xl border-2 transition-all ${
                formData.requestType === 'order'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="font-bold text-gray-900 mb-1">Faire une demande</div>
                <div className="text-sm text-gray-600">Demander le service</div>
              </div>
            </label>
            <label className="flex-1 cursor-pointer">
              <input
                type="radio"
                name="requestType"
                value="quote"
                checked={formData.requestType === 'quote'}
                onChange={(e) => setFormData({ ...formData, requestType: e.target.value as 'order' | 'quote' })}
                className="sr-only"
              />
              <div className={`p-4 rounded-xl border-2 transition-all ${
                formData.requestType === 'quote'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="font-bold text-gray-900 mb-1">Demander un devis</div>
                <div className="text-sm text-gray-600">Obtenir un devis personnalisé</div>
              </div>
            </label>
          </div>

          {/* Informations client */}
          <FormField label="Nom complet" htmlFor="customerName">
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="Votre nom complet"
              required={!user}
            />
          </FormField>

          <FormField label="Email" htmlFor="customerEmail">
            <Input
              id="customerEmail"
              type="email"
              value={formData.customerEmail}
              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              placeholder="votre@email.com"
              required={!user}
            />
          </FormField>

          <FormField label="Téléphone" htmlFor="customerPhone" required>
            <Input
              id="customerPhone"
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              placeholder="+243 XXX XXX XXX"
              required
            />
          </FormField>

          <FormField label="Notes ou détails supplémentaires" htmlFor="notes">
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Décrivez vos besoins ou questions..."
              rows={4}
            />
          </FormField>

          {/* Informations du service (prix masqué) */}
          {service.duration_estimate && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="text-sm font-semibold text-gray-700 mb-2">Informations du service</div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold">Durée estimée:</span> {service.duration_estimate}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                💡 Un devis personnalisé vous sera fourni après votre demande
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Envoi...' : formData.requestType === 'order' ? 'Envoyer la demande' : 'Demander un devis'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all duration-300"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
