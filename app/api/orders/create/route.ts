import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      items,
      totalCents,
      currency = 'USD',
      deliveryAddress,
      paymentMethod,
      customerName,
      customerEmail,
      customerPhone,
      sessionId,
      userId,
      couponId,
    } = body

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Le panier est vide' },
        { status: 400 }
      )
    }

    if (!totalCents || totalCents <= 0) {
      return NextResponse.json(
        { error: 'Le total est invalide' },
        { status: 400 }
      )
    }

    // Au moins un identifiant (userId ou sessionId) est requis
    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: 'Session invalide' },
        { status: 400 }
      )
    }

    // Pour les commandes sans compte, le nom et le téléphone sont requis
    if (!userId && (!customerName || !customerPhone)) {
      return NextResponse.json(
        { error: 'Le nom et le téléphone sont requis pour les commandes sans compte' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseAdminClient()

    // Créer la commande
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId || null,
        status: 'pending',
        total_cents: totalCents,
        currency: currency,
        delivery_address: deliveryAddress || null,
        payment_method: paymentMethod || null,
        customer_name: customerName || null,
        customer_email: customerEmail || null,
        customer_phone: customerPhone || null,
        session_id: sessionId || null,
        customer_note: deliveryAddress ? `Adresse de livraison: ${deliveryAddress}` : null,
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json(
        { error: 'Erreur lors de la création de la commande', details: orderError.message },
        { status: 500 }
      )
    }

    // Créer les order_items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price_cents_snapshot: Math.round(item.price * 100),
      name_snapshot: item.name,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      // Supprimer la commande si les items échouent
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { error: 'Erreur lors de la création des articles de commande', details: itemsError.message },
        { status: 500 }
      )
    }

    // Utiliser le coupon si applicable
    if (couponId && userId) {
      try {
        const { data: coupon } = await supabase
          .from('coupons')
          .select('*')
          .eq('id', couponId)
          .single()

        if (coupon) {
          await supabase.from('coupon_usages').insert({
            coupon_id: couponId,
            user_id: userId,
            order_id: order.id,
            discount_amount_cents: Math.round((totalCents * (coupon.discount_percent || 0)) / 100),
          })
        }
      } catch (error) {
        // Ignorer les erreurs de coupon - ce n'est pas critique
        console.warn('Error applying coupon:', error)
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        total_cents: order.total_cents,
        currency: order.currency,
      },
    })
  } catch (error: any) {
    console.error('Error in create order API:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    )
  }
}
