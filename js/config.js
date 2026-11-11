/* Apprentice Pathways Explorer — site settings
   ---------------------------------------------------------------
   AI TRAINER: switched ON. It runs as a Vercel function in api/ask.js,
   which answers from OUR trade data first (js/data.js).
   The OpenAI key lives ONLY in Vercel > Settings > Environment Variables
   as OPENAI_API_KEY. NEVER paste a key into this file or any website
   file: anyone can read website files and steal the key.
   To switch the trainer off, set enabled: false.
   --------------------------------------------------------------- */
window.APE_CONFIG = {
  ai: {
    enabled: true,
    endpoint: '/api/ask',
    comingSoonText: 'Feature coming soon. Our AI trainer is being set up. For now, try the Pathway Finder or browse the trades.'
  }
};
