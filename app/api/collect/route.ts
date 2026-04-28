import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { api_key, event_type, payload } = body

    if (!api_key) {
      return NextResponse.json({ error: 'API Key is missing' }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Verificar se a loja existe com essa API Key
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('api_key', api_key)
      .single()

    if (storeError || !store) {
      return NextResponse.json({ error: 'Invalid API Key' }, { status: 403 })
    }

    // 2. Salvar o evento no banco de dados
    const { error: eventError } = await supabase
      .from('events')
      .insert({
        store_id: store.id,
        event_type,
        payload
      })

    if (eventError) {
      throw eventError
    }

    return NextResponse.json({ success: true, message: 'Sinal capturado!' }, { status: 200 })

  } catch (error: any) {
    console.error('Erro na coleta:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
