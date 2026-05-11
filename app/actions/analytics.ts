"use server"

import { createClient } from '@/utils/supabase/server'

export async function getStoreMetrics() {
  const supabase = await createClient()
  const userId = "27e64eb9-4b0b-4ffc-904a-5cec7099b0c7" 

  try {
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('owner_id', userId) 
      .single()

    if (!store) throw new Error("Loja não encontrada")

    const { data: eventsData } = await supabase
      .from('events')
      .select('id') 
      .eq('store_id', store.id)
    const totalEvents = eventsData ? eventsData.length : 0

    // Buscamos as colunas explicitamente para evitar erros de case-sensitivity
    const { data: diagData, error: diagError } = await supabase
      .from('diagnostics')
      .select('id, session_id, intent, confidence, created_at') 
      .eq('store_id', store.id)
      .order('created_at', { ascending: false })

    if (diagError) console.error("Erro diagnósticos:", diagError)
    
    // Mapeamento Forçado: Garante que os nomes batam com o componente visual
    const processedDiagnostics = (diagData || []).map(diag => ({
      id: diag.id,
      session_id: diag.session_id,
      intent: diag.intent || 'Unknown', // Garante que nunca fique vazio
      confidence: diag.confidence || 0,
      created_at: diag.created_at
    }))

    const totalDiagnostics = processedDiagnostics.length

    const counts = processedDiagnostics.reduce((acc: any, curr) => {
      const intent = curr.intent
      acc[intent] = (acc[intent] || 0) + 1
      return acc
    }, {}) || {}

    const chartData = Object.entries(counts).map(([name, value]) => ({
      name,
      value
    }))

    const shippingCount = processedDiagnostics.filter(d => d.intent === 'shipping').length
    const shippingRate = totalDiagnostics > 0 ? (shippingCount / totalDiagnostics) * 100 : 0
    const estimatedRevenue = totalDiagnostics * 150 

    return {
      totalEvents,
      totalDiagnostics,
      chartData,
      estimatedRevenue,
      shippingRate,
      recentDiagnostics: processedDiagnostics.slice(0, 15) 
    }
  } catch (error: any) {
    console.error("Erro analytics:", error.message)
    return { totalEvents: 0, totalDiagnostics: 0, chartData: [], estimatedRevenue: 0, shippingRate: 0, recentDiagnostics: [] }
  }
}
