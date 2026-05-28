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
  const [storeId, setStoreId] = useState<string | null>(null) // ID agora é dinâmico
  
  const [configs, setConfigs] = useState<{ [key: string]: any }>({
    shipping: { title: '', message: '', button_text: '', color: '#2563eb' },
    price: { title: '', message: '', button_text: '', color: '#059669' },
    distraction: { title: '', message: '', button_text: '', color: '#dc2626' },
    confidence: { title: '', message: '', button_text: '', color: '#4f46e5' },
  })

  useEffect(() => {
    async function initializeStore() {
      try {
        // 1. Identifica o usuário logado
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) throw new Error("Usuário não autenticado")

        // 2. Busca a loja vinculada a este usuário (Coração do Multi-tenant)
        const { data: store, error: storeError } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', user.id)
          .single()

        if (storeError || !store) throw new Error("Loja não vinculada a este usuário")
        
        setStoreId(store.id)

        // 3. Carrega as configurações desta loja específica
        const { data: savedConfigs } = await supabase
          .from('interventions')
          .select('*')
          .eq('store_id', store.id)

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
      } catch (err: any) {
        console.error("Erro de inicialização:", err.message)
        toast.error(err.message)
      } finally {
        setLoading(false)
      }
    }
    initializeStore()
  }, [])

  const saveSetting = async (intent: string) => {
    if (!storeId) return toast.error("Erro: Loja não identificada")

    setSaving(true)
    const config = configs[intent]
    
    const { error } = await supabase
      .from('interventions')
      .upsert(
        { 
          store_id: storeId, // Agora usa o ID dinâmico do usuário
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
    if (error) toast.error("Erro ao salvar: " + error.message)
    else toast.success("Configuração salva!")
  }

  if (loading) return <div className="p-8 text-center">Autenticando e carregando loja...</div>

  return (
    // ... (o restante do JSX permanece igual ao código anterior)
  )
}
