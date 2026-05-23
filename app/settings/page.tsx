"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function SettingsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // ID da sua loja forçado para eliminar o erro "Loja não encontrada"
  const forceStoreId = '435b09cb-fcef-4864-b6b8-f28f2a0ec10c';

  // Sincronizado com as chaves da API
  const [configs, setConfigs] = useState<{ [key: string]: any }>({
    shipping: { title: '', message: '', button_text: '', color: '#2563eb' },
    price: { title: '', message: '', button_text: '', color: '#059669' },
    distraction: { title: '', message: '', button_text: '', color: '#dc2626' },
    confidence: { title: '', message: '', button_text: '', color: '#4f46e5' },
  })

  useEffect(() => {
    async function loadSettings() {
      // Buscamos as intervenções usando o ID forçado
      const { data: savedConfigs } = await supabase
        .from('interventions')
        .select('*')
        .eq('store_id', forceStoreId)

      if (savedConfigs) {
        const newConfigs = { ...configs }
        savedConfigs.forEach(item => {
          newConfigs[item.intent] = {
            title: item.title,
            message: item.message,
            button_text: item.button_text,
            color: item.color_hex
          }
        })
        setConfigs(newConfigs)
      }
      setLoading(false)
    }
    loadSettings()
  }, [])

  const saveSetting = async (intent: string) => {
    setSaving(true)
    const config = configs[intent]
    
    const { error } = await supabase
      .from('interventions')
      .upsert(
        { 
          store_id: forceStoreId,
          intent: intent, 
          title: config.title, 
          message: config.message, 
          button_text: config.button_text, 
          color_hex: config.color,
          is_active: true 
        },
        { onConflict: 'store_id,intent' }
      )

    setSaving(false)
    if (error) {
      toast.error("Erro ao salvar: " + error.message)
    } else {
      toast.success("Configuração de " + intent + " salva!")
    }
  }

  if (loading) return <div className="p-8 text-center">Carregando configurações...</div>

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold">Configurações de Intervenção</h1>
        <p className="text-slate-500">Personalize o que seus clientes verão no momento da hesitação.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(configs).map(([intent, values]) => (
          <Card key={intent}>
            <CardHeader>
              <CardTitle className="text-lg font-mono text-blue-600 uppercase">
                {intent}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Título do Pop-up</Label>
                <Input 
                  value={values.title} 
                  onChange={(e) => setConfigs({...configs, [intent]: {...values, title: e.target.value}})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Mensagem de Recuperação</Label>
                <Input 
                  value={values.message} 
                  onChange={(e) => setConfigs({...configs, [intent]: {...values, message: e.target.value}})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Texto do Botão</Label>
                <Input 
                  value={values.button_text} 
                  onChange={(e) => setConfigs({...configs, [intent]: {...values, button_text: e.target.value}})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Cor de Fundo</Label>
                <div className="flex gap-2">
                  <Input type="color" value={values.color} 
                         onChange={(e) => setConfigs({...configs, [intent]: {...values, color: e.target.value}})} 
                         className="w-12 p-1 h-10" />
                  <Input value={values.color} 
                         onChange={(e) => setConfigs({...configs, [intent]: {...values, color: e.target.value}})} />
                </div>
              </div>
              <Button 
                className="w-full" 
                onClick={() => saveSetting(intent)} 
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar Configuração"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
