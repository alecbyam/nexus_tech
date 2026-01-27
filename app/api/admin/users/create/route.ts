import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import type { UserRole } from '@/components/providers'

type CreateUserBody = {
  email: string
  password: string
  full_name?: string
  phone?: string
  role: UserRole
}

function isValidRole(role: string): role is UserRole {
  return role === 'client' || role === 'staff' || role === 'admin' || role === 'tech'
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Vérifier le rôle admin du demandeur
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      return NextResponse.json(
        { error: `Erreur profil: ${profileError.message}` },
        { status: 500 }
      )
    }

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin required' }, { status: 403 })
    }

    const body = (await req.json()) as Partial<CreateUserBody>
    const email = (body.email || '').trim().toLowerCase()
    const password = (body.password || '').trim()
    const full_name = (body.full_name || '').trim()
    const phone = (body.phone || '').trim()
    const role = body.role

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'email, password et role sont requis' },
        { status: 400 }
      )
    }
    if (!isValidRole(role)) {
      return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Mot de passe trop court (min 6 caractères)' },
        { status: 400 }
      )
    }

    const admin = createSupabaseAdminClient()

    // Créer le user Auth
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name || undefined,
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
        role,
        is_admin: role === 'admin', // compatibilité
      },
      { onConflict: 'id' }
    )

    if (upsertError) {
      return NextResponse.json(
        {
          error: `Utilisateur créé mais profil non mis à jour: ${upsertError.message}`,
          userId: newUserId,
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        ok: true,
        userId: newUserId,
        email,
        role,
      },
      { status: 200 }
    )
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}

