/* =====================================================================
   POST /api/passport   - signs and checks Skill Passport share links
   ---------------------------------------------------------------------
   A Skill Passport lives on the apprentice's own phone. When they share
   it, the link carries the passport inside it. This API adds a SIGNATURE
   (HMAC-SHA256 with a secret only the server knows), so if anyone edits
   the link, for example adding a skill the master never confirmed, the
   signature no longer matches and the page says "changed after signing".

     { "action": "sign",   "passport": {...} }               -> { "sig": "..." }
     { "action": "verify", "passport": {...}, "sig": "..." } -> { "valid": true|false }

   Needs PASSPORT_SECRET in Vercel > Settings > Environment Variables
   (any long random password). No AI, no database, no cost.
   What a signature proves: the passport has not been changed since it
   was shared. It is NOT a government certificate: that is the trade test.
   ===================================================================== */
'use strict';
const crypto = require('crypto');
const S = require('./_lib/shared');
const D = require('../js/data.js');

const clip = (v, n) => String(v == null ? '' : v).slice(0, n);

// Keep only the fields we know, in a fixed order, so the same passport always signs the same way
function canonical(p) {
  const trade = D.TRADES.find(t => t.id === p.trade);
  if (!trade) return null;
  const max = trade.skills.length + trade.path.length;
  const items = (Array.isArray(p.items) ? p.items : [])
    .filter(x => x && Number.isInteger(x.i) && x.i >= 0 && x.i < max && /^\d{4}-\d{2}-\d{2}$/.test(String(x.d || '')))
    .map(x => ({ i: x.i, by: x.by === 'master' ? 'master' : 'self', d: String(x.d) }))
    .sort((a, b) => a.i - b.i)
    .filter((x, k, arr) => k === 0 || arr[k - 1].i !== x.i)
    .slice(0, 40);
  return JSON.stringify({ v: 1, trade: trade.id, name: clip(p.name, 40), master: clip(p.master, 60), place: clip(p.place, 60), since: clip(p.since, 10), items });
}

function sign(text) {
  return crypto.createHmac('sha256', process.env.PASSPORT_SECRET).update(text).digest('base64url').slice(0, 22);
}

module.exports = async function handler(req, res) {
  if (!S.allowOrigin(req, res)) return res.status(403).json({ error: 'This website is not allowed to use this service.' });
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Send a POST request.' });
  if (!process.env.PASSPORT_SECRET) return res.status(503).json({ error: 'Passport signing is not switched on yet.', off: true });
  if (!S.allowed(S.visitor(req), 120)) return res.status(429).json({ error: 'Too many requests. Please try again later.' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};
  const text = body.passport && typeof body.passport === 'object' ? canonical(body.passport) : null;
  if (!text) return res.status(400).json({ error: 'This passport is not complete.' });

  if (body.action === 'sign') return res.status(200).json({ sig: sign(text) });
  if (body.action === 'verify') {
    const given = String(body.sig || '');
    const expected = sign(text);
    const valid = given.length === expected.length && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected));
    return res.status(200).json({ valid });
  }
  return res.status(400).json({ error: 'Unknown action.' });
};

module.exports.canonical = canonical;
