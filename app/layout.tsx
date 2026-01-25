import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { ErrorBoundary } from '@/components/error-boundary'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'NEXUS TECH - Boutique Tech RDC',
  description: 'Boutique tech en République Démocratique du Congo: smartphones, ordinateurs, accessoires, services',
  keywords: 'smartphones, ordinateurs, accessoires, tech, e-commerce',
  robots: 'index, follow',
  openGraph: {
    title: 'NEXUS TECH - Boutique Tech en ligne',
    description: 'Boutique tech: smartphones, ordinateurs, accessoires, services',
    type: 'website',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
