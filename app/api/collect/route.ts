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
    
    // 1. Validar Loja
    const { data: store } = await supabase.from('stores').select('id').eq('api_key', api_key).single()
    if (!store) return NextResponse.json({ error: 'Invalid API Key' }, { status: 403, headers: corsHeaders })

    // 2. Salvar o Evento Bruto
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .insert({ store_id: store.id, event_type, payload })
      .select()
      .single()

    if (eventError) throw eventError

    // ==========================================================================
    // 🧠 MOTOR DE IA (SENSE.AI ENGINE)
    // ==========================================================================
    let intent = 'unknown'
    let confidence = 0.5

    // Lógica de Classificação de Intenções
    if (event_type === 'shipping_doubt') {
      intent = 'shipping' // Dúvida de Frete
      confidence = 0.98
    } else if (event_type === 'cart_abandonment') {
      intent = 'checkout' // Abandono de Carrinho
      confidence = 0.85
    } else if (event_type === 'price_comparison') {
      intent = 'price' // Comparação de Preço
      confidence = 0.92
    } else {
      intent = 'general'
      confidence = 0.60
    }

    // 3. Salvar o Diagnóstico da IA
    const { error: diagError } = await supabase
      .from('diagnostics')
      .insert({
        store_id: store.id,
        event_id: eventData.id,
        intent: intent,
        confidence: confidence,
        payload: { ...payload, analyzed_at: new Date() }
      })

    if (diagError) console.error("Erro ao salvar diagnóstico:", diagError)
    // ==========================================================================

    return NextResponse.json({ 
      success: true, 
      intent: intent, 
      confidence: confidence 
    }, { status: 200, headers: corsHeaders })

  } catch (error: any) {
    console.error('Erro na coleta:', error)
    return NextResponse.json({ error: 'Server Error' }, { status: 500, headers: corsHeaders })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } })
}
