import { getStoreMetrics } from './actions/analytics'
import MetricsView from "@/components/metrics-view" // Mantemos seu componente visual

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // 1. Buscamos os dados reais e processados da nossa Action Enterprise
  const metrics = await getStoreMetrics()

  // 2. Mapeamos os dados da Action para o formato que o MetricsView espera
  // Isso garante que seus gráficos e cards funcionem sem mudar o componente visual
  return (
    <MetricsView 
  totalInterventions={metrics.totalEvents} // <--- Aqui estão os seus "7" sinais!
  shippingRate={metrics.shippingRate.toFixed(1)} 
  recoveredRevenue={metrics.estimatedRevenue}
  chartData={metrics.chartData}
  allDiagnostics={[]} 
/>
  );
}
