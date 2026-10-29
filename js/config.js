/* Apprentice Pathways Explorer — site settings
   ---------------------------------------------------------------
   ASK A TRAINER (AI)
   The "Ask a trainer" box is ready for an OpenAI-powered answer service,
   but it is switched OFF for now, so visitors see "Feature coming soon".

   To switch it on later:
   1. Deploy the small server in /server/ask-openai.js (see README.md).
      Your OpenAI API key goes on that server as an environment variable.
      NEVER paste the API key into this file or any other website file:
      anyone can read website files and steal the key.
   2. Set enabled to true and put your server's address in endpoint,
      for example 'https://your-server.example.com/api/ask'.
   --------------------------------------------------------------- */
window.APE_CONFIG = {
  ai: {
    enabled: false,
    endpoint: '/api/ask',
    comingSoonText: 'Feature coming soon. Our AI trainer is being set up. For now, try the Pathway Finder or browse the trades.'
  }
};
