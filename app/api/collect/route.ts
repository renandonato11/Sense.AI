import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// Mensagens padrão do sistema (Fallback)
const SYSTEM_FALLBACKS: Record<string, any> = {
  shipping: { // Ajustei para 'shipping' para bater com o Dashboard
    title: '📦 Frete Grátis?',
    message: 'Notamos que você tem dúvidas sobre a entrega. Que tal um cupom de frete grátis?',
    buttonText: 'Quero meu cupom',
    color: '#2563eb'
  },
  price: { // Ajustei para 'price'
    title: '💰 Oferta Especial',
    message: 'Este produto é incrível! Garanta o seu agora com um desconto exclusivo.',
    buttonText: 'Aproveitar Agora',
    color: '#059669'
  },
  distraction: { // Ajustei para 'distraction'
    title: '🛒 Não esqueça seu carrinho!',
    message: 'Seus itens selecionados estão esperando por você. Finalize sua compra agora.',
    buttonText: 'Voltar ao Carrinho',
    color: '#dc2626'
  },
  default: {
    title: '✨ Olá!',
    message: 'Bem-vindo à nossa loja! Precisando de ajuda com algo?',
    buttonText: 'Falar com Atendente',
    color: '#4f46e5'
  }
}

export async function POST(req: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }

  try {
    const body = await req.json()
    const { api_key, event_type, payload } = body

    const supabase = await createClient()
    
    // 1. Validação da Loja
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('api_key', api_key)
      .single()

    if (!store) {
      return NextResponse.json({ error: 'Invalid API Key' }, { status: 403, headers: corsHeaders })
    }

    // =========================================================================
    // LÓGICA de RASTREAMENTO DE CLIQUE (CONVERSÃO)
    // =========================================================================
    if (event_type === 'intervention_clicked') {
      const intent = payload?.intent || 'default';

      // Busca cliques atuais para incrementar
      const { data: metric } = await supabase
        .from('intervention_metrics')
        .select('clicks')
        .eq('store_id', store.id)
        .eq('intent', intent)
        .single();

      const currentClicks = metric?.clicks || 0;

      // Atualiza ou cria a métrica de clique
      await supabase
        .from('intervention_metrics')
        .upsert({ 
          store_id: store.id, 
          intent: intent, 
          clicks: currentClicks + 1,
          updated_at: new Date().toISOString() 
        }, { onConflict: 'store_id,intent' });

      return NextResponse.json({ 
        success: true, 
        message: 'Conversão registrada!' 
      }, { status: 200, headers: corsHeaders })
    }
    // =========================================================================

    // 2. Log do evento no histórico (Sinais de comportamento)
    await supabase.from('events').insert({ 
      store_id: store.id, 
      event_type, 
      payload: payload || {} 
    })

    // 3. Definição da Intenção
    const intent = event_type; 

    // 4. Busca de Intervenção Personalizada
    const { data: customIntervention } = await supabase
      .from('interventions')
      .select('*')
      .eq('store_id', store.id)
      .eq('intent', intent)
      .eq('is_active', true)
      .single()

     // 5. Lógica de Resposta
    let finalIntervention;

    if (customIntervention) {
      finalIntervention = {
        title: customIntervention.title,
        message: customIntervention.message,
        buttonText: customIntervention.button_text,
        color: customIntervention.color_hex,
      }
    } else {
      finalIntervention = SYSTEM_FALLBACKS[intent] || SYSTEM_FALLBACKS.default;
    }

    // =========================================================================
    // REGISTRO DE IMPRESSÃO (Lógica de CTO: Contando quantas vezes o pop-up apareceu)
    // =========================================================================
    try {
      // 1. Busca a quantidade de impressões atual para esta loja e intenção
      const { data: impMetric } = await supabase
        .from('intervention_metrics')
        .select('impressions')
        .eq('store_id', store.id)
        .eq('intent', intent)
        .single();

      const currentImpressions = impMetric?.impressions || 0;

      // 2. Atualiza somando +1 (Upsert garante que cria a linha se ela não existir)
      await supabase
        .from('intervention_metrics')
        .upsert({ 
          store_id: store.id, 
          intent: intent, 
          impressions: currentImpressions + 1,
          updated_at: new Date().toISOString() 
        }, { onConflict: 'store_id,intent' });
      
    } catch (metricError) {
      // Logamos o erro, mas não travamos a API. 
      // O cliente deve receber o pop-up mesmo se a contagem de métricas falhar.
      console.error('Erro ao registrar impressão:', metricError);
    }
    // =========================================================================

    return NextResponse.json({ 
      success: true, 
      intent: intent, 
      intervention: finalIntervention 
    }, { status: 200, headers: corsHeaders })

  } catch (error: any) {
    console.error('Collect Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
}

