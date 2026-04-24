"use client"

import { useState } from 'react'
import { createCheckoutSession } from '../actions/billing'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

const PLANS = [
  {
    name: "Free",
    price: "R$ 0",
    description: "Perfeito para começar a testar a IA.",
    features: ["1.000 eventos/mês", "1 Pop-up básico", "Sinais de saída"],
    priceId: "price_free_id", 
    highlighted: false,
  },
    {
    name: "Pro",
    price: "R$ 97",
    description: "Ideal para lojas em crescimento.",
    features: ["10.000 eventos/mês", "Pop-ups ilimitados", "Análise de Frete IA", "Suporte Prioritário"],
    priceId: "price_1TPkrvDv7Ba8J4vbssiehBgk", // <--- O código real está aqui agora! ✅
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "R$ 497",
    description: "Para operações de alta escala.",
    features: ["Eventos Ilimitados", "Consultoria de CRO", "Integração Customizada", "Gerente de Conta"],
    priceId: "price_1TPkwODv7Ba8J4vbS2YFtATy",
    highlighted: false,
  },
]

// AQUI ESTÁ O SEGREDO: O 'export default' deve estar exatamente assim!
export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleUpgrade(priceId: string) {
    if (priceId === 'price_free_id') {
      toast.info("Você já está no plano Free!")
      return
    }

    setLoading(priceId)
    try {
      const result = await createCheckoutSession(priceId)
      if (result.url) {
        window.location.href = result.url
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao iniciar checkout.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Escolha seu Plano</h1>
        <p className="text-slate-500 text-lg">Aumente a conversão da sua loja com a inteligência da Sense.Ai</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <Card 
            key={plan.name} 
            className={`relative overflow-hidden transition-all hover:shadow-xl ${plan.highlighted ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' : 'border-slate-200'}`}
          >
            {plan.highlighted && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase">
                Mais Popular
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4 flex justify-center items-baseline gap-1">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className="text-slate-500 text-sm">/mês</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 size={16} className="text-green-500" />
                    {feature}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className={`w-full ${plan.highlighted ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900'}`}
                onClick={() => handleUpgrade(plan.priceId)}
                disabled={loading !== null}
              >
                {loading === plan.priceId ? "Processando..." : plan.name === "Free" ? "Plano Atual" : "Assinar Agora"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
