'use client'

import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface AuthPromptModalProps {
  isOpen: boolean
  onClose: () => void
  reason?: 'add_to_cart' | 'checkout' | 'wishlist' | 'compare'
  redirectPath?: string
}

export function AuthPromptModal({ isOpen, onClose, reason, redirectPath }: AuthPromptModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  const getContent = () => {
    switch (reason) {
      case 'add_to_cart':
        return {
          title: '🛒 Créez un compte pour continuer',
          description: 'Pour ajouter des produits à votre panier et commander, créez un compte gratuit.',
          benefits: [
            'Suivez vos commandes en temps réel',
            'Bénéficiez de codes promo exclusifs',
            'Accédez à votre historique d\'achats',
            'Gagnez des points de fidélité',
          ],
        }
      case 'checkout':
        return {
          title: '✨ Finalisez votre commande',
          description: 'Connectez-vous ou créez un compte pour passer votre commande.',
          benefits: [
            'Suivi de commande en temps réel',
            'Historique de vos achats',
            'Points de fidélité et récompenses',
            'Codes promo personnalisés',
            'Support client prioritaire',
          ],
        }
      default:
        return {
          title: '🎁 Créez un compte NEXUS TECH',
          description: 'Rejoignez-nous et bénéficiez de nombreux avantages exclusifs.',
          benefits: [
            'Suivi de commande en temps réel',
            'Historique de vos achats',
            'Points de fidélité et récompenses',
            'Codes promo exclusifs',
            'Support client prioritaire',
          ],
        }
    }
  }

  const content = getContent()
  const authUrl = `/auth?redirect=${encodeURIComponent(redirectPath || '/')}&reason=${reason || 'general'}`

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{content.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">{content.description}</p>
          
          <div className="bg-primary-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-primary-900 mb-3">Avantages d'un compte :</h3>
            <ul className="space-y-2">
              {content.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-primary-700">
                  <CheckCircleIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={authUrl}
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all font-semibold text-center shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Créer un compte
            </Link>
            <Link
              href={`${authUrl}&view=sign_in`}
              onClick={onClose}
              className="flex-1 bg-white border-2 border-primary-500 text-primary-600 px-6 py-3 rounded-xl hover:bg-primary-50 transition-all font-semibold text-center"
            >
              Se connecter
            </Link>
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            En créant un compte, vous acceptez nos{' '}
            <Link href="/terms" className="text-primary-600 hover:underline">
              conditions d'utilisation
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
