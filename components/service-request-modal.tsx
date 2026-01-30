'use client'

import { useState } from 'react'
import type { Service } from '@/lib/services/services'
import { useAuth } from '@/components/providers'
import { useToast } from '@/components/toast'
import { FormField } from './form-field'
import { Input } from './form-field'
import { Textarea } from './form-field'
import { openWhatsAppService } from '@/lib/utils/whatsapp-service'

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
          <div className="space-y-3 pt-4">
            <div className="flex flex-col sm:flex-row gap-3">
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
            <button
              type="button"
              onClick={() => {
                openWhatsAppService(
                  service,
                  formData.customerName || undefined,
                  formData.customerPhone || undefined,
                  formData.notes || undefined
                )
              }}
              className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Contacter directement via WhatsApp
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
