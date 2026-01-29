import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

type SignUpBody = {
  email: string
  password: string
  full_name?: string
  phone?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<SignUpBody>
    const email = (body.email || '').trim().toLowerCase()
    const password = (body.password || '').trim()
    const full_name = (body.full_name || '').trim()
    const phone = (body.phone || '').trim()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe sont requis' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Mot de passe trop court (min 6 caractères)' },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      )
    }

    const admin = createSupabaseAdminClient()

    // Créer le user Auth avec email confirmé automatiquement
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmation automatique
      user_metadata: {
        full_name: full_name || undefined,
        phone: phone || undefined,
      },
    })

    if (createError || !created.user) {
      return NextResponse.json(
        { error: createError?.message || 'Création utilisateur échouée' },
        { status: 400 }
      )
    }

    const newUserId = created.user.id

    // Mettre à jour/compléter le profil (trigger handle_new_user peut déjà l'avoir créé)
    const { error: upsertError } = await admin.from('profiles').upsert(
      {
        id: newUserId,
        full_name: full_name || null,
        phone: phone || null,
        role: 'client', // Par défaut, les nouveaux utilisateurs sont des clients
        is_admin: false,
      },
      { onConflict: 'id' }
    )

    if (upsertError) {
      console.error('Error updating profile:', upsertError)
      // Ne pas échouer si le profil existe déjà (créé par le trigger)
    }

    return NextResponse.json(
      {
        ok: true,
        userId: newUserId,
        email,
        message: 'Compte créé avec succès',
      },
      { status: 200 }
    )
  } catch (e: any) {
    console.error('Signup error:', e)
    return NextResponse.json(
      { error: e?.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
