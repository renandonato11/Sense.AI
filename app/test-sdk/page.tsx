"use client"

import { useState } from 'react'

export default function TestSdkPage() {
  const [log, setLog] = useState('Aguardando cliques...')

  async function sendSignal(type: string) {
    const API_URL = '/api/collect'; // Agora usamos caminho relativo, sem CORS!
    const API_KEY = 'sa_live_test_123';

    setLog(`Enviando ${type}...`);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: API_KEY,
          event_type: type,
          payload: { url: window.location.href, source: 'internal_test' }
        })
      });

      if (response.ok) {
        setLog("✅ SUCESSO: Sinal capturado!");
        alert("Sinal enviado com sucesso!");
      } else {
        const errorText = await response.text();
        setLog(`❌ ERRO ${response.status}: ${errorText}`);
      }
    } catch (err: any) {
      setLog(`💥 ERRO CRÍTICO: ${err.message}`);
    }
  }

  return (
    <div style={{ 
      fontFamily: 'sans-serif', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '20px', 
      paddingTop: '50px' 
    }}>
      <h1>Simulador Interno Sense.Ai</h1>
      <p>Agora sem erros de CORS!</p>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => sendSignal('shipping_doubt')}
          style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#000', color: '#fff', borderRadius: '8px' }}
        >
          Simular Dúvida de Frete
        </button>
        
        <button 
          onClick={() => sendSignal('cart_abandonment')}
          style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#000', color: '#fff', borderRadius: '8px' }}
        >
          Simular Abandono de Carrinho
        </button>
      </div>

      <div style={{ 
        whiteSpace: 'pre-wrap', 
        background: '#eee', 
        padding: '20px', 
        borderRadius: '8px', 
        width: '80%', 
        fontFamily: 'monospace',
        marginTop: '20px',
        textAlign: 'center'
      }}>
        {log}
      </div>
    </div>
  )
}
