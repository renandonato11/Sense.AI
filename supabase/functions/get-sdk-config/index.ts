import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  // --- TRATAMENTO de CORS (Essencial para o SDK funcionar em qualquer site) ---
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      }
    })
  }

  try {
    const url = new URL(req.url)
    const apiKey = url.searchParams.get('apiKey')

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing API Key" }), { 
        status: 400, 
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } 
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 1. Validar API Key e pegar a store_id
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('api_key', apiKey)
      .single()

    if (storeError || !store) {
      return new Response(JSON.stringify({ error: "Invalid API Key" }), { 
        status: 401, 
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } 
      })
    }

    // 2. Pegar configurações daquela loja
    const { data: settings, error: settingsError } = await supabase
      .from('store_settings')
      .select('config')
      .eq('store_id', store.id)
      .single()

    return new Response(
      JSON.stringify({ config: settings?.config || {} }),
      { 
        headers: { 
          "Content-Type": "application/json", 
          "Access-Control-Allow-Origin": "*" 
        } 
      }
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } 
    })
  }
})
