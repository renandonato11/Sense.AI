"use server"

import { createClient } from '@/utils/supabase/server'

export async function getStoreMetrics() {
  const supabase = await createClient()
  
  // MODO DEVELOPER: Bypass de Autenticação
  const userId = "27e64eb9-4b0b-4ffc-904a-5cec7099b0c7" 

  try {
    // 1. Buscar a loja
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('owner_id', userId) 
      .single()

    if (!store) throw new Error("Loja não encontrada")

    // 2. Total de eventos (MÉTODO INFALÍVEL: Buscar IDs e contar o tamanho do array)
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('id') 
      .eq('store_id', store.id)

    if (eventsError) console.error("Erro eventos:", eventsError)
    const totalEvents = eventsData ? eventsData.length : 0

    // 3. Total de diagnósticos (IA)
    const { data: diagData } = await supabase
      .from('diagnostics')
      .select('id')
      .eq('store_id', store.id)
    
    const totalDiagnostics = diagData ? diagData.length : 0

    // 4. Distribuição de intenções
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

    // CÁLCULOS DE VALOR (Agora baseados nos eventos para você ver o resultado!)
    // Cada evento capturado gera uma estimativa de receita recuperável
    const estimatedRevenue = totalEvents * 150 

    const shippingRate = distribution && distribution.length > 0 
      ? (distribution.filter(d => d.intent === 'shipping').length / distribution.length) * 100 
      : 0;

    return {
      totalEvents: totalEvents,
      totalDiagnostics: totalDiagnostics,
      chartData,
      estimatedRevenue,
      shippingRate: shippingRate 
    }
  } catch (error: any) {
    console.error("Erro geral analytics:", error.message)
    return {
      totalEvents: 0,
      totalDiagnostics: 0,
      chartData: [],
      estimatedRevenue: 0,
      shippingRate: 0
    }
  }
}
