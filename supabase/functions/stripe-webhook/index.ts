import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Trata requisições OPTIONS (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('stripe-signature')
    const body = await req.text()

    // Inicializa o Stripe com a chave secreta guardada nos Secrets do Supabase
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    })

    // 1. Valida se a requisição veio realmente do Stripe
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )

    // 2. Se o evento for "Checkout Completo", atualizamos a loja
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any
      const storeId = session.metadata.storeId

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )

      // Upgrade do Plano: De 'free' para 'pro'
      const { error: updateError } = await supabase
        .from('stores')
        .update({ plan_type: 'pro', is_active: true })
        .eq('id', storeId)

      if (updateError) throw updateError

      // Registra a assinatura na tabela de subscriptions
      await supabase.from('subscriptions').insert([
        {
          store_id: storeId,
          stripe_subscription_id: session.subscription,
          status: 'active',
        }
      ])
      
      console.log(`Loja ${storeId} atualizada para o plano PRO!`)
    }

    return new Response(JSON.stringify({ received: true }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (err) {
    console.error(`Erro no Webhook: ${err.message}`)
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})
