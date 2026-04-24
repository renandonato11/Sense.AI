"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface MetricsViewProps {
  totalInterventions: number;
  shippingRate: string;
  recoveredRevenue: number;
  chartData: any[];
  allDiagnostics: any[];
}

export default function MetricsView({ 
  totalInterventions, 
  shippingRate, 
  recoveredRevenue, 
  chartData, 
  allDiagnostics 
}: MetricsViewProps) {
  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Visão Geral</h1>
          <p className="text-slate-500">Acompanhe a recuperação de intenções em tempo real.</p>
        </div>
        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          Sincronizado com SDK
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Intenções Detectadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-slate-900">{totalInterventions}</div>
            <p className="text-xs text-slate-400 mt-1">Sinais lidos pelo SDK</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Taxa de Dúvida Frete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">{shippingRate}%</div>
            <p className="text-xs text-slate-400 mt-1">Dos usuários analisados</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Receita Recuperada (Est.)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">R$ {recoveredRevenue.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-slate-400 mt-1">Baseado em taxa de 15% de conv.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle>Distribuição de Intenções</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" verticalHider />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle>Insights Rápidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-600 font-bold uppercase">Alerta de Frete</p>
              <p className="text-sm text-slate-700">Sua taxa de dúvida de frete está alta. Considere oferecer um cupom de frete grátis.</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
              <p className="text-xs text-green-600 font-bold uppercase">ROI Estimativo</p>
              <p className="text-sm text-slate-700">Com base nos dados, você pode recuperar aprox. R$ {recoveredRevenue} este mês.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader>
          <CardTitle>Últimos Diagnósticos da IA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                <tr>
                  <th className="px-6 py-3">Sessão</th>
                  <th className="px-6 py-3">Intenção</th>
                  <th className="px-6 py-3">Confiança</th>
                  <th className="px-6 py-3">Data</th>
                </tr>
              </thead>
              <tbody>
                {allDiagnostics?.slice(0, 15).map((diag: any) => (
                  <tr key={diag.id} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-xs">{diag.session_id?.substring(0, 8)}...</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${diag.intent_label === 'SHIPPING_DOUBT' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                        {diag.intent_label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {diag.confidence_score ? `${(diag.confidence_score * 100).toFixed(0)}%` : '0%'}
                    </td>
                    <td className="px-6 py-4">
                      {diag.created_at ? new Date(diag.created_at).toLocaleDateString('pt-BR') : 'Recente'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
