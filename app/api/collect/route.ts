import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// Função para lidar com a requisição de "pré-vôo" (Preflight) do navegador
export async function OPTIONS() {
  return NextResponse.json(
    {}, 
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  )
}

export async function POST(req: Request) {
  try {
    // Adiciona os headers de CORS na resposta do POST
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    const body = await req.json()
    const { api_key, event_type, payload } = body

    if (!api_key) {
      return NextResponse.json({ error: 'API Key is missing' }, { status: 400, headers: corsHeaders })
    }

    const supabase = await createClient()

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('api_key', api_key)
      .single()

    if (storeError || !store) {
      return NextResponse.json({ error: 'Invalid API Key' }, { status: 403, headers: corsHeaders })
    }

    const { error: eventError } = await supabase
      .from('events')
      .insert({
        store_id: store.id,
        event_type,
        payload
      })

    if (eventError) throw eventError

    return NextResponse.json({ success: true, message: 'Sinal capturado!' }, { status: 200, headers: corsHeaders })

  } catch (error: any) {
    console.error('Erro na coleta:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } })
  }
}
