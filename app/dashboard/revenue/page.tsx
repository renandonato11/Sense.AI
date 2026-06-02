'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DollarSign, TrendingUp, ShoppingCart, Award } from 'lucide-react'

export default function RevenuePage() {
  const supabase = createClient()
  const [sales, setSales] = useState<any[]>([])
  const [metrics, setMetrics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFinancials() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).single()
      
      if (store) {
        // 1. Busca todas as vendas recuperadas
        const { data: salesData } = await supabase
          .from('recovered_sales')
          .select('*')
          .eq('store_id', store.id)
          .order('created_at', { ascending: false })

        // 2. Busca métricas de impressões/cliques para calcular a taxa
        const { data: metricsData } = await supabase
          .from('intervention_metrics')
          .select('*')
          .eq('store_id', store.id)
        
        setSales(salesData || [])
        setMetrics(metricsData || [])
      }
      setLoading(false)
    }
    loadFinancials()
  }, [])

  // Cálculo de Receita Total
  const totalRecovered = sales.reduce((acc, sale) => acc + (sale.sale_value || 0), 0)

  // Cálculo de Taxa de Conversão Geral
  const totalClicks = metrics.reduce((acc, m) => acc + (m.clicks || 0), 0)
  const totalImpressions = metrics.reduce((acc, m) => acc + (m.impressions || 0), 0)
  const conversionRate = totalImpressions > 0 ? ((sales.length / totalImpressions) * 100).toFixed(2) : '0'

  if (loading) return <div className="p-8 text-center">Carregando relatório financeiro...</div>

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="text-green-500" />
            Receita Recuperada
          </h1>
          <p className="text-gray-500">O impacto financeiro real da IA no seu e-commerce.</p>
        </div>
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold animate-pulse">
          SISTEMA DE ROI ATIVO
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-green-500 bg-green-50/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-full"><TrendingUp size={24}/></div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Recuperado</p>
                <p className="text-3xl font-black text-green-600">R$ {totalRecovered.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 bg-blue-50/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><ShoppingCart size={24}/></div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Vendas Salvas</p>
                <p className="text-3xl font-black text-blue-600">{sales.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-purple-50/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-full"><Award size={24}/></div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Taxa de Recuperação</p>
                <p className="text-3xl font-black text-purple-600">{conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABELA DE VENDAS RECENTES */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas Recuperadas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Intenção Recuperada</TableHead>
                <TableHead className="text-right">Valor da Venda</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="text-gray-500">
                    {new Date(sale.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <span className="uppercase font-bold text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-600">
                      {sale.intent}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    R$ {sale.sale_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))}
              {sales.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-12 text-gray-400 italic">
                    Nenhuma venda recuperada ainda. Continue otimizando seus pop-ups!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
