/* Apprentice Pathways Explorer — "Ask a trainer" answer service (FOR LATER)
   ---------------------------------------------------------------
   A tiny Node.js server (Node 18 or newer, no packages to install) that
   receives a question from the website and asks OpenAI for an answer.

   Your OpenAI API key stays here on the server, in an environment variable.
   It is never sent to visitors' browsers.

   Run it:
     OPENAI_API_KEY=sk-...  ALLOWED_ORIGIN=https://yourdomain.com  node server/ask-openai.js

   Optional settings:
     OPENAI_MODEL   the model to use (check the OpenAI dashboard for current model names)
     PORT           default 8787

   Then in js/config.js set  enabled: true  and  endpoint: 'https://your-server-address/api/ask'
   --------------------------------------------------------------- */
'use strict';
const http = require('http');

const KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const PORT = Number(process.env.PORT || 8787);
if (!KEY) { console.error('Set OPENAI_API_KEY before starting the server.'); process.exit(1); }

const SYSTEM = 'You are a friendly, practical vocational trainer in Nigeria with over 30 years of experience across skilled trades and apprenticeships. ' +
  'Answer in clear, simple English that a secondary-school leaver can follow. Give concrete next steps. ' +
  'Mention Nigerian routes where useful (master apprenticeship, trade test Grade III to I, NABTEB, NSQ, ITF, NDE, state skills centres), ' +
  'but tell people to confirm current programme details on official .gov.ng websites. Never ask for personal information. Keep answers under 200 words.';

// Simple limit: 20 questions per visitor address per hour
const hits = new Map();
function allowed(ip) {
  const now = Date.now(), list = (hits.get(ip) || []).filter((t) => now - t < 3600000);
  list.push(now); hits.set(ip, list);
  return list.length <= 20;
}

function send(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ORIGIN, 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' });
  res.end(JSON.stringify(obj));
}

http.createServer((req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (req.method !== 'POST' || req.url !== '/api/ask') return send(res, 404, { error: 'Not found' });
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  if (!allowed(ip)) return send(res, 429, { error: 'Too many questions. Please try again in an hour.' });

  let body = '';
  req.on('data', (c) => { body += c; if (body.length > 8000) req.destroy(); });
  req.on('end', async () => {
    let data;
    try { data = JSON.parse(body); } catch (e) { return send(res, 400, { error: 'Invalid request' }); }
    const question = String(data.question || '').trim().slice(0, 600);
    if (!question) return send(res, 400, { error: 'Question is empty' });
    const ctx = data.context || {};
    const extra = [ctx.trade ? 'The visitor is reading about: ' + ctx.trade + '.' : '', ctx.state ? 'They live in ' + ctx.state + ' State.' : ''].filter(Boolean).join(' ');
    try {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + KEY },
        body: JSON.stringify({ model: MODEL, messages: [{ role: 'system', content: SYSTEM + (extra ? ' ' + extra : '') }, { role: 'user', content: question }] })
      });
      if (!r.ok) { console.error('OpenAI error', r.status, await r.text()); return send(res, 502, { error: 'The answer service is busy. Please try again.' }); }
      const out = await r.json();
      const answer = out.choices && out.choices[0] && out.choices[0].message ? out.choices[0].message.content : '';
      send(res, 200, { answer: answer || 'Sorry, I could not answer that. Please try asking another way.' });
    } catch (e) {
      console.error(e);
      send(res, 502, { error: 'The answer service could not be reached.' });
    }
  });
}).listen(PORT, () => console.log('Ask-a-trainer service listening on port ' + PORT));
