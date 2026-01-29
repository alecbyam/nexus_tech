'use client'

import { useState } from 'react'
import { ProductReviews } from './product-reviews'
import { 
  DocumentTextIcon, 
  CogIcon, 
  StarIcon, 
  TruckIcon,
  ShieldCheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface ProductTabsProps {
  productId: string
  description: string | null
  categoryName?: string
  stock: number
  isRefurbished: boolean
  condition: string
}

type TabType = 'description' | 'specs' | 'reviews' | 'shipping'

export function ProductTabs({ 
  productId, 
  description, 
  categoryName,
  stock,
  isRefurbished,
  condition
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('description')

  const tabs = [
    {
      id: 'description' as TabType,
      label: 'Description',
      icon: DocumentTextIcon,
    },
    {
      id: 'specs' as TabType,
      label: 'Spécifications',
      icon: CogIcon,
    },
    {
      id: 'reviews' as TabType,
      label: 'Avis',
      icon: StarIcon,
    },
    {
      id: 'shipping' as TabType,
      label: 'Livraison & Garantie',
      icon: TruckIcon,
    },
  ]

  return (
    <div className="mt-8 sm:mt-12 bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50">
        <div className="flex overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 sm:flex-none px-4 sm:px-6 py-4 font-semibold text-sm sm:text-base
                  transition-all duration-300 relative
                  ${isActive 
                    ? 'text-blue-600 bg-white' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/50'
                  }
                `}
              >
                <span className="flex items-center justify-center gap-2 whitespace-nowrap">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6 sm:p-8 md:p-12">
        {activeTab === 'description' && (
          <div className="animate-fade-in">
            {description ? (
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {description}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Aucune description disponible pour ce produit.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="animate-fade-in">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <CogIcon className="w-6 h-6 text-blue-600" />
                  <h3 className="font-bold text-gray-900 text-lg">Informations générales</h3>
                </div>
                <dl className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-blue-100">
                    <dt className="text-gray-600 font-medium">Catégorie</dt>
                    <dd className="text-gray-900 font-semibold">{categoryName || 'Non spécifiée'}</dd>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-blue-100">
                    <dt className="text-gray-600 font-medium">Condition</dt>
                    <dd className="text-gray-900 font-semibold">
                      {isRefurbished ? (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-bold">
                          ✨ Reconditionné
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                          ✓ Neuf
                        </span>
                      )}
                    </dd>
                  </div>
                  {/* Stock masqué pour les clients - visible uniquement pour les admins */}
                </dl>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                <div className="flex items-center gap-3 mb-4">
                  <InformationCircleIcon className="w-6 h-6 text-purple-600" />
                  <h3 className="font-bold text-gray-900 text-lg">Détails supplémentaires</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Qualité garantie</p>
                      <p className="text-sm text-gray-600">Tous nos produits sont testés et vérifiés avant expédition</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Support client</p>
                      <p className="text-sm text-gray-600">Assistance disponible 7j/7 via WhatsApp</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Paiement sécurisé</p>
                      <p className="text-sm text-gray-600">Plusieurs méthodes de paiement disponibles</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="animate-fade-in">
            <ProductReviews productId={productId} />
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="animate-fade-in">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Livraison */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <div className="flex items-center gap-3 mb-4">
                  <TruckIcon className="w-6 h-6 text-green-600" />
                  <h3 className="font-bold text-gray-900 text-lg">Livraison</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Livraison rapide</p>
                      <p className="text-sm text-gray-600">Délai de livraison : le même jour si vous êtes en ville de Bunia et environs</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Frais de livraison</p>
                      <p className="text-sm text-gray-600">Gratuits pour les commandes supérieures à 100$</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Suivi de commande</p>
                      <p className="text-sm text-gray-600">Numéro de suivi fourni après expédition</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Zones de livraison</p>
                      <p className="text-sm text-gray-600">Bunia et environs (autres zones sur demande)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Garantie */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                  <h3 className="font-bold text-gray-900 text-lg">Garantie & Retour</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Garantie constructeur</p>
                      <p className="text-sm text-gray-600">Garantie selon les spécifications du fabricant</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Garantie NEXUS TECH</p>
                      <p className="text-sm text-gray-600">1 an de garantie sur les produits reconditionnés</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Politique de retour</p>
                      <p className="text-sm text-gray-600">14 jours pour retourner un produit non conforme</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Support après-vente</p>
                      <p className="text-sm text-gray-600">Assistance technique disponible</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact info */}
            <div className="mt-6 p-6 bg-gradient-to-r from-primary-50 to-indigo-50 rounded-xl border border-primary-100">
              <p className="text-center text-gray-700">
                <strong>Questions sur la livraison ou la garantie ?</strong>{' '}
                <a 
                  href="https://wa.me/243818510311" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-semibold underline"
                >
                  Contactez-nous sur WhatsApp
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
