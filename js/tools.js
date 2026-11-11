/* Apprentice Pathways Explorer — Apprentice Tools
   ---------------------------------------------------------------
   PART A  Apprenticeship Agreement Builder  (agreement.html)
   PART B  Skill Passport                    (passport.html)
   PART C  Artisan Profile Card              (card.html)
   PART D  "My apprentice tools" on the dashboard
   Everything is saved on the user's own phone (localStorage, "ape2:" keys,
   the same as the rest of the site, so backup codes include it).
   Needs js/data.js (TRADES, CATEGORIES, durationLabel) and js/vendor/qrcode.js. */
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var store = {
    get: function (k, f) { try { var r = localStorage.getItem('ape2:' + k); return r ? JSON.parse(r) : f; } catch (e) { return f; } },
    set: function (k, v) { try { localStorage.setItem('ape2:' + k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  var TR = window.TRADES || [];
  var tradeById = function (id) { return TR.filter(function (t) { return t.id === id; })[0]; };
  var today = function () { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };   // local date, not London time
  var niceDate = function (iso) { if (!iso) return '________'; var d = new Date(iso + (iso.length === 7 ? '-01' : '') + 'T12:00:00'); return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); };
  var listText = function (a) { return a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; };
  var naira = function (n) { return '₦' + Number(n || 0).toLocaleString('en-NG'); };
  var lang = function () { return window.I18N ? I18N.lang : 'en'; };
  function toast(msg, el) { var t = el || $('#ag-trmsg') || $('#cd-msg'); if (t) { t.textContent = msg; clearTimeout(toast.t); toast.t = setTimeout(function () { t.textContent = ''; }, 4000); } }

  // Text <-> URL-safe code (for share links). Unicode-safe.
  function enc(obj) { return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function dec(str) { try { var b = str.replace(/-/g, '+').replace(/_/g, '/'); while (b.length % 4) b += '='; return JSON.parse(decodeURIComponent(escape(atob(b)))); } catch (e) { return null; } }
  function hashParam(name) { var m = location.hash.match(new RegExp('[#&]' + name + '=([^&]+)')); return m ? m[1] : ''; }
  function qrSVG(text, cell) {
    if (typeof qrcode !== 'function') return '';
    var q = qrcode(0, 'M'); q.addData(text); q.make();
    return q.createSvgTag({ cellSize: cell || 4, margin: 4, scalable: true });
  }
  function copy(text, msgEl) {
    var done = function () { toast('Copied!', msgEl); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () { window.prompt('Copy this:', text); });
    else window.prompt('Copy this:', text);
  }
  async function sha(text) {
    try { var b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)); return Array.from(new Uint8Array(b)).map(function (x) { return x.toString(16).padStart(2, '0'); }).join(''); }
    catch (e) { var h = 0; for (var r = 0; r < 300; r++) for (var i = 0; i < text.length; i++) h = (Math.imul(h, 31) + text.charCodeAt(i) + r) >>> 0; return 's' + h.toString(16); }
  }

  /* =================================================================
     PART A: APPRENTICESHIP AGREEMENT BUILDER
     ================================================================= */
  var AG_FIELDS = ['apprentice', 'guardian', 'relation', 'master', 'business', 'address', 'state', 'trade', 'start', 'months', 'days', 'hours', 'test', 'leave', 'fee', 'pay', 'early', 'freedom', 'dispute'];
  var agTranslated = null;      // { lang, strings } once translated

  function agRead() {
    var v = {};
    AG_FIELDS.forEach(function (k) { var el = $('#ag-' + k); v[k] = el ? el.value.trim() : ''; });
    v.under18 = $('#ag-under18').checked; v.errands = $('#ag-errands').checked; v.safety = $('#ag-safety').checked;
    v.support = $$('input[name="ag-support"]:checked').map(function (x) { return x.value; });
    v.settle = $$('input[name="ag-settle"]:checked').map(function (x) { return x.value; });
    return v;
  }
  function agWrite(v) {
    AG_FIELDS.forEach(function (k) { var el = $('#ag-' + k); if (el && v[k] != null) el.value = v[k]; });
    $('#ag-under18').checked = !!v.under18; $('#ag-errands').checked = v.errands !== false; $('#ag-safety').checked = v.safety !== false;
    $$('input[name="ag-support"]').forEach(function (x) { x.checked = (v.support || []).indexOf(x.value) !== -1; });
    $$('input[name="ag-settle"]').forEach(function (x) { x.checked = (v.settle || ['letter']).indexOf(x.value) !== -1; });
  }

  // The fairness check: plain-language warnings about unfair or missing terms
  function agCheck(v) {
    var out = [], t = tradeById(v.trade), months = Number(v.months) || 0, hours = Number(v.hours) || 0;
    var add = function (level, text) { out.push({ level: level, text: text }); };
    if (!t) add('warn', 'Choose the trade, so we can compare the length with the usual time.');
    else if (months && months > t.months[1] * 1.5) add('bad', 'The training is ' + months + ' months, much longer than usual for ' + t.title.toLowerCase() + ' (' + window.durationLabel(t.months) + '). Ask why, or agree a shorter time with a skills check.');
    else if (months && months < t.months[0]) add('warn', months + ' months is shorter than usual (' + window.durationLabel(t.months) + '). Make sure the plan covers every skill.');
    else if (months) add('ok', 'The length is normal for this trade (' + window.durationLabel(t.months) + ').');
    if (!months) add('warn', 'Write down the length of training in months.');
    if (!v.guardian) add('bad', 'Add a parent, guardian or witness. Agreements made without a witness are the easiest to break.');
    if (v.under18) {
      if (hours > 8) add('bad', 'The apprentice is under 18: training should be 8 hours a day or less, and must not stop schooling.');
      if (!v.safety) add('bad', 'An apprentice under 18 must never work alone with dangerous machines.');
    }
    if (hours > 10) add('bad', hours + ' hours a day is too long. Most workshops train 8 hours or less.');
    if (Number(v.days) >= 7) add('bad', 'Training every day leaves no rest. Agree at least one free day a week.');
    if (Number(v.leave) < 7) add('warn', 'Fewer than 7 days of holiday a year is very little.');
    if (v.early === 'none') add('bad', 'Nothing is agreed if training ends early. Most fights start here: agree a refund or a letter of what was learnt.');
    if (v.freedom === 'unclear') add('bad', 'Agree now who pays for the freedom ceremony. Surprise costs at the end are a common problem.');
    if (v.freedom === 'apprentice') add('warn', 'The apprentice\'s family pays for the freedom ceremony. Write down the expected amount so there are no surprises.');
    if (v.test === 'none') add('warn', 'No certificate is planned. A trade test (Grade III) makes it easier to get jobs and contracts.');
    if (!v.errands) add('warn', 'Without the "no personal errands" rule, apprentices can spend training hours on chores.');
    if (Number(v.fee) > 0 && v.pay === 'none') add('warn', 'A fee is written but "no fee" is chosen for payment. Check the fee section.');
    if (!out.some(function (x) { return x.level !== 'ok'; })) add('ok', 'This agreement looks fair. Read it together, then sign with your witness.');
    return out;
  }

  // The agreement text. Personal details stay as {placeholders}, so translation never sees names.
  function agTemplate(v) {
    var t = tradeById(v.trade), months = Number(v.months) || 0;
    var end = '';
    if (v.start && months) { var d = new Date(v.start + 'T12:00:00'); d.setMonth(d.getMonth() + months); end = d.toISOString().slice(0, 10); }
    var S = {};
    S.title = 'Apprenticeship Agreement';
    S.intro = 'This agreement is made on {today} in {place} between {master} (the Master) of {business}, and {apprentice} (the Apprentice), with {guardian} ({relation}) as guardian and witness.';
    S.c1 = '1. Trade. The Master will teach the Apprentice ' + (t ? t.title.toLowerCase() + ', including ' + listText(t.skills.map(function (x) { return x.toLowerCase(); })) : 'the agreed trade') + '. The Master will explain every step and let the Apprentice practise on real work.';
    S.c2 = '2. Length. Training starts on {start} and lasts ' + (months || '___') + ' months' + (end ? ', ending about {end}' : '') + '.' + (t ? ' The usual time for this trade is ' + window.durationLabel(t.months) + '.' : '') + ' The Apprentice may gain freedom earlier if the Master agrees all skills are learnt.';
    S.c3 = '3. Days and hours. The Apprentice will train ' + (v.days || 6) + ' days a week, about ' + (v.hours || 8) + ' hours a day, with ' + (v.leave || 0) + ' days of holiday each year.';
    if (v.under18) S.c3b = 'The Apprentice is under 18. Training will not stop the Apprentice from going to school, will not be more than 8 hours a day, and the Apprentice will not do dangerous work without close supervision.';
    S.c4 = Number(v.fee) > 0 ? '4. Fee. The training fee is {fee}, paid ' + (v.pay === 'parts' ? 'in parts during training, with a receipt for each payment' : 'once, at the start, with a receipt') + '.' : '4. Fee. There is no training fee.';
    S.c5 = '5. If training ends early. ' + ({ part: 'The unused part of the fee will be refunded, and the Master will write down the skills already learnt.', letter: 'There is no refund, but the Master will write a letter listing the skills already learnt.', none: 'Nothing has been agreed. Both sides should agree this before signing.' })[v.early || 'part'];
    S.c6 = v.support.length ? '6. Support. The Master will provide: ' + listText(v.support.map(function (x) { return ({ feeding: 'feeding', transport: 'transport', accommodation: 'accommodation', allowance: 'a small allowance' })[x]; })) + '.' : '6. Support. No feeding, transport or accommodation support is included.';
    S.c7 = '7. Certificate. ' + ({ trade: 'Before freedom, the Master will help the Apprentice register for and sit a trade test (Grade III).', nabteb: 'The Master will help the Apprentice prepare for the NABTEB Modular Trade Certificate.', programme: 'The Apprentice may join a national programme (such as SUPA, TVET or 3MTT) for certification, and the Master will allow time for it.', none: 'No certificate is planned.' })[v.test || 'trade'];
    S.c8 = '8. Freedom. When training is complete, the Master will grant the Apprentice freedom. Ceremony costs: ' + ({ none: 'there are no ceremony costs', master: 'paid by the Master', shared: 'shared between the Master and the Apprentice\'s family', apprentice: 'paid by the Apprentice\'s family, amount written here: ________', unclear: 'not yet agreed' })[v.freedom || 'none'] + '. The Apprentice will receive: ' + (v.settle.length ? listText(v.settle.map(function (x) { return ({ letter: 'a letter of completion', tools: 'starter tools', capital: 'capital or stock to start a business', passport: 'a Skill Passport confirmed by the Master' })[x]; })) : 'nothing extra') + '.';
    S.c9 = '9. Rules. ' + (v.errands ? 'During training hours the Apprentice will not be sent on house chores or personal errands unrelated to the trade. ' : '') + (v.safety ? 'The Master will provide safety gear and will not leave the Apprentice alone with dangerous machines. ' : '') + 'Both sides will treat each other with respect. No beating or abuse.';
    S.c10 = '10. Disagreements. Any disagreement will first be settled by ' + ({ family: 'a family meeting with the guardian', association: 'the local trade association', community: 'a community or religious leader' })[v.dispute || 'family'] + '.';
    S.c11 = '11. Copies. Everyone signs below and keeps a copy of this agreement.';
    S.sigMaster = 'Master'; S.sigApprentice = 'Apprentice'; S.sigGuardian = 'Guardian / witness'; S.sign = 'Signature'; S.date = 'Date';
    S.note = 'Made with the free Apprenticeship Agreement Builder, Apprentice Pathways Explorer. This is a written record for people to sign before witnesses, not legal advice.';
    return { strings: S, end: end };
  }
  function agFill(text, v, end) {
    var map = { today: niceDate(today()), place: [v.address, v.state].filter(Boolean).join(', ') || '________', master: v.master || '________', business: v.business || 'their workshop',
      apprentice: v.apprentice || '________', guardian: v.guardian || '________', relation: v.relation || 'guardian', start: niceDate(v.start), end: niceDate(end), fee: naira(v.fee) };
    return String(text).replace(/\{(\w+)\}/g, function (m, k) { return map[k] != null ? map[k] : m; });
  }
  function agRender() {
    var v = agRead(), tpl = agTemplate(v);
    var S = agTranslated && agTranslated.base === JSON.stringify(tpl.strings) ? agTranslated.strings : tpl.strings;
    var f = function (k) { return S[k] ? esc(agFill(S[k], v, tpl.end)) : ''; };
    var checks = agCheck(v);
    var bad = checks.filter(function (c) { return c.level === 'bad'; }).length, warn = checks.filter(function (c) { return c.level === 'warn'; }).length;
    $('#ag-check').innerHTML = '<h2>Fairness check</h2><p class="fair-score ' + (bad ? 'bad' : warn ? 'warn' : 'ok') + '">' + (bad ? bad + ' thing' + (bad > 1 ? 's' : '') + ' to fix before signing' : warn ? 'Almost fair: ' + warn + ' thing' + (warn > 1 ? 's' : '') + ' to look at' : 'Looks fair') + '</p>' +
      '<ul class="fair-list">' + checks.map(function (c) { return '<li class="' + c.level + '">' + esc(c.text) + '</li>'; }).join('') + '</ul>';
    var sig = function (k) { return '<div class="sig"><span>' + f(k) + '</span><div class="line"></div><small>' + f('sign') + '</small><div class="line"></div><small>' + f('date') + '</small></div>'; };
    $('#ag-doc').innerHTML = '<h2>' + f('title') + '</h2><p>' + f('intro') + '</p>' +
      ['c1', 'c2', 'c3', 'c3b', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11'].map(function (k) { return S[k] ? '<p>' + f(k) + '</p>' : ''; }).join('') +
      '<div class="sigs">' + sig('sigMaster') + sig('sigApprentice') + sig('sigGuardian') + '</div><p class="doc-note">' + f('note') + '</p>';
  }
  function agText() { return $('#ag-doc').innerText.replace(/\n{3,}/g, '\n\n'); }

  function initAgreement() {
    if (!$('#ag-form')) return;
    var q = new URLSearchParams(location.search);
    var saved = store.get('agreements', []);
    if (saved.length) agWrite(saved[0]);
    else { $('#ag-start').value = today(); var p = store.get('profile', null); if (p && p.state) $('#ag-state').value = p.state; }
    if (q.get('trade') && tradeById(q.get('trade'))) { $('#ag-trade').value = q.get('trade'); if (!saved.length) $('#ag-months').value = tradeById(q.get('trade')).months[1]; }
    var hint = function () { var t = tradeById($('#ag-trade').value); $('#ag-trade-hint').textContent = t ? 'Usual length: ' + window.durationLabel(t.months) : ''; };
    $('#ag-trade').addEventListener('change', function () { var t = tradeById(this.value); if (t && !$('#ag-months').value) $('#ag-months').value = t.months[1]; hint(); });
    $('#ag-form').addEventListener('input', agRender); $('#ag-form').addEventListener('change', agRender);
    $('#ag-save').addEventListener('click', function () {
      var v = agRead(); v.saved = today();
      var list = store.get('agreements', []).filter(function (x) { return x.trade !== v.trade || x.master !== v.master; });
      list.unshift(v); store.set('agreements', list.slice(0, 5)); toast('Draft saved on this phone', $('#ag-trmsg'));
    });
    $('#ag-print').addEventListener('click', function () { window.print(); });
    $('#ag-copy').addEventListener('click', function () { copy(agText(), $('#ag-trmsg')); });
    $('#ag-translate').addEventListener('click', async function () {
      var l = lang(), btn = this;
      if (l === 'en') { agTranslated = null; agRender(); toast('Pick your language at the top of the page first, then press Translate.', $('#ag-trmsg')); return; }
      var tpl = agTemplate(agRead()).strings;
      btn.disabled = true; toast(window.I18N ? I18N.t('ui.translating') : 'Translating…', $('#ag-trmsg'));
      try {
        var r = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lang: l, doc: true, strings: tpl }) });
        var d = await r.json();
        if (!r.ok || !d.strings) throw new Error(d.error || 'translate');
        agTranslated = { base: JSON.stringify(tpl), strings: d.strings }; agRender();
        toast('Translated with AI. Read it carefully with a speaker of the language before signing; keep the English copy too.', $('#ag-trmsg'));
      } catch (e) { toast('Translation is not available right now. The English version is shown.', $('#ag-trmsg')); }
      btn.disabled = false;
    });
    hint(); agRender();
  }

  /* =================================================================
     PART B: SKILL PASSPORT
     ================================================================= */
  var PP_KEY = 'passports';
  function ppItems(t) { return t.skills.map(function (s) { return { kind: 'Skill', text: s }; }).concat(t.path.map(function (s) { return { kind: 'Stage', text: s }; })); }
  function ppPayload(p) { return { v: 1, trade: p.trade, name: p.name || '', master: p.master || '', place: p.place || '', since: p.since || '', items: p.items.map(function (x) { return { i: x.i, by: x.by, d: x.d }; }) }; }
  function ppStats(p) { var t = tradeById(p.trade); var total = t ? ppItems(t).length : 0; var m = p.items.filter(function (x) { return x.by === 'master'; }).length; return { total: total, master: m, self: p.items.length - m }; }
  function ppSave(list) { store.set(PP_KEY, list); }
  var ppCurrent = null;
  // One click handler for the passport list (set up once)
  function ppBind(app) {
    if (app.dataset.bound) return; app.dataset.bound = '1';
    app.addEventListener('click', async function (e) {
      var b = e.target.closest('[data-self],[data-master],[data-undo]'); if (!b || !ppCurrent) return;
      var p = ppCurrent.p, list = ppCurrent.list;
      var i = Number(b.getAttribute('data-self') || b.getAttribute('data-master') || b.getAttribute('data-undo'));
      if (b.hasAttribute('data-undo')) { p.items = p.items.filter(function (x) { return x.i !== i; }); }
      else if (b.hasAttribute('data-self')) { p.items.push({ i: i, by: 'self', d: today() }); }
      else {
        var ok = await masterPIN(p); ppSave(list); if (!ok) return;
        p.items = p.items.filter(function (x) { return x.i !== i; }); p.items.push({ i: i, by: 'master', d: today() });
      }
      p.share = null; ppSave(list); ppView(app, p, list);
    });
  }
  function ring(pct) { return '<div class="pp-ring" style="--p:' + pct + '"><span>' + pct + '%</span></div>'; }

  function ppView(app, p, list) {
    var t = tradeById(p.trade), items = ppItems(t), st = ppStats(p), pct = st.total ? Math.round(st.master / st.total * 100) : 0;
    var byI = {}; p.items.forEach(function (x) { byI[x.i] = x; });
    app.innerHTML =
      '<div class="pp-head panel">' + ring(pct) +
        '<div><p class="eyebrow">Skill Passport</p><h2>' + esc(t.title) + '</h2><p class="note">' + esc([p.name, p.master && 'with ' + p.master, p.place].filter(Boolean).join(' · ')) + (p.since ? ' · since ' + esc(niceDate(p.since)) : '') + '</p>' +
        '<p><strong>' + st.master + '</strong> of ' + st.total + ' confirmed by master · <strong>' + st.self + '</strong> waiting for the master</p></div>' +
        '<div class="pp-head-actions">' + (list.length > 1 ? '<select class="select" id="pp-switch" aria-label="Switch passport">' + list.map(function (x, k) { var tt = tradeById(x.trade); return '<option value="' + k + '"' + (x === p ? ' selected' : '') + '>' + esc(tt ? tt.title : x.trade) + '</option>'; }).join('') + '</select>' : '') +
        '<button type="button" class="btn btn-ghost btn-sm" id="pp-new">+ New passport</button></div>' +
      '</div>' +
      '<ol class="pp-list">' + items.map(function (it, i) {
        var x = byI[i], state = x ? x.by : 'none';
        return '<li class="pp-item s-' + state + '"><div><small>' + it.kind + '</small><p>' + esc(it.text) + '</p>' +
          (x ? '<span class="pp-badge ' + state + '">' + (state === 'master' ? '✓ Confirmed by master, ' : 'I can do this, ') + esc(niceDate(x.d)) + '</span>' : '') + '</div>' +
          '<div class="pp-btns">' + (state === 'none' ? '<button type="button" class="btn btn-ghost btn-sm" data-self="' + i + '">I can do this</button>' : '') +
          (state !== 'master' ? '<button type="button" class="btn btn-dark btn-sm" data-master="' + i + '">Master confirms</button>' : '') +
          (state === 'self' ? '<button type="button" class="btn-text" data-undo="' + i + '">Undo</button>' : '') + '</div></li>';
      }).join('') + '</ol>' +
      '<div class="panel pp-share"><h2>Share your passport</h2><p class="note">Make a signed link and QR code for customers, a SUPA screener or an examiner. Only skills your master confirmed show as confirmed.</p>' +
        '<div class="row-actions"><button type="button" class="btn btn-primary" id="pp-make">Make share link</button><a class="btn btn-ghost" href="agreement.html?trade=' + p.trade + '">Agreement for this trade</a><a class="btn btn-ghost" href="card.html?trade=' + p.trade + '">Make my profile card</a></div>' +
        '<div id="pp-out" aria-live="polite"></div></div>' +
      '<p class="note">The master\'s PIN shows your master was present. A Skill Passport is a record of practice, not a government certificate: for that, sit the trade test.</p>';

    var switcher = $('#pp-switch'); if (switcher) switcher.addEventListener('change', function () { store.set('pp-current', Number(this.value)); initPassport(); });
    $('#pp-new').addEventListener('click', function () { store.set('pp-current', -1); initPassport(); });
    ppCurrent = { app: app, p: p, list: list };
    $('#pp-make').addEventListener('click', async function () {
      var payload = ppPayload(p), out = $('#pp-out'), sig = '';
      out.innerHTML = '<p class="note">Signing…</p>';
      try {
        var r = await fetch('/api/passport', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'sign', passport: payload }) });
        var d = await r.json(); if (r.ok && d.sig) sig = d.sig;
      } catch (e2) { /* offline: share unsigned */ }
      var url = location.origin + location.pathname + '#p=' + enc(payload) + (sig ? '&s=' + sig : '');
      p.share = url; ppSave(list);
      out.innerHTML = '<div class="pp-qr">' + qrSVG(url, 4) + '</div><p class="' + (sig ? 'ok-text' : 'warn-text') + '">' + (sig ? '✓ Signed: anyone can check it has not been changed.' : 'Not signed (no internet, or signing is not switched on yet). The link still works, but cannot prove it was not changed.') + '</p>' +
        '<div class="row-actions"><button type="button" class="btn btn-ghost btn-sm" id="pp-copy">Copy link</button><a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent('My Skill Passport (' + t.title + '): ' + url) + '">Share on WhatsApp</a></div>';
      $('#pp-copy').addEventListener('click', function () { copy(url, $('#pp-out p')); });
    });
  }

  // The master sets a PIN the first time, then types it to confirm each skill
  function masterPIN(p) {
    return new Promise(function (resolve) {
      var first = !p.pinHash;
      var box = document.createElement('div'); box.className = 'pp-modal'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
      box.innerHTML = '<form class="panel"><h2>' + (first ? 'Master: set your PIN' : 'Master: enter your PIN') + '</h2><p class="note">' + (first ? 'Choose a 4 to 6 digit PIN that only you, the master, know. You will type it to confirm each skill.' : 'Only the master should type this PIN, after watching the apprentice do the skill alone.') + '</p>' +
        '<div class="field"><label for="pin1">PIN</label><input id="pin1" type="password" inputmode="numeric" maxlength="6" autocomplete="off"></div>' +
        (first ? '<div class="field"><label for="pin2">Type the PIN again</label><input id="pin2" type="password" inputmode="numeric" maxlength="6" autocomplete="off"></div>' : '') +
        '<p class="err" role="alert"></p><div class="row-actions"><button type="submit" class="btn btn-dark">Confirm</button><button type="button" class="btn btn-ghost" data-cancel>Cancel</button></div></form>';
      document.body.appendChild(box); $('#pin1', box).focus();
      var close = function (v) { box.remove(); resolve(v); };
      $('[data-cancel]', box).addEventListener('click', function () { close(false); });
      box.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(false); });
      $('form', box).addEventListener('submit', async function (e) {
        e.preventDefault();
        var a = $('#pin1', box).value, err = $('.err', box);
        if (!/^\d{4,6}$/.test(a)) { err.textContent = 'Use 4 to 6 numbers.'; return; }
        if (first) {
          if (a !== $('#pin2', box).value) { err.textContent = 'The two PINs are different.'; return; }
          p.pinSalt = Math.random().toString(36).slice(2, 10); p.pinHash = await sha(p.pinSalt + ':' + a); close(true);
        } else {
          p.tries = (p.tries || 0);
          if (await sha(p.pinSalt + ':' + a) === p.pinHash) { p.tries = 0; close(true); }
          else { p.tries++; err.textContent = p.tries >= 5 ? 'Too many wrong PINs. Ask the master.' : 'Wrong PIN.'; if (p.tries >= 5) setTimeout(function () { close(false); }, 1200); }
        }
      });
    });
  }

  // Someone opened a shared passport link: show it read-only and check the signature
  async function ppPublic(app, payload, sig) {
    var t = tradeById(payload.trade);
    if (!t) { app.innerHTML = '<p class="panel">This passport link is not complete.</p>'; return; }
    var items = ppItems(t), byI = {}; (payload.items || []).forEach(function (x) { byI[x.i] = x; });
    var m = (payload.items || []).filter(function (x) { return x.by === 'master'; }).length, pct = Math.round(m / items.length * 100);
    app.innerHTML = '<div class="pp-verify" id="pp-verify"><span class="spin"></span> Checking signature…</div>' +
      '<div class="pp-head panel">' + ring(pct) + '<div><p class="eyebrow">Shared Skill Passport</p><h2>' + esc(t.title) + '</h2><p class="note">' + esc([payload.name, payload.master && 'trained with ' + payload.master, payload.place].filter(Boolean).join(' · ')) + '</p><p><strong>' + m + '</strong> of ' + items.length + ' skills confirmed by the master</p></div></div>' +
      '<ol class="pp-list">' + items.map(function (it, i) { var x = byI[i]; return '<li class="pp-item s-' + (x ? x.by : 'none') + '"><div><small>' + it.kind + '</small><p>' + esc(it.text) + '</p>' + (x ? '<span class="pp-badge ' + x.by + '">' + (x.by === 'master' ? '✓ Confirmed by master, ' : 'Self-reported, ') + esc(niceDate(x.d)) + '</span>' : '') + '</div></li>'; }).join('') + '</ol>' +
      '<p class="row-actions"><a class="btn btn-primary" href="passport.html">Make your own Skill Passport</a><a class="btn btn-ghost" href="trade/' + t.id + '.html">About ' + esc(t.title) + '</a></p>';
    var v = $('#pp-verify');
    if (!sig) { v.className = 'pp-verify warn'; v.textContent = 'Not signed: this passport cannot prove it was not changed. Ask the apprentice for a signed link.'; return; }
    try {
      var r = await fetch('/api/passport', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'verify', passport: payload, sig: sig }) });
      var d = await r.json();
      if (!r.ok) throw new Error();
      v.className = 'pp-verify ' + (d.valid ? 'ok' : 'bad');
      v.textContent = d.valid ? '✓ Signed by Apprentice Pathways Explorer: not changed since it was shared.' : '✗ Changed after signing. Do not trust this passport.';
    } catch (e) { v.className = 'pp-verify warn'; v.textContent = 'Could not check the signature right now (no internet?). Try again later.'; }
  }

  function initPassport() {
    var app = $('#pp-app'); if (!app) return;
    var shared = hashParam('p');
    if (shared) { var payload = dec(shared); if (payload) return ppPublic(app, payload, hashParam('s')); }
    var list = store.get(PP_KEY, []), cur = store.get('pp-current', 0);
    var q = new URLSearchParams(location.search), want = q.get('trade');
    if (want) { var k = list.findIndex(function (x) { return x.trade === want; }); cur = k === -1 ? -1 : k; }
    ppBind(app);
    if (cur >= 0 && list[cur]) return ppView(app, list[cur], list);
    app.innerHTML = $('#pp-start-tpl').innerHTML;
    var prof = store.get('profile', null);
    if (want) $('#pp-trade').value = want;
    if (prof && prof.nick) $('#pp-name').value = prof.nick;
    $('#pp-start').addEventListener('submit', function (e) {
      e.preventDefault();
      var trade = $('#pp-trade').value;
      if (!tradeById(trade)) { $('#pp-err').textContent = 'Choose your trade.'; return; }
      var existing = list.findIndex(function (x) { return x.trade === trade; });
      if (existing === -1) { list.unshift({ trade: trade, name: $('#pp-name').value.trim(), master: $('#pp-master').value.trim(), place: $('#pp-place').value.trim(), since: $('#pp-since').value, items: [] }); existing = 0; }
      ppSave(list); store.set('pp-current', existing);
      if (want) history.replaceState(null, '', location.pathname);
      initPassport();
    });
  }

  /* =================================================================
     PART C: ARTISAN PROFILE CARD
     ================================================================= */
  var CD_FIELDS = ['business', 'name', 'trade', 'years', 'area', 'state', 'phone', 'tagline'];
  function cdRead() {
    var v = {}; CD_FIELDS.forEach(function (k) { v[k] = $('#cd-' + k).value.trim(); });
    v.skills = $$('#cd-skills [aria-pressed="true"]').map(function (b) { return b.textContent; });
    v.passport = $('#cd-passport').checked;
    return v;
  }
  function intlPhone(p) { var d = String(p || '').replace(/\D/g, ''); if (!d) return ''; if (d.indexOf('234') === 0) return d; if (d.charAt(0) === '0') return '234' + d.slice(1); return d; }
  function cdPassport(v) {
    var pp = store.get(PP_KEY, []).filter(function (x) { return x.trade === v.trade; })[0];
    if (!v.passport || !pp) return null;
    var st = ppStats(pp);
    return { m: st.master, t: st.total, u: pp.share || '' };
  }
  function cdPublicData(v) {
    return { b: v.business, n: v.name, t: v.trade, y: v.years, a: v.area, s: v.state, w: intlPhone(v.phone), g: v.tagline, k: v.skills.slice(0, 4), p: cdPassport(v) };
  }
  // full = includes the Skill Passport link (for "Copy my page link"); the QR code uses the short version so phones scan it easily
  function cdLink(v, full) { var d = cdPublicData(v); if (!full && d.p) d.p = { m: d.p.m, t: d.p.t, u: '' }; return location.origin + location.pathname + '#c=' + enc(d); }
  function prettyPhone(w) { var d = String(w || ''); return d.length === 13 && d.indexOf('234') === 0 ? '+234 ' + d.slice(3, 6) + ' ' + d.slice(6, 9) + ' ' + d.slice(9) : (d ? '+' + d : ''); }
  function cdCardHTML(c, linkUrl) {
    var t = tradeById(c.t);
    return '<div class="cd-card"><div class="cd-top"><span class="cd-trade">' + esc(t ? t.title : 'Your trade') + '</span>' + (c.p ? '<span class="cd-pp">✓ Skill Passport ' + c.p.m + '/' + c.p.t + '</span>' : '') + '</div>' +
      '<h2>' + esc(c.b || 'Your business name') + '</h2><p class="cd-name">' + esc(c.n || (c.y ? '' : 'Your name')) + (c.y ? (c.n ? ' · ' : '') + esc(c.y) + ' yrs experience' : '') + '</p>' +
      (c.g ? '<p class="cd-tag">“' + esc(c.g) + '”</p>' : '') +
      '<ul>' + (c.k && c.k.length ? c.k : (t ? t.skills.slice(0, 3) : ['Pick your skills'])).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' +
      '<div class="cd-bottom"><div><p>📍 ' + esc([c.a, c.s].filter(Boolean).join(', ') || 'Your area') + '</p>' + (c.w ? '<p>💬 WhatsApp ' + esc(prettyPhone(c.w)) + '</p>' : '') + '</div>' + (linkUrl ? '<div class="cd-qr">' + qrSVG(linkUrl, 3) + '</div>' : '') + '</div></div>';
  }

  // Draw the card as a 1080×1350 picture for WhatsApp status
  function cdDraw(c, linkUrl) {
    var W = 1080, H = 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var g = cv.getContext('2d'), t = tradeById(c.t);
    var grd = g.createLinearGradient(0, 0, W, H); grd.addColorStop(0, '#2c0f52'); grd.addColorStop(1, '#14052a'); g.fillStyle = grd; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(245,197,54,.18)'; g.beginPath(); g.arc(W - 80, 60, 300, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#f5c536'; g.fillRect(0, 0, W, 18);
    var font = function (w, s) { return w + ' ' + s + 'px "Public Sans", "Segoe UI", Arial, sans-serif'; };
    function wrap(text, x, y, maxW, lh, maxLines) { var words = String(text).split(' '), line = '', n = 0; for (var i = 0; i < words.length; i++) { var test = line ? line + ' ' + words[i] : words[i]; if (g.measureText(test).width > maxW && line) { g.fillText(line, x, y); y += lh; line = words[i]; if (++n >= maxLines - 1) { line = words.slice(i).join(' '); break; } } else line = test; } g.fillText(line, x, y); return y + lh; }
    g.fillStyle = '#f5c536'; g.font = font('800', 34); g.fillText((t ? t.title : '').toUpperCase(), 80, 120);
    if (c.p) { g.font = font('700', 30); var label = '✓ SKILL PASSPORT ' + c.p.m + '/' + c.p.t; var w = g.measureText(label).width + 40; g.fillStyle = '#f5c536'; g.fillRect(80, 150, w, 54); g.fillStyle = '#2a1d00'; g.fillText(label, 100, 188); }
    g.fillStyle = '#ffffff'; g.font = font('800', 92); var y = wrap(c.b || 'Your business', 80, 330, W - 160, 100, 2);
    g.fillStyle = '#d9c9f2'; g.font = font('600', 40); g.fillText([c.n, c.y ? c.y + ' yrs experience' : ''].filter(Boolean).join('  ·  '), 80, y + 10); y += 90;
    if (c.g) { g.fillStyle = '#f5c536'; g.font = font('italic 600', 42); y = wrap('“' + c.g + '”', 80, y, W - 160, 54, 2) + 20; }
    g.fillStyle = '#ffffff'; g.font = font('600', 44);
    (c.k && c.k.length ? c.k : (t ? t.skills.slice(0, 3) : [])).slice(0, 4).forEach(function (s) { g.fillStyle = '#f5c536'; g.fillRect(80, y - 28, 18, 18); g.fillStyle = '#ffffff'; y = wrap(s, 120, y, W - 520, 54, 2) + 8; });
    g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(0, H - 360, W, 360);
    g.fillStyle = '#ffffff'; g.font = font('700', 44); g.fillText('📍 ' + ([c.a, c.s].filter(Boolean).join(', ') || ''), 80, H - 250);
    if (c.w) { g.fillStyle = '#f5c536'; g.font = font('600', 34); g.fillText('WhatsApp', 80, H - 185); g.font = font('800', 50); g.fillText(prettyPhone(c.w), 80, H - 130); }
    g.fillStyle = '#bba9d8'; g.font = font('500', 28); g.fillText('Scan the code to see my page · Apprentice Pathways Explorer', 80, H - 70);
    if (linkUrl && typeof qrcode === 'function') {
      // whole-pixel squares and a 4-square white border, so phone cameras read it reliably
      var q = qrcode(0, 'L'); q.addData(linkUrl); q.make();
      var n = q.getModuleCount(), cell = Math.max(3, Math.floor(280 / (n + 8))), size = cell * (n + 8), x0 = W - size - 60, y0 = H - size - 100;
      g.fillStyle = '#ffffff'; g.fillRect(x0, y0, size, size); g.fillStyle = '#000000';
      for (var r = 0; r < n; r++) for (var col = 0; col < n; col++) if (q.isDark(r, col)) g.fillRect(x0 + (col + 4) * cell, y0 + (r + 4) * cell, cell, cell);
    }
    return cv;
  }

  function cdPublic(c) {
    var t = tradeById(c.t), wrap = $('#cd-public');
    $('#cd-app').hidden = true; wrap.hidden = false;
    // a customer is looking at someone's card: hide the "make a card" header and FAQ
    $$('.page-head, .section.band').forEach(function (el) { el.hidden = true; });
    var sec = wrap.closest('.section'); if (sec) sec.style.paddingTop = '28px';
    document.title = (c.b || 'Artisan') + ' · ' + (t ? t.title : '') + ' | Apprentice Pathways Explorer';
    wrap.innerHTML = '<div class="cd-public">' + cdCardHTML(c, '') +
      '<div class="row-actions" style="justify-content:center">' + (c.w ? '<a class="btn btn-primary" target="_blank" rel="noopener" href="https://wa.me/' + esc(c.w) + '?text=' + encodeURIComponent('Hello ' + (c.n || '') + ', I saw your card on Apprentice Pathways. ') + '">Chat on WhatsApp</a><a class="btn btn-ghost" href="tel:+' + esc(c.w) + '">Call</a>' : '') +
      (c.p && c.p.u ? '<a class="btn btn-ghost" href="' + esc(c.p.u) + '">See Skill Passport</a>' : '') + '</div>' +
      '<p class="note" style="text-align:center">This card was made by the artisan. Agree prices and check work before you pay. <a href="card.html">Make your own card</a></p></div>';
  }

  function initCard() {
    if (!$('#cd-form')) return;
    var shared = hashParam('c');
    if (shared) { var c = dec(shared); if (c) return cdPublic(c); }
    var saved = store.get('card', null), q = new URLSearchParams(location.search);
    var skillsBox = $('#cd-skills');
    function drawSkills(selected) {
      var t = tradeById($('#cd-trade').value);
      skillsBox.innerHTML = t ? t.skills.map(function (s) { return '<button type="button" class="chip" aria-pressed="' + (selected.indexOf(s) !== -1) + '">' + esc(s) + '</button>'; }).join('') : '<span class="note">Choose your trade first.</span>';
    }
    if (saved) { CD_FIELDS.forEach(function (k) { if (saved[k] != null) $('#cd-' + k).value = saved[k]; }); $('#cd-passport').checked = !!saved.passport; }
    else { var p = store.get('profile', null); if (p) { if (p.nick) $('#cd-name').value = p.nick; if (p.state) $('#cd-state').value = p.state; } }
    if (q.get('trade') && tradeById(q.get('trade'))) $('#cd-trade').value = q.get('trade');
    if (store.get(PP_KEY, []).some(function (x) { return x.trade === $('#cd-trade').value; }) && !saved) $('#cd-passport').checked = true;
    drawSkills(saved && saved.trade === $('#cd-trade').value ? saved.skills || [] : []);
    function render() {
      var v = cdRead(); store.set('card', v);
      $('#cd-preview').innerHTML = cdCardHTML(cdPublicData(v), cdLink(v));
    }
    $('#cd-trade').addEventListener('change', function () { drawSkills([]); render(); });
    skillsBox.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      var on = b.getAttribute('aria-pressed') === 'true';
      if (!on && $$('#cd-skills [aria-pressed="true"]').length >= 4) { toast('Pick up to 4 skills.', $('#cd-msg')); return; }
      b.setAttribute('aria-pressed', String(!on)); render();
    });
    $('#cd-form').addEventListener('input', render);
    $('#cd-download').addEventListener('click', function () {
      var v = cdRead(); if (!v.business || !v.trade) { toast('Add your business name and trade first.', $('#cd-msg')); return; }
      var cv = cdDraw(cdPublicData(v), cdLink(v)), a = document.createElement('a');
      a.download = (v.business || 'my-card').replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '-card.png';
      a.href = cv.toDataURL('image/png'); a.click();
      toast('Card saved to your phone. Post it on your WhatsApp status!', $('#cd-msg'));
    });
    $('#cd-link').addEventListener('click', function () { copy(cdLink(cdRead(), true), $('#cd-msg')); });
    render();
  }

  /* =================================================================
     PART D: DASHBOARD SUMMARY
     ================================================================= */
  function initDashTools() {
    var box = $('#dash-tools'); if (!box) return;
    var ags = store.get('agreements', []), pps = store.get(PP_KEY, []), card = store.get('card', null), rows = [];
    pps.forEach(function (p) { var t = tradeById(p.trade), st = ppStats(p); rows.push('<li><a href="passport.html?trade=' + p.trade + '"><strong>Skill Passport: ' + esc(t ? t.title : p.trade) + '</strong><span>' + st.master + ' of ' + st.total + ' confirmed by master</span></a></li>'); });
    ags.forEach(function (a) { var t = tradeById(a.trade); rows.push('<li><a href="agreement.html"><strong>Agreement: ' + esc(t ? t.title : 'draft') + '</strong><span>' + esc(a.master ? 'with ' + a.master : 'draft') + ', saved ' + esc(niceDate(a.saved)) + '</span></a></li>'); });
    if (card && card.business) rows.push('<li><a href="card.html"><strong>Profile card: ' + esc(card.business) + '</strong><span>Download or share your card</span></a></li>');
    box.innerHTML = rows.length ? '<ul class="dash-tools">' + rows.join('') + '</ul>' : '<p class="note">No tools yet. <a href="tools.html">Make an agreement, a Skill Passport or a profile card.</a></p>';
  }

  function init() { initAgreement(); initPassport(); initCard(); initDashTools(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.addEventListener('hashchange', function () { if (hashParam('p') || hashParam('c')) location.reload(); });
})();
