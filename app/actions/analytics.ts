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

    // 1. Eventos Brutos
    const { data: eventsData } = await supabase
      .from('events')
      .select('id') 
      .eq('store_id', store.id)
    const totalEvents = eventsData ? eventsData.length : 0

    // 2. Diagnósticos da IA (Trazemos TUDO para não ter erro de contagem)
    const { data: diagData, error: diagError } = await supabase
      .from('diagnostics')
      .select('*') 
      .eq('store_id', store.id)
      .order('created_at', { ascending: false })

    if (diagError) console.error("Erro diagnósticos:", diagError)
    const diagnostics = diagData || []
    const totalDiagnostics = diagnostics.length

    // 3. Distribuição de Intenções
    const counts = diagnostics.reduce((acc: any, curr) => {
      const intent = curr.intent || 'unknown'
      acc[intent] = (acc[intent] || 0) + 1
      return acc
    }, {}) || {}

    const chartData = Object.entries(counts).map(([name, value]) => ({
      name,
      value
    }))

    // 4. Taxa de Frete (Cálculo Real)
    const shippingCount = diagnostics.filter(d => d.intent === 'shipping').length
    const shippingRate = totalDiagnostics > 0 
      ? (shippingCount / totalDiagnostics) * 100 
      : 0

    // 5. Receita Estimada
    const estimatedRevenue = totalDiagnostics * 150 

    return {
      totalEvents,
      totalDiagnostics,
      chartData,
      estimatedRevenue,
      shippingRate,
      recentDiagnostics: diagnostics.slice(0, 10) // Últimos 10
    }
  } catch (error: any) {
    console.error("Erro analytics:", error.message)
    return { totalEvents: 0, totalDiagnostics: 0, chartData: [], estimatedRevenue: 0, shippingRate: 0, recentDiagnostics: [] }
  }
}
