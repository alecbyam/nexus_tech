import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

type ServiceRequestBody = {
  serviceId: string
  customerName?: string
  customerEmail?: string
  customerPhone: string
  notes?: string
  requestType: 'order' | 'quote'
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const body = (await req.json()) as Partial<ServiceRequestBody>
    const { serviceId, customerName, customerEmail, customerPhone, notes, requestType } = body

    if (!serviceId || !customerPhone) {
      return NextResponse.json(
        { error: 'serviceId et customerPhone sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que le service existe
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, title')
      .eq('id', serviceId)
      .eq('is_active', true)
      .single()

    if (serviceError || !service) {
      return NextResponse.json(
        { error: 'Service introuvable ou inactif' },
        { status: 404 }
      )
    }

    // Créer la demande de service
    const admin = createSupabaseAdminClient()
    const { data: request, error: requestError } = await admin
      .from('service_requests')
      .insert({
        service_id: serviceId,
        user_id: user?.id || null,
        customer_name: customerName || null,
        customer_email: customerEmail || null,
        customer_phone: customerPhone,
        notes: notes || null,
        status: 'pending',
        estimated_price: requestType === 'quote' ? null : service.price_estimate || null,
      })
      .select()
      .single()

    if (requestError) {
      console.error('Error creating service request:', requestError)
      return NextResponse.json(
        { error: 'Erreur lors de la création de la demande' },
        { status: 500 }
      )
    }

    // Créer une notification pour les admins
    try {
      await admin.from('order_notifications').insert({
        order_id: null, // Pas une commande produit
        notification_type: 'new_order',
        message: `Nouvelle demande de service: ${service.title} par ${customerName || customerPhone}${requestType === 'quote' ? ' (Devis demandé)' : ''}`,
      })
    } catch (notifError) {
      // Ignorer les erreurs de notification
      console.error('Error creating notification:', notifError)
    }

    return NextResponse.json(
      {
        ok: true,
        requestId: request.id,
        message: requestType === 'quote' 
          ? 'Demande de devis créée avec succès'
          : 'Demande de service créée avec succès',
      },
      { status: 200 }
    )
  } catch (e: any) {
    console.error('Service request error:', e)
    return NextResponse.json(
      { error: e?.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
