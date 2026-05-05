import { getStoreMetrics } from './actions/analytics'
import MetricsView from "@/components/metrics-view"

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  // 1. Buscamos os dados reais (aqueles que vimos no modo debug)
  const metrics = await getStoreMetrics()

  // 2. Mapeamos os dados para o componente MetricsView
  // Garantimos que cada prop receba exatamente o que precisa
  return (
    <MetricsView 
      totalInterventions={metrics.totalDiagnostics} // Mostra os 50 diagnósticos
      shippingRate={metrics.shippingRate.toFixed(1)} // Mostra 20.0%
      recoveredRevenue={metrics.estimatedRevenue} // Mostra R$ 7500
      chartData={metrics.chartData} // Preenche o gráfico
      allDiagnostics={metrics.recentDiagnostics} // Preenche a tabela de sessões
    />
  );
}
