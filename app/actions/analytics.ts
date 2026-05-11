"use server"

import { createClient } from '@/utils/supabase/server'

export async function getStoreMetrics() {
  const supabase = await createClient()
  const userId = "27e64eb9-4b0b-4ffc-904a-5cec7099b0c7" 

  try {
    const { data: store } = await supabase.from('stores').select('id').eq('owner_id', userId).single()
    if (!store) throw new Error("Loja não encontrada")

    const { data: eventsData } = await supabase.from('events').select('id').eq('store_id', store.id)
    const totalEvents = eventsData ? eventsData.length : 0

    // Buscamos TUDO explicitamente
    const { data: diagData } = await supabase
      .from('diagnostics')
      .select('*') 
      .eq('store_id', store.id)
      .order('created_at', { ascending: false })

    const diagnostics = diagData || []
    const totalDiagnostics = diagnostics.length

    // Mapeamento agressivo para garantir que o componente veja os dados
    const processedDiagnostics = diagnostics.map((d: any) => ({
      id: d.id,
      session_id: d.session_id || 'N/A',
      intent: d.intent || d.INTENT || d.intent_label || 'Unknown',
      confidence: d.confidence || d.CONFIDENCE || d.confidence_score || 0,
      created_at: d.created_at
    }))

    const counts = processedDiagnostics.reduce((acc: any, curr) => {
      const i = curr.intent
      acc[i] = (acc[i] || 0) + 1
      return acc
    }, {}) || {}

    const chartData = Object.entries(counts).map(([name, value]) => ({ name, value }))
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
    return { totalEvents: 0, totalDiagnostics: 0, chartData: [], estimatedRevenue: 0, shippingRate: 0, recentDiagnostics: [] }
  }
}
