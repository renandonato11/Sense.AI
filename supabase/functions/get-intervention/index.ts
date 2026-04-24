import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// 1. Cabeçalhos de CORS para evitar erros de bloqueio do navegador
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Trata requisições de pré-vôo (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Captura o ID da Loja do corpo da requisição
    const body = await req.json()
    const { storeId } = body

    if (!storeId) {
      throw new Error("storeId é obrigatório")
    }

    console.log(`[SENSE] Iniciando busca de intervenção para a loja: ${storeId}`)

    // 3. INICIALIZAÇÃO DO CLIENTE (Aqui estava o erro anterior)
    // Criamos o cliente do Supabase usando os segredos SENSE_URL e SENSE_SERVICE_ROLE_KEY
    const supabaseClient = createClient(
      Deno.env.get('SENSE_URL') ?? '', 
      Deno.env.get('SENSE_SERVICE_ROLE_KEY') ?? ''
    )

    // 4. BUSCA O DIAGNÓSTICO ATUAL DA LOJA
    // Queremos saber qual a última intenção detectada (ex: SHIPPING_DOUBT)
    const { data: diagnosis, error: diagError } = await supabaseClient
      .from('diagnostics')
      .select('intent_label')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (diagError || !diagnosis) {
      console.log(`[SENSE] Sem diagnóstico ativo para a loja ${storeId}`)
      return new Response(JSON.stringify({ intervention: null }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // 5. BUSCA A CONFIGURAÇÃO PERSONALIZADA DO LOJISTA
    // Procuramos na tabela store_settings a frase e cor escolhida para aquela intenção
    const { data: setting, error: settingError } = await supabaseClient
      .from('store_settings')
      .select('title, message, color')
      .eq('store_id', storeId)
      .eq('intent_label', diagnosis.intent_label)
      .single()

    // Fallback: Se o lojista não configurou nada, usamos um padrão elegante
    const intervention = setting || {
      title: 'Sua Oferta Especial!',
      message: 'Temos um desconto exclusivo para você finalizar sua compra agora!',
      color: '#2563eb'
    };

    console.log(`[SENSE] Sucesso! Enviando intervenção: ${diagnosis.intent_label}`);

    return new Response(JSON.stringify({ intervention }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (error) {
    console.error(`[SENSE CRITICAL ERROR]: ${error.message}`)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})
