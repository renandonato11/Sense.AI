"use client"

import { useState } from 'react'

export default function TestSdkPage() {
  const [log, setLog] = useState('Aguardando cliques...')
  const [intervention, setIntervention] = useState<any>(null)

  async function sendSignal(type: string) {
    const API_URL = '/api/collect'; 
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

      const data = await response.json();

      if (data.success) {
        setLog("✅ SUCESSO: Sinal capturado!");
        // Aqui está a mágica: se a API mandou uma intervenção, a gente ativa o pop-up!
        if (data.intervention) {
          setIntervention(data.intervention);
        }
      } else {
        setLog(`❌ ERRO: ${data.error}`);
      }
    } catch (err: any) {
      setLog(`💥 ERRO CRÍTICO: ${err.message}`);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 font-sans">
      <h1 className="text-4xl font-bold mb-2 text-slate-900">Sense.Ai <span className="text-blue-600">Interventions</span></h1>
      <p className="text-slate-500 mb-8 text-center">Simule o comportamento do usuário para disparar a IA de recuperação.</p>
      
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => sendSignal('shipping_doubt')}
          className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
        >
          Dúvida de Frete
        </button>
        
        <button 
          onClick={() => sendSignal('cart_abandonment')}
          className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
        >
          Abandono de Carrinho
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 w-full max-w-md text-center font-mono text-sm text-slate-600">
        {log}
      </div>

      {/* POP-UP DE INTERVENÇÃO (SÓ APARECE SE HOUVER INTERVENTION) */}
      {intervention && (
        <div className="fixed bottom-6 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-10 duration-300 z-50">
          <div className="p-4 text-white font-bold text-center" style={{ backgroundColor: intervention.color }}>
            {intervention.title}
          </div>
          <div className="p-6 text-center">
            <button 
              onClick={() => setIntervention(null)} 
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 p-1"
            >
              ✕
            </button>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              {intervention.message}
            </p>
            <button 
              onClick={() => setIntervention(null)}
              className="w-full py-3 rounded-lg text-white font-bold transition-opacity hover:opacity-90"
              style={{ backgroundColor: intervention.color }}
            >
              {intervention.buttonText}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
