'use client'

import { useEffect, useState } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers'

export default function AuthPage() {
  const supabase = createSupabaseClient()
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      router.push('/')
    } else {
      setLoading(false)
    }
  }, [user, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
                borderRadius: '0.75rem',
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
          providers={['google']}
          redirectTo={`${window.location.origin}/auth/callback`}
        />
      </div>
    </div>
  )
}
