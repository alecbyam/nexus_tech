'use client'

import { useState } from 'react'
import type { Service, ServiceCategory } from '@/lib/services/services'
import { ServiceCard } from './service-card'
import { ServiceRequestModal } from './service-request-modal'

interface ServicesGridProps {
  services: Service[]
}

export function ServicesGrid({ services }: ServicesGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [showRequestModal, setShowRequestModal] = useState(false)

  const categories: ServiceCategory[] = ['smartphone', 'computer', 'internet_accounts', 'web_design', 'technical', 'training']
  
  const categoryNames: Record<ServiceCategory, string> = {
    smartphone: '📱 Services Smartphone',
    computer: '💻 Services Ordinateur',
    internet_accounts: '🌐 Internet & Comptes',
    web_design: '🎨 Web & Design',
    technical: '🔧 Services Techniques',
    training: '📚 Formation',
  }

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => s.category === selectedCategory)

  const handleRequestService = (service: Service) => {
    setSelectedService(service)
    setShowRequestModal(true)
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucun service disponible pour le moment.</p>
      </div>
    )
  }

  return (
    <>
      {/* Filtres par catégorie */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            Tous les services
          </button>
          {categories.map((category) => {
            const count = services.filter(s => s.category === category).length
            if (count === 0) return null
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                }`}
              >
                {categoryNames[category]} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Grille de services */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun service dans cette catégorie.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onRequest={() => handleRequestService(service)}
            />
          ))}
        </div>
      )}

      {/* Modal de demande de service */}
      {showRequestModal && selectedService && (
        <ServiceRequestModal
          service={selectedService}
          onClose={() => {
            setShowRequestModal(false)
            setSelectedService(null)
          }}
        />
      )}
    </>
  )
}
