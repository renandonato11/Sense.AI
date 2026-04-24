(function() {
  const scriptTag = document.currentScript;
  const API_KEY = scriptTag.getAttribute('data-api-key');
  const SUPABASE_URL = 'https://mtkrhkqinwlddeksauqb.supabase.co'; 
  
  if (!API_KEY) return;

  let storeConfig = null;

  async function fetchConfig() {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/get-sdk-config?apiKey=${API_KEY}`);
      const data = await response.json();
      storeConfig = data.config;
    } catch (e) { console.error("Sense.Ai: Erro de config"); }
  }

  function showPopup() {
    if (!storeConfig || document.getElementById('sense-ai-popup')) return;

    const popup = document.createElement('div');
    popup.id = 'sense-ai-popup';
    
    Object.assign(popup.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '320px',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
      backgroundColor: storeConfig.primary_color,
      color: '#fff',
      fontFamily: 'sans-serif',
      zIndex: '99999', // Garantir que fica acima de tudo
      animation: 'slideUp 0.4s ease-out'
    });

    popup.innerHTML = `
      <div style="font-weight: bold; font-size: 18px; margin-bottom: 8px;">${storeConfig.popup_title}</div>
      <div style="font-size: 14px; opacity: 0.9; margin-bottom: 16px;">${storeConfig.popup_text}</div>
      <button id="sense-ai-btn" style="width: 100%; padding: 10px; border-radius: 8px; border: none; background: #fff; color: ${storeConfig.primary_color}; font-weight: bold; cursor: pointer;">
        ${storeConfig.button_text}
      </button>
      <button id="sense-ai-close" style="position: absolute; top: 10px; right: 10px; background: none; border: none; color: #fff; cursor: pointer; font-size: 12px;">✕</button>
    `;

    document.body.appendChild(popup);
    document.getElementById('sense-ai-close').onclick = () => popup.remove();
  }

  function initListeners() {
    // GATILHO 1: Exit Intent (Mouse saindo por cima)
    document.addEventListener('mouseout', (e) => {
      if (e.clientY < 0) {
        showPopup();
      }
    });

    // GATILHO 2: Interação com Frete (Inteligência de E-commerce)
    document.addEventListener('click', (e) => {
      const text = e.target.innerText?.toLowerCase() || "";
      if (text.includes('frete') || text.includes('calcular')) {
        console.log("Sense.Ai: Interação de frete detectada!");
        setTimeout(showPopup, 1000); // Aparece 1 segundo depois do clique no frete
      }
    });
  }

  fetchConfig().then(() => initListeners());

  const style = document.createElement('style');
  style.innerHTML = `@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`;
  document.head.appendChild(style);
})();
