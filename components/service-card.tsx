'use client'

import type { Service, ServiceCategory } from '@/lib/services/services'

interface ServiceCardProps {
  service: Service
  onRequest: () => void
}

const categoryIcons: Record<ServiceCategory, string> = {
  smartphone: '📱',
  computer: '💻',
  internet_accounts: '🌐',
  web_design: '🎨',
  technical: '🔧',
  training: '📚',
}

const categoryGradients: Record<ServiceCategory, string> = {
  smartphone: 'from-blue-500 to-indigo-600',
  computer: 'from-indigo-500 to-purple-600',
  internet_accounts: 'from-cyan-500 to-blue-600',
  web_design: 'from-pink-500 to-rose-600',
  technical: 'from-orange-500 to-amber-600',
  training: 'from-green-500 to-emerald-600',
}

export function ServiceCard({ service, onRequest }: ServiceCardProps) {
  const gradient = categoryGradients[service.category] || 'from-primary-500 to-primary-600'
  const icon = categoryIcons[service.category] || '📦'

  return (
    <div className="group relative bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1 border border-gray-100/50">
      {/* En-tête avec gradient et icône */}
      <div className={`relative h-24 sm:h-32 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <div className="text-4xl sm:text-5xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
          {icon}
        </div>
        {/* Shine effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </div>

      {/* Contenu */}
      <div className="p-4 sm:p-6">
        <h3 className="font-black text-gray-900 text-lg sm:text-xl mb-2 sm:mb-3 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300">
          {service.title}
        </h3>
        
        {service.description && (
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-3">
            {service.description}
          </p>
        )}

        {/* Informations prix et durée */}
        <div className="flex flex-wrap gap-3 mb-4 sm:mb-5">
          {service.price_estimate && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <span className="text-gray-500">💰</span>
              <span className="font-semibold text-gray-700">{service.price_estimate}</span>
            </div>
          )}
          {service.duration_estimate && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <span className="text-gray-500">⏱️</span>
              <span className="font-semibold text-gray-700">{service.duration_estimate}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={onRequest}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Commander
          </button>
          <button
            onClick={onRequest}
            className="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-4 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
          >
            Demander un devis
          </button>
        </div>
      </div>
    </div>
  )
}
