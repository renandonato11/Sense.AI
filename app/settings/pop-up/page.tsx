"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client' // Ajuste o path
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Eye, Layout } from "lucide-react"
import { toast } from "sonner"

// --- COMPONENTE DE SIMULADOR (O que o cliente vê no site dele) ---
function PopupPreview({ config }: { config: any }) {
  return (
    <div className="relative w-full h-full bg-slate-200 rounded-xl overflow-hidden border-4 border-slate-300 shadow-inner">
      {/* Mock do Site do Cliente */}
      <div className="w-full h-full bg-white p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="h-4 w-32 bg-slate-100 rounded" />
          <div className="flex gap-2">
            <div className="h-4 w-12 bg-slate-100 rounded" />
            <div className="h-4 w-12 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-8 w-3/4 bg-slate-100 rounded" />
          <div className="h-32 w-full bg-slate-50 rounded-lg" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-slate-50 rounded" />
            <div className="h-20 bg-slate-50 rounded" />
            <div className="h-20 bg-slate-50 rounded" />
          </div>
        </div>

        {/* O POP-UP REAL (Sincronizado com o Editor) */}
        <div 
          className="absolute bottom-8 right-8 w-80 p-6 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 duration-500"
          style={{ backgroundColor: config.primary_color, color: '#fff' }}
        >
          <h3 className="text-lg font-bold mb-2">{config.popup_title}</h3>
          <p className="text-sm opacity-90 mb-4">{config.popup_text}</p>
          <Button 
            className="w-full" 
            style={{ backgroundColor: '#fff', color: config.primary_color, fontWeight: 'bold' }}
          >
            {config.button_text}
          </Button>
        </div>
      </div>
      <div className="absolute top-4 left-4 bg-slate-800/50 text-white text-[10px] px-2 py-1 rounded uppercase font-bold">
        Simulador de Loja
      </div>
    </div>
  )
}

// --- PÁGINA PRINCIPAL DO EDITOR ---
export default function PopupEditorPage() {
  const supabase = createClient() // Cliente do lado do cliente
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Estado do Config (Default)
  const [config, setConfig] = useState({
    primary_color: '#6366f1',
    popup_title: 'Ei, não vá embora!',
    popup_text: 'Temos um desconto especial para você finalizar sua compra agora.',
    button_text: 'Quero meu desconto',
    enabled: true
  })

  useEffect(() => {
    async function loadSettings() {
      // Busca a loja do usuário logado
      const { data: { user } } = await supabase.auth.getUser()
      const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user?.id).single()
      
      if (store) {
        const { data: settings } = await supabase
          .from('store_settings')
          .select('config')
          .eq('store_id', store.id)
          .single()
        
        if (settings?.config) setConfig(settings.config)
      }
      setLoading(false)
    }
    loadSettings()
  }, [])

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: store } = await supabase.from('stores').select('id').eq('owner_id', user?.id).single()

    const { error } = await supabase
      .from('store_settings')
      .upsert({ 
        store_id: store?.id, 
        config: config,
        updated_at: new Date().toISOString() 
      })

    setSaving(false)
    if (error) toast.error("Erro ao salvar configurações")
    else toast.success("Alterações aplicadas ao site!")
  }

  if (loading) return <div className="p-8 text-center">Carregando Editor...</div>

  return (
    <div className="flex h-screen bg-slate-50">
      {/* LADO ESQUERDO: CONTROLES */}
      <div className="w-1/3 h-full bg-white border-r border-slate-200 overflow-y-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Layout className="text-primary" size={24} />
          <h1 className="text-xl font-bold">Editor de Intervenções</h1>
        </div>

        <Tabs defaultValue="visual" className="space-y-6">
          <TabsList className="w-full">
            <TabsTrigger value="visual" className="flex-1">Visual</TabsTrigger>
            <TabsTrigger value="copy" className="flex-1">Conteúdo</TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="space-y-4">
            <div className="space-y-2">
              <Label>Cor Principal do Pop-up</Label>
              <div className="flex gap-3">
                <Input 
                  type="color" 
                  className="w-12 h-10 p-1 cursor-pointer" 
                  value={config.primary_color} 
                  onChange={(e) => setConfig({...config, primary_color: e.target.value})}
                />
                <Input 
                  value={config.primary_color} 
                  onChange={(e) => setConfig({...config, primary_color: e.target.value})}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="copy" className="space-y-4">
            <div className="space-y-2">
              <Label>Título do Pop-up</Label>
              <Input 
                value={config.popup_title} 
                onChange={(e) => setConfig({...config, popup_title: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Texto de Apoio</Label>
              <Input 
                value={config.popup_text} 
                onChange={(e) => setConfig({...config, popup_text: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Texto do Botão</Label>
              <Input 
                value={config.button_text} 
                onChange={(e) => setConfig({...config, button_text: e.target.value})} 
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-12 pt-6 border-t border-slate-100">
          <Button 
            className="w-full gap-2" 
            onClick={handleSave} 
            disabled={saving}
          >
            {saving ? <span className="animate-spin">🌀</span> : <Save size={18} />}
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* LADO DIREITO: SIMULADOR */}
      <div className="w-2/3 h-full p-8 flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 mb-4 text-slate-500">
          <Eye size={18} />
          <span className="text-sm font-medium">Visualização em Tempo Real</span>
        </div>
        <PopupPreview config={config} />
      </div>
    </div>
  )
}
