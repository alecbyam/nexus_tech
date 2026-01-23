'use client'

import { useEffect, useState, Suspense } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/providers'

// Force dynamic rendering (cannot be statically generated)
export const dynamic = 'force-dynamic'

function AuthContent() {
  const supabase = createSupabaseClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      // Rediriger vers la page demandée ou la page d'accueil
      const redirect = searchParams.get('redirect') || '/'
      router.push(redirect)
    } else {
      setLoading(false)
    }
  }, [user, router, searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-blue-50 to-white">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-10 border border-gray-100 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black gradient-text mb-2">Connexion</h1>
          <p className="text-gray-600">Accédez à votre compte NEXUS TECH</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#0B5FFF',
                  brandAccent: '#2563eb',
                },
                fontSizes: {
                  baseBodySize: '16px',
                },
              },
            },
            style: {
              button: {
                borderRadius: '0.75rem',
                padding: '12px 24px',
                fontWeight: '600',
              },
              input: {
                borderRadius: '0.75rem',
                padding: '12px 16px',
              },
            },
          }}
          providers={['google', 'github']}
          redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
          view="sign_in"
          showLinks={true}
          onlyThirdPartyProviders={false}
        />
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Pas encore de compte ?{' '}
            <a href="/auth/signup" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline">
              Créer un compte
            </a>
          </p>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>
            En vous connectant, vous acceptez nos{' '}
            <a href="/terms" className="text-primary-600 hover:underline font-semibold">
              conditions d'utilisation
            </a>{' '}
            et notre{' '}
            <a href="/privacy" className="text-primary-600 hover:underline font-semibold">
              politique de confidentialité
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
