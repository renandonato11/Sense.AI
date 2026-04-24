import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()
    const { storeId, events, sessionId } = body

    console.log(`[START] Analisando sessão: ${sessionId} para a loja: ${storeId}`)

    const supabaseClient = createClient(
      Deno.env.get('SENSE_URL') ?? '', 
      Deno.env.get('SENSE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. SIMULADOR de IA
    const eventTypes = events.map((e: any) => e.event_type || e.type).join(',').toLowerCase()
    let diagnosis = { intent: 'CONFIDENT', confidence: 0.5, reason: 'Fluxo normal' }

    if (eventTypes.includes('shipping')) {
      diagnosis = { intent: 'SHIPPING_DOUBT', confidence: 0.9, reason: 'Interagiu com frete' }
    } else if (eventTypes.includes('exit')) {
      diagnosis = { intent: 'DISTRACTED', confidence: 0.7, reason: 'Saiu da aba' }
    }

    console.log(`[MOCK AI] Decisão: ${diagnosis.intent}`)

    // 2. TENTATIVA DE SALVAR NO BANCO (Com log detalhado)
    console.log(`[DB] Tentando inserir na tabela diagnostics...`)
    const { data, error: dbError } = await supabaseClient
      .from('diagnostics')
      .insert({
        session_id: sessionId,
        store_id: storeId,
        intent_label: diagnosis.intent,
        confidence_score: diagnosis.confidence,
        evidence: { reason: diagnosis.reason }
      })
      .select() // O .select() força o retorno do dado inserido

    if (dbError) {
      console.error(`[DB ERROR FATAL]: ${dbError.message}`)
      console.error(`[DB DETAILS]: SessionID=${sessionId}, StoreID=${storeId}`)
      return new Response(JSON.stringify({ error: dbError.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`[SUCCESS] Linha salva com sucesso! ID: ${data?.[0]?.id}`)

    return new Response(JSON.stringify(diagnosis), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error(`[CRITICAL ERROR]: ${error.message}`)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
