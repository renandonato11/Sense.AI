"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createStore } from '../actions/store' // Ajuste o path
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Copy, Rocket } from "lucide-react"
import { toast } from "sonner" // Ou seu sistema de toast

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [storeData, setStoreData] = useState<{ name: string; domain: string }>({
    name: '',
    domain: '',
  })
  const [apiKey, setApiKey] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await createStore(storeData)
      setApiKey(result.store.api_key)
      setStep('success')
      toast.success("Loja configurada com sucesso!")
    } catch (error) {
      toast.error("Erro ao configurar loja. Verifique os dados.")
    } finally {
      setLoading(false)
    }
  }

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey)
    toast.success("API Key copiada!")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      {step === 'form' ? (
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <Rocket size={32} />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">Bem-vindo ao Sense.Ai</CardTitle>
            <CardDescription className="text-center">
              Vamos configurar sua loja para começar a capturar intenções.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Loja</Label>
                <Input 
                  id="name" 
                  placeholder="Ex: Minha Loja Fashion" 
                  required 
                  onChange={(e) => setStoreData({...storeData, name: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Domínio do Site</Label>
                <Input 
                  id="domain" 
                  placeholder="ex: www.loja.com.br" 
                  required 
                  onChange={(e) => setStoreData({...storeData, domain: e.target.value})} 
                />
              </div>
              <Button className="w-full" disabled={loading}>
                {loading ? "Configurando..." : "Criar Minha Loja 🚀"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-lg shadow-xl border-2 border-primary/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2 text-green-500">
              <CheckCircle2 size={48} />
            </div>
            <CardTitle className="text-2xl">Tudo pronto!</CardTitle>
            <CardDescription>Sua loja foi criada. Agora, instale o SDK no seu site.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Sua API Key Privada</Label>
              <div className="flex gap-2">
                <Input readOnly value={apiKey} className="font-mono bg-slate-100" />
                <Button onClick={copyKey} variant="outline" size="icon">
                  <Copy size={16} />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Snippet de Instalação</Label>
              <div className="relative group">
                <pre className="p-4 bg-slate-900 text-slate-200 rounded-lg text-xs overflow-x-auto font-mono">
                  {`<script 
  src="https://cdn.sense.ai/sdk.js" 
  data-api-key="${apiKey}" 
  async></script>`}
                </pre>
                <Button 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => {
                    navigator.clipboard.writeText(`<script src="https://cdn.sense.ai/sdk.js" data-api-key="${apiKey}" async></script>`);
                    toast.success("Snippet copiado!");
                  }}
                >
                  Copiar Código
                </Button>
              </div>
            </div>
            
            <Button className="w-full" onClick={() => router.push('/dashboard')}>
              Ir para o Dashboard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
