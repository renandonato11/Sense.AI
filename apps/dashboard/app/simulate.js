const axios = require('axios');

const CONFIG = {
  apiKey: 'sa_live_1JR0XPWu1YWaskCIDpDSXfuH', // Sua chave
  url: 'https://mtkrhkqinwlddeksauqb.supabase.co/functions/v1/ingest-event'
};

const intents = ['shipping', 'price', 'distraction', 'confidence'];

async function simulate() {
  console.log("🚀 Injetando dados falsos para validar o Dashboard...");
  
  for(let i=0; i<50; i++) {
    const randomIntent = intents[Math.floor(Math.random() * intents.length)];
    await axios.post(CONFIG.url, {
      apiKey: CONFIG.apiKey,
      event_type: randomIntent === 'shipping' ? 'shipping_interaction' : 'exit_intent',
      session_id: `sess_${Math.random().toString(36).substr(2, 9)}`,
      payload: { simulated: true }
    });
    console.log(`Injetado evento de ${randomIntent}`);
  }
  console.log("✅ 50 eventos injetados! Recarregue seu Dashboard.");
}

simulate();
