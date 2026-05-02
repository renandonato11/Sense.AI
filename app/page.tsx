import { getStoreMetrics } from './actions/analytics'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  // 1. Buscamos os dados
  const metrics = await getStoreMetrics()

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: 'red', fontSize: '32px' }}>🛠️ MODO DEBUG: VERDADE DOS DADOS</h1>
      
      <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '600px' }}>
        <p style={{ fontSize: '20px' }}><strong>Sinais no Banco:</strong> {metrics.totalEvents}</p>
        <p style={{ fontSize: '20px' }}><strong>Diagnósticos da IA:</strong> {metrics.totalDiagnostics}</p>
        <p style={{ fontSize: '20px' }}><strong>Receita Estimada:</strong> R$ {metrics.estimatedRevenue}</p>
        <p style={{ fontSize: '20px' }}><strong>Taxa de Frete:</strong> {metrics.shippingRate}%</p>
        
        <hr style={{ margin: '20px 0' }} />
        
        <h3>Últimos Diagnósticos (Raw):</h3>
        <pre style={{ background: '#eee', padding: '10px', overflow: 'auto' }}>
          {JSON.stringify(metrics.recentDiagnostics, null, 2)}
        </pre>
      </div>

      <p style={{ marginTop: '20px', color: '#666' }}>
        Se os números acima forem 0, o problema está no <b>analytics.ts</b> ou na <b>conexão com o Supabase</b>.<br/>
        Se os números acima estiverem CORRETOS, o problema está no componente <b>MetricsView</b>.
      </p>
    </div>
  )
}
