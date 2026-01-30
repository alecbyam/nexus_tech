import { getServices } from '@/lib/services/services'
import { Header } from '@/components/header'
import { ServicesGrid } from '@/components/services-grid'
import { PageHeader } from '@/components/page-header'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/loading-spinner'
import { ContactWhatsAppButton } from '@/components/contact-whatsapp-button'

export const dynamic = 'force-dynamic'

export default async function ServicesPage() {
  const services = await getServices()

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    { label: 'Services' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Header />
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <PageHeader
          title="Nos Services"
          subtitle="Des solutions complètes pour tous vos besoins tech"
          breadcrumbs={breadcrumbs}
        />
        
        {/* Bouton de contact WhatsApp */}
        <div className="mb-6 sm:mb-8 flex justify-center">
          <ContactWhatsAppButton />
        </div>
        
        <Suspense fallback={<LoadingSpinner size="lg" text="Chargement des services..." />}>
          <ServicesGrid services={services} />
        </Suspense>
      </main>
    </div>
  )
}
