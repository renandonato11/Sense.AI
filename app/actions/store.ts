"use server"

import { createClient } from '../../utils/supabase/server' 
import { nanoid } from 'nanoid' 

export async function createStore(formData: { name: string; domain: string }) {
  const supabase = await createClient()

  // Seu ID já está aqui, agora sem a trava que causava o erro
  const userId = "27e64eb9-4b0b-4ffc-904a-5cec7099b0c7" 

  // Gerar API Key Profissional
  const apiKey = `sa_live_${nanoid(24)}`

  // Inserir a loja no banco de dados usando o ID fixo
  const { data, error } = await supabase
    .from('stores')
    .insert([
      { 
        name: formData.name, 
        domain: formData.domain, 
        api_key: apiKey, 
        owner_id: userId 
      }
    ])
    .select()
    .single()

  if (error) {
    console.error("Erro ao criar loja:", error)
    throw new Error(error.message)
  }

  // Criar configurações iniciais da loja
  await supabase.from('store_settings').insert([
    { 
      store_id: data.id, 
      config: {
        primary_color: '#000000',
        popup_title: 'Olá! Bem-vindo',
        popup_text: 'Como podemos ajudar você hoje?',
        button_text: 'Saber mais',
        enabled: true
      } 
    }
  ])

  return { store: data }
}
