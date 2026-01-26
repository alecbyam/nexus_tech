'use client'

import { useState } from 'react'

export type PaymentMethod = 'mpesa' | 'orange_money' | 'airtel_money' | 'card' | 'cash'

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null
  onSelectMethod: (method: PaymentMethod) => void
  phoneNumber: string
  onPhoneNumberChange: (phone: string) => void
  showPhoneInput?: boolean
}

const paymentMethods = [
  {
    id: 'mpesa' as PaymentMethod,
    name: 'M-Pesa',
    icon: '📱',
    description: 'Paiement via M-Pesa',
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'orange_money' as PaymentMethod,
    name: 'Orange Money',
    icon: '🟠',
    description: 'Paiement via Orange Money',
    color: 'from-orange-500 to-orange-600',
  },
  {
    id: 'airtel_money' as PaymentMethod,
    name: 'Airtel Money',
    icon: '🔴',
    description: 'Paiement via Airtel Money',
    color: 'from-red-500 to-red-600',
  },
  {
    id: 'card' as PaymentMethod,
    name: 'Carte Bancaire',
    icon: '💳',
    description: 'Paiement par carte (à venir)',
    color: 'from-blue-500 to-blue-600',
    disabled: true,
  },
  {
    id: 'cash' as PaymentMethod,
    name: 'Espèces à la livraison',
    icon: '💵',
    description: 'Payer en espèces à la livraison',
    color: 'from-gray-500 to-gray-600',
  },
]

export function PaymentMethodSelector({
  selectedMethod,
  onSelectMethod,
  phoneNumber,
  onPhoneNumberChange,
  showPhoneInput = true,
}: PaymentMethodSelectorProps) {
  const [phoneError, setPhoneError] = useState<string | null>(null)

  const validatePhone = (phone: string): boolean => {
    // Format RDC: +243 ou 243 suivi de 9 chiffres
    const rdcPhoneRegex = /^(\+?243|0)?[0-9]{9}$/
    const cleaned = phone.replace(/\s+/g, '')

    if (!cleaned) {
      setPhoneError('Le numéro de téléphone est requis')
      return false
    }

    if (!rdcPhoneRegex.test(cleaned)) {
      setPhoneError('Format invalide. Exemple: +243 900 000 000 ou 0900 000 000')
      return false
    }

    setPhoneError(null)
    return true
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    onPhoneNumberChange(value)
    if (value && selectedMethod && ['mpesa', 'orange_money', 'airtel_money'].includes(selectedMethod)) {
      validatePhone(value)
    }
  }

  const handleMethodSelect = (method: PaymentMethod) => {
    if (method === 'card') return // Désactivé pour l'instant
    onSelectMethod(method)
    if (['mpesa', 'orange_money', 'airtel_money'].includes(method) && phoneNumber) {
      validatePhone(phoneNumber)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Méthode de paiement</h3>

      {/* Sélection de la méthode */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => handleMethodSelect(method.id)}
            disabled={method.disabled}
            className={`
              relative p-4 rounded-xl border-2 transition-all text-left
              ${
                selectedMethod === method.id
                  ? 'border-primary-500 bg-primary-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }
              ${method.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`text-3xl ${method.disabled ? 'grayscale' : ''}`}>
                {method.icon}
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900">{method.name}</div>
                <div className="text-xs text-gray-600">{method.description}</div>
              </div>
              {selectedMethod === method.id && (
                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
            {method.disabled && (
              <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded">
                Bientôt
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Input téléphone pour mobile money */}
      {showPhoneInput &&
        selectedMethod &&
        ['mpesa', 'orange_money', 'airtel_money'].includes(selectedMethod) && (
          <div className="mt-4">
            <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-2">
              Numéro de téléphone {selectedMethod === 'mpesa' ? 'M-Pesa' : selectedMethod === 'orange_money' ? 'Orange Money' : 'Airtel Money'}{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="+243 900 000 000 ou 0900 000 000"
              className={`
                w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all
                ${phoneError ? 'border-red-300 bg-red-50' : 'border-gray-200'}
              `}
              required
            />
            {phoneError && (
              <p className="text-sm text-red-600 mt-1">{phoneError}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Format: +243 900 000 000 ou 0900 000 000 (9 chiffres après le préfixe)
            </p>
          </div>
        )}

      {/* Message pour paiement en espèces */}
      {selectedMethod === 'cash' && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-800">
            💵 <strong>Paiement en espèces :</strong> Vous paierez en espèces lors de la livraison.
            Le livreur vous contactera pour confirmer l'adresse et le montant exact.
          </p>
        </div>
      )}

      {/* Message pour carte bancaire */}
      {selectedMethod === 'card' && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Paiement par carte :</strong> Cette fonctionnalité sera bientôt disponible.
            Veuillez choisir une autre méthode de paiement pour le moment.
          </p>
        </div>
      )}
    </div>
  )
}
