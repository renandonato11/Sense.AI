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
    const { api_key, event_type } = body

    const supabase = await createClient()
    const { data: store } = await supabase.from('stores').select('id').eq('api_key', api_key).single()

    if (!store) return NextResponse.json({ error: 'Invalid API Key' }, { status: 403, headers: corsHeaders })

    // Salva o evento no banco (apenas para manter o histórico)
    await supabase.from('events').insert({ store_id: store.id, event_type, payload: {} })

    // FORÇANDO a resposta de intervenção para teste absoluto
    const mockIntervention = {
      title: '🚀 TESTE DE IA!',
      message: 'Se você está vendo isso, a API do Sense.Ai está funcionando perfeitamente!',
      buttonText: 'Incrível!',
      color: '#2563eb'
    }

    return NextResponse.json({ 
      success: true, 
      intent: 'test', 
      intervention: mockIntervention 
    }, { status: 200, headers: corsHeaders })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } })
}
