"use server"

import { createClient } from '@/utils/supabase/server'

export async function getStoreMetrics() {
  const supabase = await createClient()
  
  // ==========================================================================
  // MODO DEVELOPER: Bypass de Autenticação
  // ==========================================================================
  const userId = "27e64eb9-4b0b-4ffc-904a-5cec7099b0c7" 
  // ==========================================================================

  // 1. Buscar a loja usando o ID fixo
  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('owner_id', userId) 
    .single()

  if (!store) {
    console.error("Erro: Loja não encontrada para o ID", userId)
    throw new Error("Loja não encontrada. Certifique-se de ter feito o onboarding.")
  }

  // 2. Total de eventos capturados (CORRIGIDO: de 'behavioral_events' para 'events')
  const { count: eventCount } = await supabase
    .from('events') // <--- Agora apontando para a tabela correta!
    .select('*', { count: 'exact', head: true })
    .eq('store_id', store.id)

  // 3. Total de diagnósticos da IA (Pode ser 0 por enquanto)
  const { count: diagCount } = await supabase
    .from('diagnostics')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', store.id)

  // 4. Distribuição de intenções (IA)
  const { data: distribution } = await supabase
    .from('diagnostics')
    .select('intent')
    .eq('store_id', store.id)

  const counts = distribution?.reduce((acc: any, curr) => {
    acc[curr.intent] = (acc[curr.intent] || 0) + 1
    return acc
  }, {}) || {}

  const chartData = Object.entries(counts).map(([name, value]) => ({
    name,
    value
  }))

  // Cálculos de Receita e Taxas
  const recoveredSales = diagCount || 0
  const estimatedRevenue = recoveredSales * 150 

  const shippingRate = distribution && distribution.length > 0 
    ? (distribution.filter(d => d.intent === 'shipping').length / distribution.length) * 100 
    : 0;

  return {
    totalEvents: eventCount || 0, // Esse número agora vai subir!
    totalDiagnostics: diagCount || 0,
    chartData,
    estimatedRevenue,
    shippingRate: shippingRate 
  }
}
