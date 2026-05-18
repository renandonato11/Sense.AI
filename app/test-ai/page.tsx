"use client"

import { useState } from 'react'

export default function Test-ai() {
  const [log, setLog] = useState('Aguardando cliques...')
  const [apiResponse, setApiResponse] = useState<string>('Nenhuma resposta ainda')
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
          payload: { url: window.location.href }
        })
      });

      const data = await response.json();
      setApiResponse(JSON.stringify(data, null, 2)); // MOSTRA A RESPOSTA BRUTA NA TELA

      if (data.success) {
        setLog("✅ SUCESSO: Sinal capturado!");
        if (data.intervention) {
          setIntervention(data.intervention);
        } else {
          setLog("⚠️ Sucesso, mas a API NÃO mandou a intervenção.");
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
      <h1 className="text-4xl font-bold mb-2 text-slate-900">Sense.Ai <span className="text-blue-600">Test</span></h1>
      
      <div className="flex gap-4 mb-8">
        <button onClick={() => sendSignal('shipping_doubt')} className="px-6 py-3 bg-black text-white rounded-xl font-medium">Frete</button>
        <button onClick={() => sendSignal('cart_abandonment')} className="px-6 py-3 bg-black text-white rounded-xl font-medium">Carrinho</button>
      </div>

      <div className="grid grid-cols-1 gap-4 w-full max-w-md">
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center font-bold">{log}</div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-green-400 font-mono text-xs overflow-auto max-h-40">
          <p className="text-slate-400 mb-2 underline">Resposta Bruta da API:</p>
          {apiResponse}
        </div>
      </div>

      {intervention && (
        <div className="fixed bottom-6 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-10 duration-300 z-50">
          <div className="p-4 text-white font-bold text-center" style={{ backgroundColor: intervention.color }}>
            {intervention.title}
          </div>
          <div className="p-6 text-center">
            <button onClick={() => setIntervention(null)} className="absolute top-2 right-2 text-slate-400">✕</button>
            <p className="text-slate-600 text-sm mb-6">{intervention.message}</p>
            <button onClick={() => setIntervention(null)} className="w-full py-3 rounded-lg text-white font-bold" style={{ backgroundColor: intervention.color }}>
              {intervention.buttonText}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
