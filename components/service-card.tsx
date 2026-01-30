'use client'

import type { Service, ServiceCategory } from '@/lib/services/services'
import { openWhatsAppService } from '@/lib/utils/whatsapp-service'

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

        {/* Informations durée uniquement (prix masqué pour les clients) */}
        {service.duration_estimate && (
          <div className="flex items-center gap-1.5 text-xs sm:text-sm mb-4 sm:mb-5">
            <span className="text-gray-500">⏱️</span>
            <span className="font-semibold text-gray-700">{service.duration_estimate}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:gap-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={onRequest}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Faire une demande
            </button>
            <button
              onClick={onRequest}
              className="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-4 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
            >
              Demander un devis
            </button>
          </div>
          <button
            onClick={() => openWhatsAppService(service)}
            className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Contacter via WhatsApp
          </button>
        </div>
      </div>
    </div>
  )
}
