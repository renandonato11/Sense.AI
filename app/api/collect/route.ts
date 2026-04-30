import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { api_key, event_type, payload } = body

    if (!api_key) return NextResponse.json({ error: 'No API Key' }, { status: 400 })

    const supabase = await createClient()
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('api_key', api_key)
      .single()

    if (!store) return NextResponse.json({ error: 'Invalid API Key' }, { status: 403 })

    await supabase.from('events').insert({
      store_id: store.id,
      event_type,
      payload
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}
