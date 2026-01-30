/**
 * Utilitaire pour générer des messages WhatsApp pour les services
 */

import type { Service } from '@/lib/services/services'

/**
 * Génère un message WhatsApp pour une demande de service
 */
export function generateWhatsAppServiceMessage(service: Service, customerName?: string, customerPhone?: string, notes?: string): string {
  const lines: string[] = []
  
  // En-tête
  lines.push('🔧 *DEMANDE DE SERVICE*')
  lines.push('')
  lines.push('Bonjour NEXUS TECH,')
  lines.push('')
  
  // Informations client
  if (customerName || customerPhone) {
    lines.push('👤 *MES INFORMATIONS*')
    if (customerName) lines.push(`Nom: ${customerName}`)
    if (customerPhone) lines.push(`Téléphone: ${customerPhone}`)
    lines.push('')
  }
  
  // Service demandé
  lines.push('📋 *SERVICE DEMANDÉ*')
  lines.push(`Service: *${service.title}*`)
  if (service.description) {
    lines.push(`Description: ${service.description}`)
  }
  if (service.duration_estimate) {
    lines.push(`Durée estimée: ${service.duration_estimate}`)
  }
  lines.push('')
  
  // Notes supplémentaires
  if (notes) {
    lines.push('📝 *DÉTAILS SUPPLÉMENTAIRES*')
    lines.push(notes)
    lines.push('')
  }
  
  // Message de fin
  lines.push('Merci de me contacter pour discuter de mes besoins.')
  lines.push('')
  lines.push('Cordialement')
  
  return lines.join('\n')
}

/**
 * Génère un message WhatsApp de contact général
 */
export function generateWhatsAppContactMessage(message?: string): string {
  const defaultMessage = 'Bonjour NEXUS TECH, j\'aimerais vous contacter pour plus d\'informations sur vos services.'
  return message || defaultMessage
}

/**
 * Ouvre WhatsApp avec un message pré-rempli
 */
export function openWhatsApp(message: string, phoneNumber: string = '243818510311'): void {
  const encodedMessage = encodeURIComponent(message)
  const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
  window.open(url, '_blank')
}

/**
 * Ouvre WhatsApp pour une demande de service
 */
export function openWhatsAppService(service: Service, customerName?: string, customerPhone?: string, notes?: string): void {
  const message = generateWhatsAppServiceMessage(service, customerName, customerPhone, notes)
  openWhatsApp(message)
}

/**
 * Ouvre WhatsApp pour un contact général
 */
export function openWhatsAppContact(customMessage?: string): void {
  const message = generateWhatsAppContactMessage(customMessage)
  openWhatsApp(message)
}
