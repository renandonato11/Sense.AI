'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { 
  DollarSign, TrendingUp, ShoppingCart, 
  Award, AlertCircle, ArrowUpRight 
} from 'lucide-react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts'
import { toast } from 'sonner'

export default function RevenuePage() {
  const supabase = createClient()
  const [sales, setSales] = useState<any[]>([])
  const [metrics, setMetrics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const FOUNDER_STORE_ID = '435b09cb-fcef-4864-b6b8-f28f2a0ec10c';

  useEffect(() => {
    async function loadFinancials() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        let targetStoreId = FOUNDER_STORE_ID;

        if (user) {
          const { data: store } = await supabase
            .from('stores')
            .select('id')
            .eq('owner_id', user.id)
            .single()
          if (store) targetStoreId = store.id;
        }

        const [salesRes, metricsRes] = await Promise.all([
          supabase.from('recovered_sales').select('*').eq('store_id', targetStoreId).order('created_at', { ascending: true }),
          supabase.from('intervention_metrics').select('*').eq('store_id', targetStoreId)
        ])

        if (salesRes.error) throw new Error("Erro ao carregar vendas: " + salesRes.error.message)
        if (metricsRes.error) throw new Error("Erro ao carregar métricas: " + metricsRes.error.message)

        setSales(salesRes.data || [])
        setMetrics(metricsRes.data || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadFinancials()
  }, [])

  // --- LÓGICA de PROCESSAMENTO de DADOS PARA O GRÁFICO ---
  const processChartData = () => {
    const daysMap: Record<string, number> = {};
    
    sales.forEach(sale => {
      const date = new Date(sale.created_at).toLocaleDateString('pt-BR');
      daysMap[date] = (daysMap[date] || 0) + sale.sale_//value || 0;
    });

    return Object.entries(daysMap).map(([date, value]) => ({
      date,
      revenue: value
    }));
  }

  const totalRecovered = sales.reduce((acc, sale) => acc + (sale.sale_value || 0), 0)
  const totalImpressions = metrics.reduce((acc, m) => acc + (m.impressions || 0), 0)
  const conversionRate = totalImpressions > 0 ? ((sales.length / totalImpressions) * 100).toFixed(2) : '0'

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-screen space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      <p className="text-slate-500 animate-pulse">Analisando fluxo de caixa...</p>
    </div>
  )

  if (error) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-screen text-center">
      <AlertCircle size={48} className="text-red-500 mb-4" />
      <h1 className="text-2xl font-bold">Erro ao carregar dados</h1>
      <p className="text-slate-500 mb-6">{error}</p>
      <Button onClick={() => window.location.reload()} className="bg-blue-600 text-white">Tentar Novamente</Button>
    </div>
  )

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="text-green-500" />
            Centro de Receita
          </h1>
          <p className="text-gray-500">Acompanhe o lucro real gerado pela Inteligência do Sense.Ai</p>
        </div>
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold animate-pulse flex items-center gap-2">
          <TrendingUp size={16} />
          SISTEMA DE ROI ATIVO
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-green-500 bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Receita Total Recuperada</p>
                <p className="text-3xl font-black text-slate-900">R$ {totalRecovered.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="p-3 bg-green-100 text-green-600 rounded-2xl"><DollarSign size={24}/></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Vendas Recuperadas</p>
                <p className="text-3xl font-black text-slate-900">{sales.length}</p>
              </div>
              <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><ShoppingCart size={24}/</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Taxa de Conversão</p>
                <p className="text-3xl font-black text-slate-900">{conversionRate}%</p>
              </div>
              <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl"><Award size={24}/</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GRÁFICO DE TENDÊNCIA */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">Tendência de Receita Recuperada</CardTitle>
          <div className="text-green-600 flex items-center gap-1 text-sm font-bold">
            <ArrowUpRight size={16} />
            Crescimento Ativo
          </div >
        </CardHeader>
        <CardContent className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={processChartData()}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 12}} 
                tickFormatter={(value) => `R$ ${value}`}
              />
              <Tooltip 
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#22c55e" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorRev)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* TABELA DE VENDAS RECENTES */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Últimas Conversões</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Intenção</TableHead>
                <TableHead className="text-right">Valor Recuperado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="text-gray-500">{new Date(sale.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <span className="uppercase font-bold text-[10px] px-2 py-1 bg-slate-100 rounded-full text-slate-600">
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
                    Aguardando a primeira venda recuperada...
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
