"use server"

import { createClient } from '@/utils/supabase/server'

export async function getStoreMetrics() {
  try {
    const supabase = await createClient()
    const userId = "27e64eb9-4b0b-4ffc-904a-5cec7099b0c7" 

    // TESTE 1: A conexão com o Supabase está funcionando?
    const { data: healthCheck } = await supabase.from('stores').select('id').limit(1)
    if (!healthCheck) throw new Error("Conexão com Supabase falhou: Nenhuma loja encontrada no banco")

    // TESTE 2: A loja do usuário existe?
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('owner_id', userId) 
      .single()

    if (storeError || !store) {
      throw new Error(`Erro ao buscar loja: ${storeError?.message || 'Loja não encontrada'}`)
    }

    // TESTE 3: Os eventos existem?
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('id') 
      .eq('store_id', store.id)

    if (eventsError) throw new Error(`Erro ao buscar eventos: ${eventsError.message}`)

    // Se chegou aqui, tudo funcionou!
    const totalEvents = eventsData ? eventsData.length : 0
    
    // Busca diagnósticos
    const { data: diagData } = await supabase
      .from('diagnostics')
      .select('*') 
      .eq('store_id', store.id)
    
    const diagnostics = diagData || []
    const totalDiagnostics = diagnostics.length

    const counts = diagnostics.reduce((acc: any, curr) => {
      const intent = curr.intent || 'unknown'
      acc[intent] = (acc[intent] || 0) + 1
      return acc
    }, {}) || {}

    const chartData = Object.entries(counts).map(([name, value]) => ({ name, value }))
    const shippingCount = diagnostics.filter(d => d.intent === 'shipping').length
    const shippingRate = totalDiagnostics > 0 ? (shippingCount / totalDiagnostics) * 100 : 0
    const estimatedRevenue = totalDiagnostics * 150 

    return {
      totalEvents,
      totalDiagnostics,
      chartData,
      estimatedRevenue,
      shippingRate,
      recentDiagnostics: diagnostics.slice(0, 10)
    }
  } catch (error: any) {
    // AQUI ESTÁ O SEGREDO: Vamos retornar o erro para a tela de Debug
    return { 
      totalEvents: 0, 
      totalDiagnostics: 0, 
      chartData: [], 
      estimatedRevenue: 0, 
      shippingRate: 0, 
      recentDiagnostics: [],
      error: error.message // <--- Enviamos o erro para a tela
    }
  }
}
