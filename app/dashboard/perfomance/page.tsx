'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TrendingUp, MousePointer2, Eye, CheckCircle2 } from 'lucide-react'

export default function PerformancePage() {
  const supabase = createClient()
  const [metrics, setMetrics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMetrics() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user.id).single()
      
      if (store) {
        const { data } = await supabase
          .from('intervention_metrics')
          .select('*')
          .eq('store_id', store.id)
        
        setMetrics(data || [])
      }
      setLoading(false)
    }
    loadMetrics()
  }, [])

  const calculateConvRate = (clicks: number, impressions: number) => {
    if (!impressions) return '0%'
    return ((clicks / impressions) * 100).toFixed(1) + '%'
  }

  if (loading) return <div className="p-8 text-center">Carregando métricas...</div>

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingUp className="text-green-500" />
          Performance de Intervenções
        </h1>
        <p className="text-gray-500">Veja quais mensagens estão convertendo mais clientes em vendas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><Eye size={20}/></div>
              <div>
                <p className="text-sm text-gray-500">Total de Exibições</p>
                <p className="text-2xl font-bold">{metrics.reduce((acc, m) => acc + m.impressions, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-full"><MousePointer2 size={20}/></div>
              <div>
                <p className="text-sm text-gray-500">Total de Cliques</p>
                <p className="text-2xl font-bold">{metrics.reduce((acc, m) => acc + m.clicks, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-full"><CheckCircle2 size={20}/></div>
              <div>
                <p className="text-sm text-gray-500">Conv. Média Global</p>
                <p className="text-2xl font-bold">
                  {calculateConvRate(
                    metrics.reduce((acc, m) => acc + m.clicks, 0),
                    metrics.reduce((acc, m) => acc + m.impressions, 0)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Análise por Intenção</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Intenção</TableHead>
                <TableHead>Exibições</TableHead>
                <TableHead>Cliques</TableHead>
                <TableHead>Taxa de Conversão</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((m) => (
                <TableRow key={m.intent}>
                  <TableCell className="font-medium uppercase">{m.intent}</TableCell>
                  <TableCell>{m.impressions}</TableCell>
                  <TableCell>{m.clicks}</TableCell>
                  <TableCell className="font-bold text-green-600">{calculateConvRate(m.clicks, m.impressions)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${parseFloat(calculateConvRate(m.clicks, m.impressions)) > 5 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {parseFloat(calculateConvRate(m.clicks, m.impressions)) > 5 ? 'Alta Conv.' : 'Otimizar'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {metrics.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Nenhum dado coletado ainda. Comece a disparar intervenções!
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
