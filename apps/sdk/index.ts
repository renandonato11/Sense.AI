// apps/sdk/index.ts

type SenseEvent = { 
    type: string; 
    element?: string; 
    timestamp: number; 
};

class SenseAi {
    private storeId: string;
    private apiKey: string;
    private sessionId: string | null = null;
    private eventBuffer: SenseEvent[] = [];
    private interventionTriggered = false; // Garante que o pop-up não apareça repetidamente

    constructor(storeId: string, apiKey: string) {
        this.storeId = storeId;
        this.apiKey = apiKey;
        this.init();
    }

    private async init() {
        console.log("%c[Sense.Ai] 🚀 Inicializando Sistema...", "color: #2563eb; font-weight: bold; font-size: 14px;");
        
        // 1. Sincronização de Sessão
        this.sessionId = await this.ensureSession();
        console.log(`[Sense.Ai] 🆔 Sessão Ativa: ${this.sessionId}`);

        // 2. Monitoramento de Comportamento
        this.setupEventListeners();

        // 3. Loops de Background
        // Loop de Ingestão: Envia eventos ao servidor a cada 10 segundos
        setInterval(() => this.flush(), 10000); 
        
        // Loop de Intervenção: Pergunta ao servidor se há um pop-up a cada 5 segundos
        setInterval(() => this.checkForIntervention(), 5000); 
        
        console.log("[Sense.Ai] ✅ Monitoramento ativo. Aguardando comportamentos...");
    }

    private setupEventListeners() {
        // Detecção de Intenção de Saída (Exit Intent)
        document.addEventListener('mouseleave', () => {
            this.pushEvent('exit_intent');
        });

        // Detecção de Interação com Frete
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (target.innerText?.toLowerCase().includes('frete') || target.id?.includes('shipping')) {
                this.pushEvent('shipping_interaction', target.id);
            }
        });
    }

    private async ensureSession() {
        // Para o MVP, usamos o ID da Loja como ID de Sessão para garantir 100% de sincronia no banco
        return this.storeId; 
    }

    private pushEvent(type: string, element?: string) {
        this.eventBuffer.push({ 
            type, 
            element, 
            timestamp: Date.now() 
        });
        console.log(`%c[Sense.Ai] 📥 Evento capturado: ${type}`, "color: #666; font-style: italic;");
    }

    private async flush() {
        if (this.eventBuffer.length === 0) return;

        const payload = { 
            storeId: this.storeId, 
            apiKey: this.apiKey, 
            sessionId: this.sessionId, 
            events: this.eventBuffer 
        };
        
        this.eventBuffer = []; // Limpa o buffer imediatamente

        try {
            const response = await fetch('https://mtkrhkqinwlddeksauqb.supabase.co/functions/v1/ingest-event', {
                method: 'POST', 
                body: JSON.stringify(payload), 
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                console.log("[Sense.Ai] ☁️ Eventos sincronizados com a nuvem.");
            } else {
                console.error(`[Sense.Ai] ❌ Erro ao sincronizar: ${response.status}`);
            }
        } catch (e) { 
            console.error("[Sense.Ai] 🚨 Falha de conexão com o servidor de ingestão:", e); 
        }
    }

    private async checkForIntervention() {
        // Se o pop-up já apareceu, não pergunta mais ao servidor
        if (this.interventionTriggered) return;

        console.log("[Sense.Ai] 📡 Consultando servidor por intervenções...");

        try {
            const response = await fetch('https://mtkrhkqinwlddeksauqb.supabase.co/functions/v1/get-intervention', {
                method: 'POST',
                body: JSON.stringify({ storeId: this.storeId }), 
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                console.error(`[Sense.Ai] ❌ Erro na consulta: ${response.status}`);
                return;
            }

            const data = await response.json();

            if (data.intervention) {
                console.log("%c🎯 [SENSE.AI] DIAGNÓSTICO POSITIVO! DISPARANDO POP-UP...", "color: #059669; font-weight: bold;");
                this.triggerPopup(data.intervention);
                this.interventionTriggered = true;
            } else {
                console.log("[Sense.Ai] 😴 Nenhum diagnóstico de urgência encontrado.");
            }
        } catch (e) { 
            console.error("[Sense.Ai] 🚨 Erro crítico ao checar intervenção:", e); 
        }
    }

    private triggerPopup(data: any) {
        const div = document.createElement('div');
        div.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; width: 320px; 
            background: white; border-radius: 16px; box-shadow: 0 15px 35px rgba(0,0,0,0.2); 
            z-index: 99999; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            overflow: hidden; animation: slideUp 0.4s ease-out;
            border: 1px solid #eee;
        `;
        
        // Adicionando animação simples via CSS injetado
        const style = document.createElement('style');
        style.innerHTML = `@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`;
        document.head.appendChild(style);

        div.innerHTML = `
            <div style="background: ${data.color}; color: white; padding: 16px; font-weight: bold; font-size: 16px; text-align: center;">
                ${data.title}
            </div>
            <div style="padding: 20px; color: #333; font-size: 15px; line-height: 1.6; text-align: center;">
                ${data.message}
            </div>
            <button id="close-sense" style="width: 100%; padding: 12px; border: none; background: #f1f5f9; cursor: pointer; font-weight: 600; color: #64748b; transition: 0.2s;">
                Fechar
            </button>
        `;
        
        document.body.appendChild(div);
        document.getElementById('close-sense')?.addEventListener('click', () => div.remove());
    }
}

// Exporta globalmente para o navegador
(window as any).SenseAi = SenseAi;
