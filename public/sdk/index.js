class SenseAi {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = 'https://sense-ai-xb5a.vercel.app/api/collect';
    this.init();
  }

  init() {
    console.log("🚀 Sense.Ai Elite SDK Loaded & Active");
    this.trackConversion();
    this.setupBehavioralTracking();
  }

  async track(eventType, payload = {}) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: this.apiKey,
          event_type: eventType,
          payload: payload
        })
      });
      const data = await response.json();
      if (data.intervention) {
        this.renderPopup(data.intervention, eventType);
      }
    } catch (e) {
      console.error("Sense.Ai Error:", e);
    }
  }

    renderPopup(config, intent) {
    const existing = document.getElementById('sense-ai-popup');
    if (existing) existing.remove();

    const popup = document.createElement('div');
    popup.id = 'sense-ai-popup';
    
    // ESTILO PREMIUM: Design flutuante, sombras suaves e bordas arredondadas
    Object.assign(popup.style, {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      width: '350px',
      padding: '0',
      borderRadius: '24px',
      backgroundColor: '#fff', // Fundo branco para contraste
      color: '#1a1a1a',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      zIndex: '999999',
      fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden',
      animation: 'senseAiSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      border: `1px solid ${config.color || '#e2e8f0'}`
    });

    // Estrutura interna com "Header" colorido
    popup.innerHTML = `
      <div style="background-color: ${config.color || '#2563eb'}; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; color: #fff;">
        <h3 style="margin:0; font-size:16px; font-weight:bold; letter-spacing: -0.5px;">${config.title}</h3>
        <button id="sense-ai-close" style="background:none; border:none; color:rgba(255,255,255,0.7); cursor:pointer; font-size:20px; line-height:1;">&times;</button>
      </div>
      <div style="padding: 24px; text-align: center;">
        <p style="margin:0 0 24px 0; font-size:15px; color: #4a5568; line-height:1.6;">${config.message}</p>
        <button id="sense-ai-btn" style="width:100%; padding:14px; border-radius:12px; border:none; background:${config.color || '#2563eb'}; color:#fff; font-weight:bold; cursor:pointer; transition:all 0.2s; font-size:15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          ${config.buttonText}
        </button>
      </div>
    `;

    document.body.appendChild(popup);

    // Efeito de Hover no botão
    const btn = document.getElementById('sense-ai-btn');
    btn.onmouseover = () => btn.style.transform = 'scale(1.02)';
    btn.onmouseout = () => btn.style.transform = 'scale(1)';

    document.getElementById('sense-ai-close').onclick = () => popup.remove();

    document.getElementById('sense-ai-btn').onclick = () => {
      localStorage.setItem('sense_ai_recovered_intent', intent);
      this.track('intervention_clicked', { intent: intent });
      popup.remove();
    };

    // Animação de entrada suave e profissional
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes senseAiSlideIn { 
        from { transform: translateY(100px) scale(0.9); opacity: 0; } 
        to { transform: translateY(0) scale(1); opacity: 1; } 
      }
    `;
    document.head.appendChild(style);
  }

  trackConversion() {
    // CORREÇÃO AQUI: Agora buscamos a palavra em qualquer parte da URL (Local ou Online)
    const currentUrl = window.location.href.toLowerCase();
    const successKeywords = ['thank-you', 'obrigado', 'sucesso', 'checkout/success'];
    
    const isSuccessPage = successKeywords.some(keyword => currentUrl.includes(keyword));

    if (isSuccessPage) {
      const recoveredIntent = localStorage.getItem('sense_ai_recovered_intent');
      if (recoveredIntent) {
        console.log("💰 Venda recuperada detectada! Enviando para API...");
        this.track('purchase_completed', {
          intent: recoveredIntent,
          value: this.extractOrderValue()
        });
        localStorage.removeItem('sense_ai_recovered_intent');
      } else {
        console.log("Página de sucesso detectada, mas nenhum carimbo de recuperação encontrado.");
      }
    }
  }

  extractOrderValue() {
    const bodyText = document.body.innerText;
    const match = bodyText.match(/R\$\s?(\d+,\d{2})/);
    return match ? parseFloat(match[1].replace(',', '.')) : 0;
  }

  setupBehavioralTracking() {
    document.addEventListener('click', (e) => {
      if (e.target.id === 'calculate-shipping' || e.target.innerText.includes('Frete')) {
        this.track('shipping', { timestamp: new Date().toISOString() });
      }
    });
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY < 0) {
        this.track('distraction', { timestamp: new Date().toISOString() });
      }
    });
  }
}

window.SenseAi = SenseAi;
