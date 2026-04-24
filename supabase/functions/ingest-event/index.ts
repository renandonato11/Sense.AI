import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = { 
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS' 
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  
  try {
    // 1. Pegamos os dados exatamente como o SDK envia
    const { apiKey, event_type, session_id, payload } = await req.json()

    // 2. Usamos as variáveis padrão do Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. Validamos a API Key para descobrir qual é a loja (SaaS Multi-tenant)
    const { data: store } = await supabaseClient
      .from('stores')
      .select('id')
      .eq('api_key', apiKey)
      .single()

    if (!store) return new Response('Unauthorized: Invalid API Key', { status: 401, headers: corsHeaders })

    // 4. Gravamos a sessão (Sempre garantindo que ela exista)
    await supabaseClient.from('sessions').upsert({ 
      id: session_id, 
      store_id: store.id, 
      visitor_id: 'sdk_visitor' 
    })

    // 5. Gravamos o evento usando as colunas do NOVO banco (payload)
    const { error: insertError } = await supabaseClient.from('behavioral_events').insert([
      { 
        store_id: store.id, 
        session_id: session_id, 
        event_type: event_type, 
        payload: payload 
      }
    ])

    if (insertError) throw insertError

    // 6. Gatilho de IA: Chamamos a função de diagnóstico
    // Usamos a URL do projeto para garantir que a chamada funcione
    const projectUrl = Deno.env.get('SUPABASE_URL')
    Promise.resolve().then(async () => {
      await fetch(`${projectUrl}/functions/v1/diagnose-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          storeId: store.id, 
          sessionId: session_id, 
          eventType: event_type 
        })
      })
    })

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders })
  }
})
