"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// apps/sdk/index.ts
class SenseAi {
    constructor(storeId, apiKey) {
        this.sessionId = null;
        this.eventBuffer = [];
        this.interventionTriggered = false; // Garante que o pop-up não apareça repetidamente
        this.storeId = storeId;
        this.apiKey = apiKey;
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("%c[Sense.Ai] 🚀 Inicializando Sistema...", "color: #2563eb; font-weight: bold; font-size: 14px;");
            // 1. Sincronização de Sessão
            this.sessionId = yield this.ensureSession();
            console.log(`[Sense.Ai] 🆔 Sessão Ativa: ${this.sessionId}`);
            // 2. Monitoramento de Comportamento
            this.setupEventListeners();
            // 3. Loops de Background
            // Loop de Ingestão: Envia eventos ao servidor a cada 10 segundos
            setInterval(() => this.flush(), 10000);
            // Loop de Intervenção: Pergunta ao servidor se há um pop-up a cada 5 segundos
            setInterval(() => this.checkForIntervention(), 5000);
            console.log("[Sense.Ai] ✅ Monitoramento ativo. Aguardando comportamentos...");
        });
    }
    setupEventListeners() {
        // Detecção de Intenção de Saída (Exit Intent)
        document.addEventListener('mouseleave', () => {
            this.pushEvent('exit_intent');
        });
        // Detecção de Interação com Frete
        document.addEventListener('click', (e) => {
            var _a, _b;
            const target = e.target;
            if (((_a = target.innerText) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes('frete')) || ((_b = target.id) === null || _b === void 0 ? void 0 : _b.includes('shipping'))) {
                this.pushEvent('shipping_interaction', target.id);
            }
        });
    }
    ensureSession() {
        return __awaiter(this, void 0, void 0, function* () {
            // Para o MVP, usamos o ID da Loja como ID de Sessão para garantir 100% de sincronia no banco
            return this.storeId;
        });
    }
    pushEvent(type, element) {
        this.eventBuffer.push({
            type,
            element,
            timestamp: Date.now()
        });
        console.log(`%c[Sense.Ai] 📥 Evento capturado: ${type}`, "color: #666; font-style: italic;");
    }
    flush() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.eventBuffer.length === 0)
                return;
            const payload = {
                storeId: this.storeId,
                apiKey: this.apiKey,
                sessionId: this.sessionId,
                events: this.eventBuffer
            };
            this.eventBuffer = []; // Limpa o buffer imediatamente
            try {
                const response = yield fetch('https://mtkrhkqinwlddeksauqb.supabase.co/functions/v1/ingest-event', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                    headers: { 'Content-Type': 'application/json' }
                });
                if (response.ok) {
                    console.log("[Sense.Ai] ☁️ Eventos sincronizados com a nuvem.");
                }
                else {
                    console.error(`[Sense.Ai] ❌ Erro ao sincronizar: ${response.status}`);
                }
            }
            catch (e) {
                console.error("[Sense.Ai] 🚨 Falha de conexão com o servidor de ingestão:", e);
            }
        });
    }
    checkForIntervention() {
        return __awaiter(this, void 0, void 0, function* () {
            // Se o pop-up já apareceu, não pergunta mais ao servidor
            if (this.interventionTriggered)
                return;
            console.log("[Sense.Ai] 📡 Consultando servidor por intervenções...");
            try {
                const response = yield fetch('https://mtkrhkqinwlddeksauqb.supabase.co/functions/v1/get-intervention', {
                    method: 'POST',
                    body: JSON.stringify({ storeId: this.storeId }),
                    headers: { 'Content-Type': 'application/json' }
                });
                if (!response.ok) {
                    console.error(`[Sense.Ai] ❌ Erro na consulta: ${response.status}`);
                    return;
                }
                const data = yield response.json();
                if (data.intervention) {
                    console.log("%c🎯 [SENSE.AI] DIAGNÓSTICO POSITIVO! DISPARANDO POP-UP...", "color: #059669; font-weight: bold;");
                    this.triggerPopup(data.intervention);
                    this.interventionTriggered = true;
                }
                else {
                    console.log("[Sense.Ai] 😴 Nenhum diagnóstico de urgência encontrado.");
                }
            }
            catch (e) {
                console.error("[Sense.Ai] 🚨 Erro crítico ao checar intervenção:", e);
            }
        });
    }
    triggerPopup(data) {
        var _a;
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
        (_a = document.getElementById('close-sense')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => div.remove());
    }
}
// Exporta globalmente para o navegador
window.SenseAi = SenseAi;
