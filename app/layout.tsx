import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { ErrorBoundary } from '@/components/error-boundary'
import { SEOVerification } from '@/components/seo-verification'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'ONATECH - Boutique Tech RDC',
  description: 'Boutique tech en République Démocratique du Congo: smartphones, ordinateurs, accessoires, services',
  keywords: 'smartphones, ordinateurs, accessoires, tech, e-commerce',
  robots: 'index, follow',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'ONATECH - Boutique Tech en ligne',
    description: 'Boutique tech: smartphones, ordinateurs, accessoires, services',
    type: 'website',
    images: [
      {
        url: '/logo-onatech.png',
        width: 1200,
        height: 630,
        alt: 'ONATECH Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ONATECH - Boutique Tech RDC',
    description: 'Boutique tech en République Démocratique du Congo',
    images: ['/logo-onatech.png'],
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
        <SEOVerification />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
