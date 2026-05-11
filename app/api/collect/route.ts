import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  try {
    const body = await req.json()
    const { api_key, event_type, payload } = body

    if (!api_key) return NextResponse.json({ error: 'No API Key' }, { status: 400, headers: corsHeaders })

    const supabase = await createClient()
    const { data: store } = await supabase.from('stores').select('id').eq('api_key', api_key).single()
    if (!store) return NextResponse.json({ error: 'Invalid API Key' }, { status: 403, headers: corsHeaders })

    // 1. Salva o evento
    const { data: eventData } = await supabase
      .from('events')
      .insert({ store_id: store.id, event_type, payload })
      .select().single()

    // 2. Motor de IA para definir Intenção e INTERVENÇÃO
    let intent = 'general'
    let intervention = null // Aqui definimos a ação de recuperação

    if (event_type === 'shipping_doubt') {
      intent = 'shipping'
      intervention = {
        title: '🚚 Frete Grátis!',
        message: 'Notamos que você quer economizar no frete. Use o cupom FRETEGRATIS e finalize sua compra!',
        buttonText: 'Aplicar Cupom',
        color: '#2563eb'
      }
    } else if (event_type === 'cart_abandonment') {
      intent = 'checkout'
      intervention = {
        title: '⌛ Não vá embora!',
        message: 'Seu carrinho está reservado, mas por pouco tempo. Ganhe 5% de desconto agora!',
        buttonText: 'Pegar Desconto',
        color: '#ea580c'
      }
    }

    // 3. Salva o diagnóstico
    await supabase.from('diagnostics').insert({
      store_id: store.id,
      event_id: eventData?.id,
      intent: intent,
      confidence: 0.98,
      payload
    })

    // RETORNO CRUCIAL: Enviamos a intervenção de volta para o SDK
    return NextResponse.json({ 
      success: true, 
      intent, 
      intervention // O SDK vai ler isso e mostrar o pop-up!
    }, { status: 200, headers: corsHeaders })

  } catch (error: any) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500, headers: corsHeaders })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } })
}
