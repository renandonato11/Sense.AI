"use server"

import { createClient } from '@/utils/supabase/server'
import Stripe from 'stripe'

// Inicializa o Stripe com a Secret Key (pegue no painel do Stripe)
// A chave deve estar no seu arquivo .env.local como SUPABASE_SERVICE_ROLE_KEY ou STRIPE_SECRET_KEY
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia' as any,
})

export async function createCheckoutSession(priceId: string) {
  const supabase = await createClient()
  
  // ==========================================================================
  // MODO DEVELOPER: Bypass de Autenticação
  // Usamos o seu ID fixo para evitar que o servidor diga "Usuário não autenticado"
  // ==========================================================================
  const userId = "27e64eb9-4b0b-4ffc-904a-5cec7099b0c7" 
  // ==========================================================================

  // 1. Buscar a loja vinculada a esse usuário
  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('owner_id', userId)
    .single()

  if (!store) {
    console.error("Erro ao criar checkout: Loja não encontrada para o ID", userId)
    throw new Error("Loja não encontrada. Por favor, complete o onboarding.")
  }

  // 2. Criar a sessão de checkout do Stripe
  // Aqui é onde a mágica acontece: o Stripe gera um link de pagamento único
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId, // O ID do preço (price_...) que você pegou no Stripe
        quantity: 1,
      },
    ],
    mode: 'subscription', // Define que é uma assinatura mensal/anual
    
    // URLs para onde o cliente volta após pagar ou cancelar
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?canceled=true`,
    
    // METADADOS: O Webhook usará isso para saber qual loja atualizar para PRO no banco
    metadata: {
      storeId: store.id,
      userId: userId,
    },
  })

  // Retorna a URL do Stripe para o Frontend redirecionar o usuário
  return { url: session.url }
}
