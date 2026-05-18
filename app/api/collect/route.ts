import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// Mensagens padrão do sistema (Fallback) caso o lojista não tenha configurado nada
const SYSTEM_FALLBACKS: Record<string, any> = {
  shipping_doubt: {
    title: '📦 Frete Grátis?',
    message: 'Notamos que você tem dúvidas sobre a entrega. Que tal um cupom de frete grátis?',
    buttonText: 'Quero meu cupom',
    color: '#2563eb'
  },
  price_hesitation: {
    title: '💰 Oferta Especial',
    message: 'Este produto é incrível! Garanta o seu agora com um desconto exclusivo.',
    buttonText: 'Aproveitar Agora',
    color: '#059669'
  },
  cart_abandonment: {
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

    // 2. Log do evento (Histórico)
    await supabase.from('events').insert({ 
      store_id: store.id, 
      event_type, 
      payload: payload || {} 
    })

    // 3. Definição da Intenção (Aqui você pode expandir a lógica de IA no futuro)
    // Por enquanto, assumimos que o event_type enviado pelo SDK é a intenção
    const intent = event_type; 

    // 4. Busca de Intervenção Personalizada no Banco de Dados
    const { data: customIntervention, error: fetchError } = await supabase
      .from('interventions')
      .select('*')
      .eq('store_id', store.id)
      .eq('intent', intent)
      .eq('is_active', true)
      .single()

    // 5. Lógica de Resposta: Prioridade para Custom $\rightarrow$ depois Fallback $\rightarrow$ depois Default
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

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } })
}
