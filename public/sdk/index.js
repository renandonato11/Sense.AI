class SenseAi {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = 'https://sense-ai-xb5a.vercel.app/api/collect';
    this.init();
  }

  init() {
    console.log("🚀 Sense.Ai Elite SDK Loaded");
    this.trackConversion();
    this.setupBehavioralTracking();
  }

  // Envia eventos para a API
  async track(eventType, payload = {}) {
    try {
      await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: this.apiKey,
          event_type: eventType,
          payload: payload
        })
      });
    } catch (e) {
      console.error("Sense.Ai Error:", e);
    }
  }

  // Lógica de Atribuição de Vendas
  trackConversion() {
    // 1. Verifica se a URL atual é uma página de sucesso/obrigado
    const path = window.location.pathname.toLowerCase();
    const successPages = ['/thank-you', '/obrigado', '/sucesso', '/checkout/success'];
    
    const isSuccessPage = successPages.some(page => path.includes(page));

    if (isSuccessPage) {
      // 2. Verifica se existe um "carimbo" de recuperação no localStorage
      const recoveredIntent = localStorage.getItem('sense_ai_recovered_intent');
      
      if (recoveredIntent) {
        console.log("💰 Venda recuperada detectada!");
        
        // 3. Dispara o evento de compra para a API
        this.track('purchase_completed', {
          intent: recoveredIntent,
          value: this.extractOrderValue() // Tenta pegar o valor da página
        });
        
        // Limpa o carimbo para não contar a mesma venda duas vezes
        localStorage.removeItem('sense_ai_recovered_intent');
      }
    }
  }

  // Tenta capturar o valor da venda na página (simplificado)
  extractOrderValue() {
    const bodyText = document.body.innerText;
    const match = bodyText.match(/R\$\s?(\d+,\d{2})/);
    return match ? parseFloat(match[1].replace(',', '.')) : 0;
  }

  setupBehavioralTracking() {
    // Exemplo: Monitora cliques em botões de frete
    document.addEventListener('click', (e) => {
      if (e.target.id === 'calculate-shipping' || e.target.innerText.includes('Frete')) {
        this.track('shipping', { timestamp: new Date().toISOString() });
      }
    });

    // Monitora saída do mouse da aba (Exit Intent)
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY < 0) {
        this.track('distraction', { timestamp: new Date().toISOString() });
      }
    });
  }

  // Método para o pop-up salvar que o usuário clicou
  recordClick(intent) {
    localStorage.setItem('sense_ai_recovered_intent', intent);
    this.track('intervention_clicked', { intent: intent });
  }
}

// Exporta para o window para ser usado no HTML
window.SenseAi = SenseAi;
