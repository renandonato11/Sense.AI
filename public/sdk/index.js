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
    
    Object.assign(popup.style, {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      width: '320px',
      padding: '24px',
      borderRadius: '20px',
      backgroundColor: config.color || '#2563eb',
      color: '#fff',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
      zIndex: '999999',
      fontFamily: 'sans-serif',
      animation: 'slideIn 0.5s ease-out'
    });

    popup.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:12px;">
        <h3 style="margin:0; font-size:18px; font-weight:bold; line-height:1.2;">${config.title}</h3>
        <button id="sense-ai-close" style="background:none; border:none; color:#fff; cursor:pointer; font-size:20px; line-height:1;">&times;</button>
      </div>
      <p style="margin:0 0 20px 0; font-size:14px; opacity:0.9; line-height:1.5;">${config.message}</p>
      <button id="sense-ai-btn" style="width:100%; padding:12px; border-radius:10px; border:none; background:#fff; color:${config.color || '#2563eb'}; font-weight:bold; cursor:pointer; transition:0.2s;">
        ${config.buttonText}
      </button>
    `;

    document.body.appendChild(popup);

    document.getElementById('sense-ai-close').onclick = () => popup.remove();

    // CORREÇÃO AQUI: Mudamos a chamada da função e removemos o toast_success problemático
    document.getElementById('sense-ai-btn').onclick = () => {
      localStorage.setItem('sense_ai_recovered_intent', intent);
      this.track('intervention_clicked', { intent: intent });
      popup.remove();
      console.log("✅ Sense.Ai: Clique registrado e salvo no localStorage!");
    };

    const style = document.createElement('style');
    style.innerHTML = `@keyframes slideIn { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`;
    document.head.appendChild(style);
  }

  trackConversion() {
    const path = window.location.pathname.toLowerCase();
    const successPages = ['/thank-you', '/obrigado', '/sucesso', '/checkout/success'];
    if (successPages.some(page => path.includes(page))) {
      const recoveredIntent = localStorage.getItem('sense_ai_recovered_intent');
      if (recoveredIntent) {
        this.track('purchase_completed', {
          intent: recoveredIntent,
          value: this.extractOrderValue()
        });
        localStorage.removeItem('sense_ai_recovered_intent');
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
