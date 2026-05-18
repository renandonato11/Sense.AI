'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client' // Certifique-se de usar o client do supabase
import { Save, Settings2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner' // Ou qualquer biblioteca de toast que você esteja usando

// Definição das intenções que o sistema suporta
const SUPPORTED_INTENTS = [
  { 
    id: 'shipping_doubt', 
    label: 'Dúvida de Frete', 
    description: 'Acionada quando o usuário hesita no valor ou prazo de entrega.' 
  },
  { 
    id: 'price_hesitation', 
    label: 'Hesitação de Preço', 
    description: 'Acionada quando o usuário alterna muito entre produto e carrinho.' 
  },
  { 
    id: 'cart_abandonment', 
    label: 'Abandono de Carrinho', 
    description: 'Acionada quando o usuário tenta sair da página de checkout.' 
  },
  { 
    id: 'default', 
    label: 'Intervenção Padrão', 
    description: 'Mensagem de boas-vindas ou ajuda geral.' 
  },
]

export default function InterventionsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [interventions, setInterventions] = useState<any[]>([])
  const [editingIntent, setEditingIntent] = useState<any>(null)
  const [storeId, setStoreId] = useState<string | null>(null)

  useEffect(() => {
    fetchStoreAndInterventions()
  }, [])

  async function fetchStoreAndInterventions() {
    setLoading(true)
    
    // 1. Buscar a loja do usuário logado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (store) {
      setStoreId(store.id)
      
      // 2. Buscar intervenções já configuradas
      const { data: config } = await supabase
        .from('interventions')
        .select('*')
        .eq('store_id', store.id)

      setInterventions(config || [])
    }
    setLoading(false)
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const payload = {
      store_id: storeId,
      intent: editingIntent.id,
      title: formData.get('title') as string,
      message: formData.get('message') as string,
      button_text: formData.get('button_text') as string,
      color_hex: formData.get('color_hex') as string,
      is_active: true,
    }

    // Upsert: Insere se não existir, atualiza se existir (baseado na constraint UNIQUE de store_id + intent)
    const { error } = await supabase
      .from('interventions')
      .upsert(payload, { onConflict: 'store_id,intent' })

    if (error) {
      toast.error('Erro ao salvar configuração')
    } else {
      toast.success('Intervenção atualizada com sucesso!')
      setEditingIntent(null)
      fetchStoreAndInterventions() // Recarrega a lista
    }
  }

  if (loading) return <div className="p-8 text-center">Carregando configurações...</div>

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings2 className="w-8 h-8" />
          Gestão de Intervenções
        </h1>
        <p className="text-gray-500">Personalize as mensagens que a IA dispara para seus clientes.</p>
      </div>

      <div className="grid gap-4">
        {SUPPORTED_INTENTS.map((intent) => {
          const config = interventions.find(i => i.intent === intent.id)
          
          return (
            <div key={intent.id} className="bg-white border rounded-xl p-5 shadow-sm flex justify-between items-center">
              <div className="flex gap-4 items-start">
                <div className={`p-3 rounded-full ${config ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  {config ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{intent.label}</h3>
                  <p className="text-sm text-gray-500">{intent.description}</p>
                  {config && (
                    <div className="mt-2 text-xs font-medium text-indigo-600 bg-indigo-50 inline-block px-2 py-1 rounded">
                      Personalizado: "{config.title}"
                    </div>
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => setEditingIntent({ ...intent, ...config })}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium"
              >
                {config ? 'Editar Mensagem' : 'Configurar'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Modal de Edição */}
      {editingIntent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              Configurar: {editingIntent.label}
            </h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título do Pop-up</label>
                <input 
                  name="title" 
                  defaultValue={editingIntent.title || 'Olá!'} 
                  className="w-full p-2 border rounded-lg focus:ring-2 ring-indigo-500 outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem de Intervenção</label>
                <textarea 
                  name="message" 
                  defaultValue={editingIntent.message || ''} 
                  className="w-full p-2 border rounded-lg focus:ring-2 ring-indigo-500 outline-none h-24"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Texto do Botão</label>
                  <input 
                    name="button_text" 
                    defaultValue={editingIntent.button_text || 'Saber mais'} 
                    className="w-full p-2 border rounded-lg focus:ring-2 ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cor do Tema (Hex)</label>
                  <input 
                    type="color"
                    name="color_hex" 
                    defaultValue={editingIntent.color_hex || '#2563eb'} 
                    className="w-full h-10 p-1 border rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setEditingIntent(null)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <Save size={18} /> Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
