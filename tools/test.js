#!/usr/bin/env node
/* Apprentice Pathways Explorer — checks the AI Trainer, the languages and the SEO pages.
   Run:  npm test   (no API key needed: we pretend to be OpenAI, so no money is spent) */
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ROOT = path.join(__dirname, '..');
const D = require('../js/data.js');
let passed = 0;
const ok = (name, fn) => Promise.resolve().then(fn).then(() => { passed++; console.log('  ✓', name); });

function call(handler, { method = 'POST', body = {}, origin = 'https://apprentice-pathway-explorer.vercel.app', ip = '1.1.1.1' } = {}) {
  return new Promise((resolve) => {
    const res = { headers: {}, code: 200, setHeader(k, v) { this.headers[k] = v; },
      status(c) { this.code = c; return this; }, json(d) { resolve({ code: this.code, data: d }); }, end() { resolve({ code: this.code }); } };
    handler({ method, body, headers: { origin, host: 'apprentice-pathway-explorer.vercel.app', 'x-forwarded-for': ip } }, res);
  });
}

let aiCalls = 0, lastSystem = '';
global.fetch = async (url, opts) => {
  if (!String(url).includes('openai.com')) throw new Error('unexpected fetch ' + url);
  aiCalls++;
  const b = JSON.parse(opts.body);
  lastSystem = b.messages[0].content;
  const reply = /translate/i.test(lastSystem)
    ? Object.fromEntries(Object.keys(JSON.parse(b.messages[1].content)).map((k) => [k, 'T:' + k]))
    : { answer: 'Watch a welder for a week, then buy a mask and gloves.', trades: ['welding', 'made-up-trade'], followups: ['What tools first?'] };
  return { ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify(reply) } }] }) };
};

(async () => {
  console.log('AI Trainer (api/ask.js)');
  delete process.env.OPENAI_API_KEY;
  const ask = require('../api/ask');
  const translate = require('../api/translate');
  await ok('without a key the trainer is switched off (503)', async () => assert.strictEqual((await call(ask, { body: { question: 'How do I learn welding?' } })).code, 503));
  process.env.OPENAI_API_KEY = 'test-key';
  await ok('finds the right trades for a question', () => {
    assert.strictEqual(ask.findTrades('How long does it take to learn welding?', '')[0].id, 'welding');
    assert.strictEqual(ask.findTrades('I want to fix phones', '')[0].id, 'phone-repair');
    assert.ok(ask.findTrades('I want to become a mechanic', '').some((t) => t.id === 'auto-mechanic'));
    assert.deepStrictEqual(ask.findTrades('How do I find a good master?', ''), [], '"master" must not match "mast"');
  });
  await ok('"what can I learn in 3 months" returns short courses', () => {
    ask.findTrades('which trade can I learn in 3 months', '').forEach((t) => assert.ok(t.months[0] <= 3, t.id));
  });
  await ok('the trade page you are reading is always included', () => assert.ok(ask.findTrades('how do I start', 'tailoring').some((t) => t.id === 'tailoring')));
  await ok('a strange website is blocked (403)', async () => assert.strictEqual((await call(ask, { origin: 'https://evil.example', body: { question: 'hi there' } })).code, 403));
  await ok('answers from OUR facts, in the chosen language, and only links real trades', async () => {
    const r = await call(ask, { body: { question: 'How long does it take to learn welding?', lang: 'ha', context: { trade: 'welding', state: 'Ogun' } } });
    assert.strictEqual(r.code, 200);
    assert.deepStrictEqual(r.data.trades, ['welding'], 'made-up trade ids are removed');
    assert.ok(lastSystem.includes('Buy a welding mask'), 'our first step is in the prompt');
    assert.ok(lastSystem.includes('Answer in Hausa'));
    assert.ok(lastSystem.includes('Ogun State'));
  });
  await ok('same question again comes from the cache', async () => {
    const before = aiCalls;
    const r = await call(ask, { body: { question: 'How long does it take to learn welding?', lang: 'ha', context: { trade: 'welding', state: 'Ogun' } } });
    assert.ok(r.data.cached); assert.strictEqual(aiCalls, before);
  });
  await ok('fair-use limit: 40 questions per hour', async () => {
    let last;
    for (let i = 0; i < 41; i++) last = await call(ask, { ip: '9.9.9.9', body: { question: 'question number ' + i } });
    assert.strictEqual(last.code, 429);
  });
  await ok('translate: built-in languages are refused, Tiv is translated', async () => {
    assert.strictEqual((await call(translate, { body: { lang: 'yo', strings: { 'nav.home': 'Home' } } })).code, 400);
    const r = await call(translate, { body: { lang: 'tiv', strings: { 'nav.home': 'Home' } } });
    assert.strictEqual(r.data.strings['nav.home'], 'T:nav.home');
  });

  console.log('Languages (js/i18n.js)');
  require('../js/i18n.js');
  const I = globalThis.I18N;
  await ok('17 languages, 5 built in', () => { assert.strictEqual(I.LANGS.length, 17); assert.strictEqual(I.LANGS.filter((l) => l.how === 'hand').length, 5); });
  await ok('Hausa, Yoruba, Igbo and Pidgin have every visible word', () => {
    const keys = Object.keys(I.STRINGS.en).filter((k) => k !== 'ui.aiBeta');
    ['ha', 'yo', 'ig', 'pcm'].forEach((l) => keys.forEach((k) => assert.ok(k in I.STRINGS[l], l + ' missing ' + k)));
  });
  await ok('every data-i18n key used on the pages exists in English', () => {
    const used = new Set();
    ['index.html', 'trade/welding.html', 'category/digital.html', 'js/app.js'].forEach((f) => {
      const h = fs.readFileSync(path.join(ROOT, f), 'utf8');
      [...h.matchAll(/data-i18n(?:-html|-placeholder|-label)?="([\w.]+)"/g)].forEach((m) => used.add(m[1]));
    });
    used.forEach((k) => assert.ok(I.STRINGS.en[k], 'missing ' + k));
  });

  console.log('SEO / AEO / GEO');
  const pages = ['index.html', 'trades.html', 'careers.html', 'skills.html', 'planner.html', 'opportunities.html', 'category/index.html']
    .concat(Object.keys(D.CATEGORIES).map((c) => `category/${c}.html`), D.TRADES.map((t) => `trade/${t.id}.html`));
  await ok(`${pages.length} pages: title, description, canonical, one h1, valid JSON-LD`, () => {
    pages.forEach((f) => {
      const h = fs.readFileSync(path.join(ROOT, f), 'utf8');
      const title = ((h.match(/<title>([^<]*)<\/title>/) || [])[1] || '').replace(/&amp;/g, '&');
      assert.ok(title.length >= 10 && title.length <= 95, f + ' title ' + title.length);
      const desc = ((h.match(/<meta name="description" content="([^"]*)">/) || [])[1] || '').replace(/&amp;|&#39;|&quot;/g, 'x');
      assert.ok(desc.length >= 50 && desc.length <= 175, f + ' description ' + desc.length);
      assert.ok(/<link rel="canonical" href="https:\/\/apprentice-pathway-explorer\.vercel\.app\//.test(h), f + ' canonical');
      assert.strictEqual((h.match(/<h1[\s>]/g) || []).length, 1, f + ' one h1');
      [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].forEach((m) => JSON.parse(m[1]));
    });
  });
  await ok('every trade and category page has a Quick answer and FAQ labels (AEO)', () => {
    pages.filter((f) => /^(trade|category)\/(?!index)/.test(f)).forEach((f) => {
      const h = fs.readFileSync(path.join(ROOT, f), 'utf8');
      assert.ok(h.includes('class="answer-box"'), f); assert.ok(h.includes('"FAQPage"'), f);
    });
  });
  await ok('sitemap, robots.txt and llms.txt are ready (GEO)', () => {
    const sm = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
    assert.ok(!sm.includes('example.com'));
    pages.forEach((f) => assert.ok(sm.includes('/' + (f === 'index.html' ? '' : f) + '<'), 'sitemap missing ' + f));
    const rb = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8');
    assert.ok(rb.includes('GPTBot') && rb.includes('Disallow: /api/'));
    assert.ok(fs.readFileSync(path.join(ROOT, 'llms.txt'), 'utf8').includes(`${D.TRADES.length} trades`));
  });
  await ok('no API key in any website file', () => {
    ['js/app.js', 'js/config.js', 'js/i18n.js', 'index.html'].forEach((f) => assert.ok(!/sk-[A-Za-z0-9_-]{20,}/.test(fs.readFileSync(path.join(ROOT, f), 'utf8')), f));
  });

  console.log(`\nAll ${passed} checks passed.`);
})().catch((e) => { console.error('\n  ✗ FAILED:', e.message); process.exit(1); });
