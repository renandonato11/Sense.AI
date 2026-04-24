"use client"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [configs, setConfigs] = useState<{ [key: string]: any }>({
    SHIPPING_DOUBT: { title: '', message: '', color: '#2563eb' },
    PRICE_HESITATION: { title: '', message: '', color: '#059669' },
    DISTRACTED: { title: '', message: '', color: '#dc2626' },
  })

  // Carregar configurações atuais do banco
  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('store_settings').select('*');
      if (data) {
        data.forEach(item => {
          setConfigs(prev => ({ ...prev, [item.intent_label]: item }));
        });
      }
    }
    loadSettings();
  }, []);

    const saveSetting = async (intent: string) => {
    setLoading(true)
    const config = configs[intent]
    
    // O segredo está no segundo argumento do upsert: { onConflict: 'store_id,intent_label' }
    // Isso diz ao Supabase: "Se você encontrar a mesma loja e a mesma intenção, APAGUE a antiga e salve a nova"
    const { error } = await supabase
      .from('store_settings')
      .upsert(
        { 
          store_id: '3f5e37a5-dedc-4039-acdf-b3652787d2e6', 
          intent_label: intent, 
          title: config.title, 
          message: config.message, 
          color: config.color 
        },
        { onConflict: 'store_id,intent_label' } // <--- ESSA LINHA RESOLVE O ERRO
      )

    if (error) {
      console.error("Erro detalhado:", error);
      alert("Erro ao salvar: " + error.message);
    } else {
      alert("Configuração salva com sucesso!");
    }
    setLoading(false)
  }


  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold">Configurações de Intervenção</h1>
      <p className="text-slate-500">Personalize o que seus clientes verão no momento da hesitação.</p>

      <div className="grid grid-cols-1 gap-6">
        {Object.entries(configs).map(([intent, values]) => (
          <Card key={intent}>
            <CardHeader>
              <CardTitle className="text-lg font-mono text-blue-600">{intent}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título do Pop-up</Label>
                  <Input 
                    value={values.title} 
                    onChange={(e) => setConfigs({...configs, [intent]: {...values, title: e.target.value}})} 
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
              </div>
              <div className="space-y-2">
                <Label>Mensagem de Recuperação</Label>
                <Input 
                  value={values.message} 
                  onChange={(e) => setConfigs({...configs, [intent]: {...values, message: e.target.value}})} 
                />
              </div>
              <Button onClick={() => saveSetting(intent)} disabled={loading}>
                {loading ? "Salvando..." : "Salvar Configuração"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
