import { Suspense } from 'react'
import { OrderConfirmationClient } from './order-confirmation-client'

export const dynamic = 'force-dynamic'

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <main className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          </main>
        </div>
      }
    >
      <OrderConfirmationClient />
    </Suspense>
  )
}
