/* Apprentice Pathways Explorer — site behaviour
   Needs: data.js, render.js, scenes.js, config.js (loaded before this file). */
(function () {
  'use strict';

  var Rn = window.Render;
  var icon = Rn.icon, esc = Rn.esc;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var ROOT = document.body.getAttribute('data-root') || '';
  var PAGE = document.body.getAttribute('data-page') || '';
  var CFG = window.APE_CONFIG || { ai: { enabled: false } };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function byId(id) { for (var i = 0; i < TRADES.length; i++) if (TRADES[i].id === id) return TRADES[i]; return null; }

  /* ---------- storage (works even when the browser blocks it) ---------- */
  var memory = {};
  var store = {
    get: function (key, fallback) {
      try { var raw = window.localStorage.getItem('ape2:' + key); return raw ? JSON.parse(raw) : fallback; }
      catch (e) { return memory[key] !== undefined ? memory[key] : fallback; }
    },
    set: function (key, value) {
      memory[key] = value;
      try { window.localStorage.setItem('ape2:' + key, JSON.stringify(value)); return true; } catch (e) { return false; }
    },
    remove: function (key) {
      delete memory[key];
      try { window.localStorage.removeItem('ape2:' + key); } catch (e) { /* blocked */ }
    }
  };
  var KEYS = ['profile', 'saved', 'plans', 'quiz', 'recent'];

  /* ---------- toast ---------- */
  var toastTimer;
  function toast(msg) {
    var el = $('#toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast'; el.className = 'toast'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = msg; el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 2800);
  }

  /* ---------- dates ---------- */
  function todayISO() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function parseISO(s) { var p = String(s).split('-'); return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2])); }
  function toISO(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function addDays(iso, n) { var d = parseISO(iso); d.setDate(d.getDate() + n); return toISO(d); }
  function fmtDate(iso) { return parseISO(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }

  /* ---------- profile (anonymous by default) ---------- */
  var COLORS = ['#1d5a46', '#2a5aa8', '#c0392b', '#7d3c98', '#d9531e', '#b8860b'];
  function getProfile() { return store.get('profile', null); }
  function ensureProfile() {
    var p = getProfile();
    if (p) return p;
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', id = 'APE-';
    for (var i = 0; i < 5; i++) id += chars[Math.floor(Math.random() * chars.length)];
    p = { id: id, nickname: '', color: COLORS[0], state: '', interests: [], goal: '', created: todayISO() };
    store.set('profile', p);
    return p;
  }

  /* ---------- saved trades ---------- */
  function getSaved() { return store.get('saved', []).filter(byId); }
  function isSaved(id) { return getSaved().indexOf(id) !== -1; }
  function toggleSave(id) {
    var t = byId(id); if (!t) return;
    ensureProfile();
    var saved = getSaved();
    if (saved.indexOf(id) !== -1) { saved = saved.filter(function (x) { return x !== id; }); toast('Removed ' + t.title + ' from your saved trades'); }
    else { saved.unshift(id); toast('Saved ' + t.title + ' to your dashboard'); }
    store.set('saved', saved);
    syncSaveButtons();
    if (PAGE === 'dashboard') renderDashboard();
  }
  function syncSaveButtons() {
    $$('[data-save]').forEach(function (btn) {
      var id = btn.getAttribute('data-save'), on = isSaved(id), t = byId(id);
      btn.setAttribute('aria-pressed', String(on));
      if (btn.classList.contains('save-btn')) btn.setAttribute('aria-label', (on ? 'Remove ' : 'Save ') + (t ? t.title : 'trade'));
      else btn.innerHTML = icon('bookmark') + ' ' + (on ? 'Saved' : 'Save this trade');
    });
  }
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-save]');
    if (btn) { e.preventDefault(); toggleSave(btn.getAttribute('data-save')); }
  });

  /* ---------- navigation ---------- */
  function initNav() {
    var toggle = $('.nav-toggle'), nav = $('.site-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!open));
        toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
        nav.classList.toggle('open', !open);
      });
    }
    var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------- offline support ---------- */
  function initOffline() {
    var bar = document.createElement('div');
    bar.className = 'offline-bar'; bar.setAttribute('role', 'status');
    bar.innerHTML = icon('wifi') + ' You are offline. Pages you opened before and your saved plans still work.';
    bar.hidden = navigator.onLine !== false;
    var header = $('.site-header');
    if (header) header.insertAdjacentElement('afterend', bar);
    window.addEventListener('offline', function () { bar.hidden = false; });
    window.addEventListener('online', function () { bar.hidden = true; });
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
      navigator.serviceWorker.register(ROOT + 'sw.js').catch(function () { /* offline mode unavailable here */ });
    }
  }

  /* ---------- search ---------- */
  function matches(t, q) {
    var hay = (t.title + ' ' + t.summary + ' ' + CATEGORIES[t.cat].label + ' ' + t.skills.join(' ') + ' ' + (t.hubs || '')).toLowerCase();
    return q.split(/\s+/).filter(Boolean).every(function (w) { return hay.indexOf(w) !== -1; });
  }
  function initSiteSearch() {
    var input = $('#site-search'), list = $('#site-search-results');
    if (!input || !list) return;
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      if (!q) { list.hidden = true; list.innerHTML = ''; input.setAttribute('aria-expanded', 'false'); return; }
      var hits = TRADES.filter(function (t) { return matches(t, q); }).slice(0, 8);
      list.innerHTML = hits.length
        ? hits.map(function (t) { return '<li><a href="' + Rn.tradeUrl(t, ROOT) + '"><span>' + esc(t.title) + '</span><span class="tag">' + esc(durationLabel(t.months)) + '</span></a></li>'; }).join('')
        : '<li class="search-empty">No trade matches “' + esc(input.value.trim()) + '”. Try “tailor”, “solar”, “farm” or “phone”.</li>';
      list.hidden = false; input.setAttribute('aria-expanded', 'true');
    });
    input.addEventListener('keydown', function (e) { if (e.key === 'Escape') { input.value = ''; list.hidden = true; } });
    document.addEventListener('click', function (e) { if (!e.target.closest('.search')) list.hidden = true; });
  }

  /* ---------- hero carousel: one trade every 5 seconds ---------- */
  function initCarousel() {
    var view = $('#stage-view');
    if (!view) return;
    var order = TRADES.slice();
    for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var tmp = order[i]; order[i] = order[j]; order[j] = tmp; }
    var idx = 0, timer = null, playing = !reduceMotion;
    var bar = $('#stage-progress span'), toggle = $('#stage-toggle');

    function show(n) {
      idx = (n + order.length) % order.length;
      var t = order[idx];
      var old = $$('.stage-slide', view);
      var slide = document.createElement('div');
      slide.className = 'stage-slide';
      slide.innerHTML = Scenes.render(t);
      view.appendChild(slide);
      old.forEach(function (o) { o.classList.add('leaving'); setTimeout(function () { if (o.parentNode) o.parentNode.removeChild(o); }, 650); });
      $('#stage-title').textContent = t.title;
      $('#stage-meta').textContent = CATEGORIES[t.cat].label + ' · ' + durationLabel(t.months);
      $('#stage-link').href = Rn.tradeUrl(t, ROOT);
      $('#stage-link').setAttribute('aria-label', 'See the pathway for ' + t.title);
      if (bar) { bar.classList.remove('run'); void bar.offsetWidth; if (playing) bar.classList.add('run'); }
      schedule();
    }
    function schedule() { clearTimeout(timer); if (playing) timer = setTimeout(function () { show(idx + 1); }, 5000); }
    function setPlaying(on) {
      playing = on;
      toggle.innerHTML = icon(on ? 'pause' : 'play');
      toggle.setAttribute('aria-label', on ? 'Pause slideshow' : 'Play slideshow');
      if (bar) { bar.classList.remove('run'); void bar.offsetWidth; if (on) bar.classList.add('run'); }
      schedule();
    }
    $('#stage-prev').addEventListener('click', function () { show(idx - 1); });
    $('#stage-next').addEventListener('click', function () { show(idx + 1); });
    toggle.addEventListener('click', function () { setPlaying(!playing); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) clearTimeout(timer); else schedule(); });
    setPlaying(playing);
    show(0);
  }

  /* ---------- directory pages ---------- */
  function initDirectory() {
    var grid = $('#card-grid');
    if (!grid) return;
    var cards = $$('.card', grid);
    var input = $('#dir-search'), lenSel = $('#f-length'), costSel = $('#f-cost'), sortSel = $('#f-sort'), count = $('#result-count');
    var cat = 'all';
    var hashCat = (location.hash || '').replace('#cat-', '');
    if (hashCat && CATEGORIES[hashCat]) cat = hashCat;

    function apply() {
      var q = (input.value || '').trim().toLowerCase(), maxLen = Number(lenSel.value), maxCost = Number(costSel.value);
      var shown = 0;
      cards.forEach(function (c) {
        var t = byId(c.getAttribute('data-id'));
        var ok = (cat === 'all' || t.cat === cat) && (!q || matches(t, q)) && (!maxLen || t.months[0] <= maxLen) && (!maxCost || t.cost <= maxCost);
        c.hidden = !ok; if (ok) shown++;
      });
      var sorted = cards.slice().sort(function (a, b) {
        var ta = byId(a.getAttribute('data-id')), tb = byId(b.getAttribute('data-id'));
        if (sortSel.value === 'short') return ta.months[0] - tb.months[0] || ta.title.localeCompare(tb.title);
        if (sortSel.value === 'cost') return ta.cost - tb.cost || ta.title.localeCompare(tb.title);
        return ta.title.localeCompare(tb.title);
      });
      sorted.forEach(function (c) { grid.appendChild(c); });
      var empty = $('#dir-empty'); if (empty) empty.hidden = shown !== 0;
      count.textContent = 'Showing ' + shown + ' of ' + cards.length + ' pathways';
      $$('[data-filter-cat]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-filter-cat') === cat)); });
    }
    $$('[data-filter-cat]').forEach(function (b) {
      b.addEventListener('click', function () {
        cat = b.getAttribute('data-filter-cat');
        try { history.replaceState(null, '', cat === 'all' ? location.pathname : '#cat-' + cat); } catch (e) { /* ignore */ }
        apply();
      });
    });
    [input, lenSel, costSel, sortSel].forEach(function (el) { el.addEventListener(el === input ? 'input' : 'change', apply); });
    $('#dir-reset').addEventListener('click', function () { input.value = ''; lenSel.value = '0'; costSel.value = '0'; sortSel.value = 'az'; cat = 'all'; apply(); });
    apply();
  }

  /* ---------- trade page ---------- */
  function initTradePage() {
    var id = document.body.getAttribute('data-trade');
    if (!id) return;
    var recent = store.get('recent', []).filter(function (x) { return x !== id; });
    recent.unshift(id); store.set('recent', recent.slice(0, 8));
    var share = $('#share-link');
    if (share) share.addEventListener('click', function () {
      var url = location.href.split('#')[0];
      var done = function () { toast('Link copied. Paste it in WhatsApp or anywhere you like.'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { showLink(url); });
      else showLink(url);
    });
    function showLink(url) { var box = $('#share-box'); box.hidden = false; box.value = url; box.select(); toast('Copy the link from the box'); }
  }

  /* ---------- Pathway Finder quiz ---------- */
  var QUESTIONS = [
    { id: 'interests', title: 'What do you enjoy most?', hint: 'Choose up to 3.', type: 'multi', max: 3,
      options: Object.keys(INTERESTS).map(function (k) { return { v: k, label: INTERESTS[k] }; }) },
    { id: 'style', title: 'How do you like to work?', hint: 'Choose up to 2.', type: 'multi', max: 2,
      options: [{ v: 'hands', label: 'With my hands' }, { v: 'detail', label: 'Careful, detailed work' }, { v: 'screen', label: 'On a computer or phone' }, { v: 'people', label: 'Talking with people' }, { v: 'physical', label: 'Strong, physical work' }] },
    { id: 'setting', title: 'Where would you rather work?', hint: 'Choose one.', type: 'single',
      options: [{ v: 'indoor', label: 'Indoors' }, { v: 'outdoor', label: 'Outdoors or on site' }, { v: 'any', label: 'Either is fine' }] },
    { id: 'time', title: 'How long can you train before you need to earn?', hint: 'Choose one. Many trades can start earning small money during training.', type: 'single',
      options: [{ v: '1', label: 'About 1 month' }, { v: '3', label: 'About 3 months' }, { v: '6', label: 'About 6 months' }, { v: '12', label: 'About 1 year' }, { v: '36', label: '2 years or more' }] },
    { id: 'budget', title: 'How much can you spend on tools and materials to start?', hint: 'Choose one.', type: 'single',
      options: [{ v: '1', label: 'Very little' }, { v: '2', label: 'Some savings' }, { v: '3', label: 'I can invest more' }] },
    { id: 'goal', title: 'What is your main goal?', hint: 'Choose one.', type: 'single',
      options: [{ v: 'business', label: 'Own my shop or business' }, { v: 'job', label: 'Get a paid job' }, { v: 'freelance', label: 'Freelance or remote work' }] }
  ];
  var STYLE_TAGS = { hands: ['hands'], detail: ['detail'], screen: ['tech', 'media'], people: ['people'], physical: ['physical'] };

  function scoreTrades(a) {
    var T = Number(a.time), B = Number(a.budget);
    return TRADES.map(function (t) {
      var s = 0, max = 21, why = [];
      var hit = a.interests.filter(function (i) { return t.tags.indexOf(i) !== -1; });
      s += Math.min(8, hit.length * 5);
      hit.forEach(function (i) { why.push(INTERESTS[i]); });
      a.style.forEach(function (st) { if (STYLE_TAGS[st].some(function (tg) { return t.tags.indexOf(tg) !== -1; })) { s += 2; } });
      if (a.setting === 'any' || t.setting === a.setting) { s += 2; if (a.setting !== 'any') why.push(a.setting === 'indoor' ? 'Indoor work' : 'Outdoor work'); }
      else if (t.setting === 'mixed') s += 1;
      if (t.months[0] <= T) { s += 3; why.push('Fits your time'); } else if (t.months[0] <= T * 2) s += 1; else s -= 2;
      if (t.cost <= B) { s += 2; why.push('Fits your budget'); } else if (t.cost - B >= 2) s -= 2;
      if (t.goals.indexOf(a.goal) !== -1) { s += 2; why.push({ business: 'Good for owning a business', job: 'Good for getting a job', freelance: 'Good for freelancing' }[a.goal]); }
      if (a.style.indexOf('physical') === -1 && t.tags.indexOf('physical') !== -1 && a.style.length) s -= 1;
      return { id: t.id, pct: Math.max(5, Math.min(99, Math.round(s / max * 100))), why: why };
    }).sort(function (x, y) { return y.pct - x.pct || byId(x.id).months[0] - byId(y.id).months[0]; }).slice(0, 5);
  }

  function resultsHTML(results) {
    return '<div class="results">' + results.map(function (r, i) {
      var t = byId(r.id); if (!t) return '';
      return '<article class="result"><a class="media" href="' + Rn.tradeUrl(t, ROOT) + '" tabindex="-1" aria-hidden="true" data-scene-for="' + t.id + '"></a>' +
        '<div class="result-body"><div class="result-top"><h3><a href="' + Rn.tradeUrl(t, ROOT) + '">' + (i + 1) + '. ' + esc(t.title) + '</a></h3><span class="score">' + r.pct + '% match</span></div>' +
        '<div class="meter" role="img" aria-label="' + r.pct + '% match"><span style="width:' + r.pct + '%"></span></div>' +
        '<div class="why">' + r.why.slice(0, 4).map(function (w) { return '<span>' + esc(w) + '</span>'; }).join('') + '</div>' +
        '<p class="note">' + esc(t.summary) + ' Typical training: <strong>' + esc(durationLabel(t.months)) + '</strong>.</p>' +
        '<details' + (i === 0 ? ' open' : '') + '><summary>See the steps to take, in order</summary>' + Rn.pathHTML(t) + '</details>' +
        '<div class="row-actions"><button type="button" class="btn btn-primary btn-sm" data-make-plan="' + t.id + '">Build my learning plan</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-save="' + t.id + '">' + icon('bookmark') + ' Save this trade</button></div></div></article>';
    }).join('') + '</div>';
  }

  function initQuiz() {
    var body = $('#quiz-body'), out = $('#quiz-results');
    if (!body) return;
    var answers = { interests: [], style: [], setting: '', time: '', budget: '', goal: '' };
    var step = 0;

    function render() {
      var q = QUESTIONS[step];
      var pct = Math.round(step / QUESTIONS.length * 100);
      body.innerHTML =
        '<div class="quiz-progress"><span>Question ' + (step + 1) + ' of ' + QUESTIONS.length + '</span><div class="meter"><span style="width:' + pct + '%"></span></div></div>' +
        '<fieldset style="border:0;padding:0;margin:0"><legend class="q-title">' + esc(q.title) + '</legend><p class="q-hint">' + esc(q.hint) + '</p>' +
        '<div class="option-grid">' + q.options.map(function (o) {
          var id = 'q-' + q.id + '-' + o.v, sel = q.type === 'multi' ? answers[q.id].indexOf(o.v) !== -1 : answers[q.id] === o.v;
          return '<div class="option"><input type="' + (q.type === 'multi' ? 'checkbox' : 'radio') + '" name="' + q.id + '" id="' + id + '" value="' + o.v + '"' + (sel ? ' checked' : '') + '><label for="' + id + '"><span class="tick"></span>' + esc(o.label) + '</label></div>';
        }).join('') + '</div></fieldset>' +
        '<p class="err" id="quiz-err" role="alert"></p>' +
        '<div class="quiz-nav"><button type="button" class="btn btn-ghost" id="quiz-back"' + (step === 0 ? ' disabled' : '') + '>' + icon('back') + ' Back</button>' +
        '<button type="button" class="btn btn-primary" id="quiz-next">' + (step === QUESTIONS.length - 1 ? 'Show my matches' : 'Next') + ' ' + icon('arrow') + '</button></div>';
      $$('input', body).forEach(function (inp) {
        inp.addEventListener('change', function () {
          if (q.type === 'multi') {
            var chosen = $$('input:checked', body).map(function (x) { return x.value; });
            if (chosen.length > q.max) { inp.checked = false; $('#quiz-err').textContent = 'You can choose up to ' + q.max + '. Untick one to choose another.'; return; }
            answers[q.id] = chosen;
          } else answers[q.id] = inp.value;
          $('#quiz-err').textContent = '';
        });
      });
      $('#quiz-back').addEventListener('click', function () { if (step > 0) { step--; render(); focusLegend(); } });
      $('#quiz-next').addEventListener('click', function () {
        var v = answers[q.id];
        if (!v || (Array.isArray(v) && !v.length)) { $('#quiz-err').textContent = 'Choose at least one answer to continue.'; return; }
        if (step < QUESTIONS.length - 1) { step++; render(); focusLegend(); }
        else finish();
      });
    }
    function focusLegend() { var l = $('legend', body); if (l) { l.setAttribute('tabindex', '-1'); l.focus(); } }
    function finish() {
      var results = scoreTrades(answers);
      store.set('quiz', { answers: answers, results: results, at: todayISO() });
      ensureProfile();
      showResults(results, false);
    }
    function showResults(results, old) {
      body.hidden = true;
      out.hidden = false;
      out.innerHTML = '<div class="section-head" style="margin-bottom:16px"><div><p class="eyebrow">' + (old ? 'Your last results' : 'Your results') + '</p><h2>Your top 5 pathways</h2><p>Matched on your interests, working style, time, budget and goal. Open any result to see the numbered steps to follow.</p></div>' +
        '<button type="button" class="btn btn-ghost" id="quiz-again">Take the quiz again</button></div>' + resultsHTML(results);
      Scenes.mountAll(out); syncSaveButtons();
      $('#quiz-again').addEventListener('click', function () { step = 0; out.hidden = true; body.hidden = false; render(); focusLegend(); });
      out.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
    var last = store.get('quiz', null);
    if (last && last.results && last.results.length && last.answers) { answers = last.answers; showResults(last.results, true); window.scrollTo(0, 0); }
    else render();
  }

  /* ---------- learning plan builder ---------- */
  var WEIGHTS = [1, 1.4, 1.8, 1.8, 1.4, 1, 1];
  function buildPlan(t, monthsSel, hours, startISO) {
    var months = monthsSel === 'typical' ? t.months[0] : Number(monthsSel);
    var minM = t.months[0], full = t.path, partial = months < minM;
    var n = partial ? Math.max(2, Math.min(full.length - 1, Math.round(full.length * months / minM))) : full.length;
    var titles = full.slice(0, n);
    if (partial) titles.push('Review your progress and plan the next stage');
    var totalDays = Math.max(7, Math.round(months * 30.44));
    var w = titles.map(function (_, i) { return WEIGHTS[i] || 1; });
    var sum = w.reduce(function (a, b) { return a + b; }, 0);
    var unit = CATEGORIES[t.cat].group === 'trades' ? 'job' : 'project';
    var offset = 0;
    var steps = titles.map(function (title, i) {
      var days = i === titles.length - 1 ? totalDays - offset : Math.max(3, Math.round(totalDays * w[i] / sum));
      var from = addDays(startISO, offset), to = addDays(startISO, offset + days - 1);
      offset += days;
      var focus = t.skills[i % t.skills.length];
      var tasks;
      var isReview = partial && i === titles.length - 1, isLast = !partial && i === titles.length - 1;
      if (i === 0) tasks = ['Learn the name and safe use of every tool and material you will handle', 'Watch your trainer on real work and write notes every day', 'Start practising: ' + focus.charAt(0).toLowerCase() + focus.slice(1)];
      else if (isReview) tasks = ['List everything you can now do without help', 'Ask your trainer to test you on one complete task', 'Agree the next stage together: ' + full[n].charAt(0).toLowerCase() + full[n].slice(1)];
      else if (isLast) tasks = ['Do complete ' + unit + 's from start to finish while your trainer checks', 'Prepare your certificate, trade test or portfolio', 'Plan your tools, prices and first customers'];
      else tasks = ['Practise ' + focus.charAt(0).toLowerCase() + focus.slice(1) + ' for about ' + hours + ' hours on each training day', 'Complete at least one supervised ' + unit + ' every week', 'Ask for feedback every week and fix one weak point'];
      return { title: title, from: from, to: to, focus: focus, tasks: tasks, done: false };
    });
    var notes = [];
    if (partial) notes.push(months + (months === 1 ? ' month' : ' months') + ' covers the foundation of ' + t.title + '. Most people train for ' + durationLabel(t.months) + ' before they work alone. Build a new plan for the next stage when you finish this one.');
    else if (months > t.months[1]) notes.push('This plan is longer than the typical ' + durationLabel(t.months) + ', which suits part-time learners and gives you room to practise.');
    if (hours <= 2 && !partial) notes.push('At about ' + hours + ' hours a day, expect to need the longer end of the typical training time.');
    return {
      pid: 'p' + Date.now().toString(36), tradeId: t.id, title: t.title, months: months, hours: hours, start: startISO,
      end: addDays(startISO, totalDays - 1), days: totalDays, practiceHours: Math.round(totalDays * 5 / 7 * hours), partial: partial, steps: steps, notes: notes, created: todayISO()
    };
  }

  function planStepsHTML(plan, interactive) {
    var nextIdx = -1;
    for (var i = 0; i < plan.steps.length; i++) if (!plan.steps[i].done) { nextIdx = i; break; }
    return '<ol class="plan-steps">' + plan.steps.map(function (s, i) {
      return '<li class="plan-step' + (s.done ? ' done' : '') + (i === nextIdx ? ' next' : '') + '" data-step="' + i + '">' +
        '<h4>' + esc(s.title) + '</h4><p class="when">' + fmtDate(s.from) + ' – ' + fmtDate(s.to) + ' · Focus: ' + esc(s.focus) + '</p>' +
        '<ul>' + s.tasks.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
        '<p class="milestone">Milestone: your trainer agrees you have completed “' + esc(s.title) + '”.</p>' +
        (interactive ? '<label class="check"><input type="checkbox" data-plan="' + plan.pid + '" data-step="' + i + '"' + (s.done ? ' checked' : '') + '> Mark step ' + (i + 1) + ' as done</label>' : '') +
        '</li>';
    }).join('') + '</ol>';
  }

  function planPreviewHTML(plan) {
    var t = byId(plan.tradeId);
    return '<div class="plan panel"><div class="plan-head"><div><p class="eyebrow" style="color:var(--good)">Your learning plan</p><h3>' + esc(plan.title) + '</h3></div>' +
      '<div class="row-actions"><button type="button" class="btn btn-primary" id="plan-save">Save to my dashboard</button><a class="btn btn-ghost" href="' + Rn.tradeUrl(t, ROOT) + '">About this trade</a></div></div>' +
      '<div class="plan-summary"><div><span>Starts</span><strong>' + fmtDate(plan.start) + '</strong></div><div><span>Ends</span><strong>' + fmtDate(plan.end) + '</strong></div>' +
      '<div><span>Steps</span><strong>' + plan.steps.length + '</strong></div><div><span>Practice time</span><strong>≈ ' + plan.practiceHours + ' hours</strong></div></div>' +
      plan.notes.map(function (n) { return '<p class="callout">' + esc(n) + '</p>'; }).join('') +
      '<div class="first-step"><p class="eyebrow">Do this first, this week</p><p>' + esc(t.first) + '</p></div>' +
      planStepsHTML(plan, false) + '</div>';
  }

  function initBuilder() {
    var form = $('#plan-form'), out = $('#plan-out');
    if (!form) return;
    var sel = $('#p-trade'), hint = $('#p-trade-hint');
    Object.keys(CATEGORIES).forEach(function (c) {
      var g = document.createElement('optgroup'); g.label = CATEGORIES[c].label;
      TRADES.filter(function (t) { return t.cat === c; }).forEach(function (t) { var o = document.createElement('option'); o.value = t.id; o.textContent = t.title; g.appendChild(o); });
      sel.appendChild(g);
    });
    $('#p-start').value = todayISO();
    function showHint() { var t = byId(sel.value); hint.textContent = t ? 'Typical training: ' + durationLabel(t.months) + '. ' + costLabel(t.cost) + '.' : ''; }
    sel.addEventListener('change', showHint);
    var current = null;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var t = byId(sel.value), err = $('#plan-err');
      if (!t) { err.textContent = 'Choose a trade or course first.'; sel.focus(); return; }
      if (!$('#p-start').value) { err.textContent = 'Choose a start date.'; $('#p-start').focus(); return; }
      err.textContent = '';
      current = buildPlan(t, $('#p-months').value, Number($('#p-hours').value), $('#p-start').value);
      out.innerHTML = planPreviewHTML(current);
      out.hidden = false;
      $('#plan-save').addEventListener('click', function () {
        ensureProfile();
        var plans = store.get('plans', []);
        plans.unshift(current);
        store.set('plans', plans);
        $('#plan-save').outerHTML = '<a class="btn btn-primary" href="' + ROOT + 'dashboard.html#plans">Saved. Open my dashboard ' + icon('arrow') + '</a>';
        toast('Plan saved to your dashboard');
      });
      out.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-make-plan]');
      if (!b) return;
      sel.value = b.getAttribute('data-make-plan'); showHint();
      selectTab('plan');
      sel.focus();
    });
    function fromHash() {
      var m = (location.hash || '').match(/^#t-(.+)$/);
      if (m && byId(m[1])) { sel.value = m[1]; showHint(); selectTab('plan'); }
      else if (location.hash === '#plan') selectTab('plan');
    }
    window.addEventListener('hashchange', fromHash);
    fromHash();
    showHint();
  }

  function selectTab(name) {
    $$('[role="tab"]').forEach(function (tab) {
      var on = tab.getAttribute('data-tab') === name;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      $('#' + tab.getAttribute('aria-controls')).hidden = !on;
    });
  }
  function initTabs() {
    var tabs = $$('[role="tab"]');
    if (!tabs.length) return;
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { selectTab(tab.getAttribute('data-tab')); });
      tab.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        selectTab(n.getAttribute('data-tab')); n.focus();
      });
    });
  }

  /* ---------- dashboard ---------- */
  function renderDashboard() {
    if (!$('#dash')) return;
    var p = getProfile(), plans = store.get('plans', []), saved = getSaved(), quiz = store.get('quiz', null), recent = store.get('recent', []).filter(byId);

    // profile card
    var name = p && p.nickname ? p.nickname : 'Guest apprentice';
    $('#pf-avatar').textContent = (name.charAt(0) || 'A').toUpperCase();
    $('#pf-avatar').style.background = p ? p.color : COLORS[0];
    $('#pf-name').textContent = name;
    $('#pf-id').textContent = p ? 'Profile ID ' + p.id + (p.state ? ' · ' + p.state : '') : 'No profile saved yet';

    // stats
    var stepsTotal = 0, stepsDone = 0;
    plans.forEach(function (pl) { stepsTotal += pl.steps.length; pl.steps.forEach(function (s) { if (s.done) stepsDone++; }); });
    $('#st-saved').textContent = saved.length; $('#st-plans').textContent = plans.length; $('#st-steps').textContent = stepsDone + '/' + stepsTotal;

    // plans
    var pw = $('#dash-plans');
    pw.innerHTML = plans.length ? plans.map(function (pl, i) {
      var done = pl.steps.filter(function (s) { return s.done; }).length, pct = Math.round(done / pl.steps.length * 100);
      return '<details class="plan-card" data-pid="' + pl.pid + '"' + (i === 0 ? ' open' : '') + '><summary><div class="result-top"><h3>' + esc(pl.title) + '</h3><span class="score" data-pct>' + pct + '%</span></div>' +
        '<div class="progress-label"><span>' + fmtDate(pl.start) + ' – ' + fmtDate(pl.end) + '</span><span data-count>' + done + ' of ' + pl.steps.length + ' steps</span></div>' +
        '<div class="meter"><span data-bar style="width:' + pct + '%"></span></div></summary>' +
        planStepsHTML(pl, true) +
        '<div class="confirm" style="padding:0 16px 16px"><button type="button" class="btn btn-ghost btn-sm" data-del-plan="' + pl.pid + '">' + icon('trash') + ' Delete plan</button>' +
        '<span data-del-confirm="' + pl.pid + '" hidden>Delete this plan? <button type="button" class="btn btn-danger btn-sm" data-del-yes="' + pl.pid + '">Yes, delete</button> <button type="button" class="btn btn-ghost btn-sm" data-del-no="' + pl.pid + '">Keep it</button></span></div></details>';
    }).join('') : '<p class="placeholder">No learning plans yet. <a href="' + ROOT + 'planner.html#plan">Build your first plan</a> for any trade, from 1 month upwards.</p>';

    // saved
    $('#dash-saved').innerHTML = saved.length ? '<div class="saved-list">' + saved.map(function (id) {
      var t = byId(id);
      return '<div class="saved-row"><span class="media" data-scene-for="' + id + '"></span><div><a href="' + Rn.tradeUrl(t, ROOT) + '">' + esc(t.title) + '</a><br><span class="note">' + esc(durationLabel(t.months)) + '</span></div>' +
        '<div class="row-actions"><a class="btn btn-ghost btn-sm" href="' + ROOT + 'planner.html#t-' + id + '">Plan</a><button type="button" class="save-btn" data-save="' + id + '" aria-pressed="true">' + icon('bookmark') + '</button></div></div>';
    }).join('') + '</div>' : '<p class="placeholder">Tap the bookmark on any trade to save it here.</p>';

    // quiz
    $('#dash-quiz').innerHTML = quiz && quiz.results ? '<ol class="path">' + quiz.results.slice(0, 3).map(function (r) {
      var t = byId(r.id); return t ? '<li><a href="' + Rn.tradeUrl(t, ROOT) + '"><strong>' + esc(t.title) + '</strong></a>' + r.pct + '% match</li>' : '';
    }).join('') + '</ol><p style="margin-top:10px"><a class="btn-text" href="' + ROOT + 'planner.html">See all results ' + icon('arrow') + '</a></p>' : '<p class="placeholder">Take the <a href="' + ROOT + 'planner.html">Pathway Finder</a> to see your best matches.</p>';

    // recent
    $('#dash-recent').innerHTML = recent.length ? '<ul class="tick-list">' + recent.slice(0, 6).map(function (id) { var t = byId(id); return '<li>' + icon('clock') + '<a href="' + Rn.tradeUrl(t, ROOT) + '">' + esc(t.title) + '</a></li>'; }).join('') + '</ul>' : '<p class="note">Trades you open will appear here.</p>';

    Scenes.mountAll($('#dash')); syncSaveButtons();
  }

  function fillProfileForm() {
    var p = getProfile() || { nickname: '', color: COLORS[0], state: '', interests: [], goal: '' };
    $('#pf-nick').value = p.nickname || '';
    $('#pf-state').value = p.state || '';
    $('#pf-goal').value = p.goal || '';
    $$('[name="pf-int"]').forEach(function (c) { c.checked = (p.interests || []).indexOf(c.value) !== -1; });
    $$('.swatch').forEach(function (s) { s.setAttribute('aria-pressed', String(s.getAttribute('data-color') === (p.color || COLORS[0]))); });
  }

  function initDashboard() {
    if (!$('#dash')) return;
    var stSel = $('#pf-state');
    STATES.forEach(function (s) { var o = document.createElement('option'); o.value = s; o.textContent = s; stSel.appendChild(o); });
    $('#pf-swatches').innerHTML = COLORS.map(function (c, i) { return '<button type="button" class="swatch" data-color="' + c + '" style="background:' + c + '" aria-label="Colour ' + (i + 1) + '" aria-pressed="false"></button>'; }).join('');
    $('#pf-ints').innerHTML = Object.keys(INTERESTS).map(function (k) { return '<span><input class="chip-input" type="checkbox" name="pf-int" id="pf-int-' + k + '" value="' + k + '"><label class="chip" for="pf-int-' + k + '">' + esc(INTERESTS[k]) + '</label></span>'; }).join('');
    var color = (getProfile() || {}).color || COLORS[0];
    $('#pf-swatches').addEventListener('click', function (e) {
      var s = e.target.closest('.swatch'); if (!s) return;
      color = s.getAttribute('data-color');
      $$('.swatch').forEach(function (x) { x.setAttribute('aria-pressed', String(x === s)); });
    });
    fillProfileForm();
    $('#profile-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var p = ensureProfile();
      var nick = $('#pf-nick').value.trim();
      if (nick.length > 30) { $('#pf-err').textContent = 'Use a nickname of 30 characters or fewer.'; $('#pf-nick').focus(); return; }
      $('#pf-err').textContent = '';
      p.nickname = nick; p.color = color; p.state = $('#pf-state').value; p.goal = $('#pf-goal').value;
      p.interests = $$('[name="pf-int"]:checked').map(function (c) { return c.value; });
      var ok = store.set('profile', p);
      toast(ok ? 'Profile saved on this device' : 'Saved for this visit only. Your browser is blocking storage.');
      renderDashboard();
    });

    var dash = $('#dash');
    dash.addEventListener('change', function (e) {
      var box = e.target.closest('input[data-plan]'); if (!box) return;
      var plans = store.get('plans', []), pl = plans.filter(function (x) { return x.pid === box.getAttribute('data-plan'); })[0]; if (!pl) return;
      pl.steps[Number(box.getAttribute('data-step'))].done = box.checked;
      store.set('plans', plans);
      var card = box.closest('.plan-card'), done = pl.steps.filter(function (s) { return s.done; }).length, pct = Math.round(done / pl.steps.length * 100);
      $('[data-pct]', card).textContent = pct + '%'; $('[data-count]', card).textContent = done + ' of ' + pl.steps.length + ' steps'; $('[data-bar]', card).style.width = pct + '%';
      var nextSet = false;
      $$('.plan-step', card).forEach(function (li, i) { li.classList.toggle('done', pl.steps[i].done); var isNext = !pl.steps[i].done && !nextSet; if (isNext) nextSet = true; li.classList.toggle('next', isNext); });
      var total = 0, d = 0; plans.forEach(function (x) { total += x.steps.length; x.steps.forEach(function (s) { if (s.done) d++; }); });
      $('#st-steps').textContent = d + '/' + total;
      if (done === pl.steps.length) toast('Well done! You finished every step of your ' + pl.title + ' plan.');
    });
    dash.addEventListener('click', function (e) {
      var del = e.target.closest('[data-del-plan]'), yes = e.target.closest('[data-del-yes]'), no = e.target.closest('[data-del-no]');
      if (del) { $('[data-del-confirm="' + del.getAttribute('data-del-plan') + '"]').hidden = false; }
      if (no) { $('[data-del-confirm="' + no.getAttribute('data-del-no') + '"]').hidden = true; }
      if (yes) { store.set('plans', store.get('plans', []).filter(function (x) { return x.pid !== yes.getAttribute('data-del-yes'); })); renderDashboard(); toast('Plan deleted'); }
    });

    // backup & restore
    $('#bk-make').addEventListener('click', function () {
      var data = {}; KEYS.forEach(function (k) { data[k] = store.get(k, null); });
      var code = btoa(unescape(encodeURIComponent(JSON.stringify({ v: 1, data: data }))));
      var box = $('#bk-code'); box.value = code; box.hidden = false; box.select();
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(function () { toast('Backup code copied. Keep it somewhere safe.'); }, function () { toast('Select the code in the box and copy it.'); });
      else toast('Select the code in the box and copy it.');
    });
    $('#bk-restore').addEventListener('click', function () {
      var raw = $('#bk-input').value.trim(), err = $('#bk-err');
      try {
        var obj = JSON.parse(decodeURIComponent(escape(atob(raw))));
        if (!obj || obj.v !== 1 || !obj.data) throw new Error('bad');
        KEYS.forEach(function (k) { if (obj.data[k] !== null && obj.data[k] !== undefined) store.set(k, obj.data[k]); });
        err.textContent = ''; $('#bk-input').value = '';
        fillProfileForm(); renderDashboard(); toast('Your profile and plans were restored');
      } catch (ex) { err.textContent = 'That code could not be read. Paste the whole backup code exactly as you copied it.'; }
    });
    $('#clear-all').addEventListener('click', function () { $('#clear-confirm').hidden = false; $('#clear-yes').focus(); });
    $('#clear-no').addEventListener('click', function () { $('#clear-confirm').hidden = true; });
    $('#clear-yes').addEventListener('click', function () { KEYS.forEach(store.remove); $('#clear-confirm').hidden = true; fillProfileForm(); renderDashboard(); toast('Everything was cleared from this device'); });

    renderDashboard();
  }

  /* ---------- opportunities: help by state ---------- */
  function initStates() {
    var sel = $('#state-select'), out = $('#state-result');
    if (!sel) return;
    STATES.forEach(function (s) { var o = document.createElement('option'); o.value = s; o.textContent = s; sel.appendChild(o); });
    var p = getProfile(); if (p && p.state) sel.value = p.state;
    function show() {
      var s = sel.value;
      if (!s) { out.innerHTML = ''; return; }
      var key = s.replace(' (Abuja)', '');
      var local = TRADES.filter(function (t) { return t.hubs && t.hubs.indexOf(key) !== -1; });
      out.innerHTML = '<div class="panel"><h3>Where to ask in ' + esc(s) + '</h3><ul class="tick-list" style="margin-top:10px">' +
        '<li>' + icon('check') + '<span>The <strong>NDE office</strong> in ' + esc(key) + ' for current apprenticeship and vocational intakes.</span></li>' +
        '<li>' + icon('check') + '<span>The state <strong>Ministry of Youth / Ministry of Labour</strong> and government skills acquisition centres.</span></li>' +
        '<li>' + icon('check') + '<span>Government <strong>technical colleges</strong> for NABTEB courses and trade test centres.</span></li>' +
        '<li>' + icon('check') + '<span>Trade associations and market unions (mechanics, tailors, hairdressers, electricians) who know masters taking apprentices.</span></li></ul>' +
        (local.length ? '<h3 style="margin-top:16px">Known clusters for these trades</h3><ul class="tick-list" style="margin-top:10px">' + local.map(function (t) { return '<li>' + icon('map') + '<span><a href="' + Rn.tradeUrl(t, ROOT) + '">' + esc(t.title) + '</a>: ' + esc(t.hubs) + '</span></li>'; }).join('') + '</ul>' : '') +
        '<p class="note" style="margin-top:12px">National programmes such as SUPA, TVET and 3MTT are open to applicants from every state, including the FCT.</p></div>';
    }
    sel.addEventListener('change', show);
    show();
  }

  /* ---------- Ask a trainer (AI coming soon) ---------- */
  function initAsk() {
    var fab = document.createElement('button');
    fab.type = 'button'; fab.className = 'ask-fab'; fab.setAttribute('aria-expanded', 'false'); fab.setAttribute('aria-controls', 'ask-panel');
    fab.innerHTML = icon('chat') + '<span>Ask a trainer</span>';
    fab.setAttribute('aria-label', 'Ask a trainer');
    var panel = document.createElement('section');
    panel.id = 'ask-panel'; panel.className = 'ask-panel'; panel.hidden = true; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Ask a trainer');
    panel.innerHTML =
      '<div class="ask-head"><div><strong>Ask a trainer</strong><span>Questions about trades, training and starting out</span></div><button type="button" class="icon-btn" id="ask-close" aria-label="Close">' + icon('close') + '</button></div>' +
      '<div class="ask-log" id="ask-log" aria-live="polite"><p class="bubble bot">Hello! Ask anything about learning a trade in Nigeria: how to choose a master, what tools to buy, or how long training takes.</p></div>' +
      '<div class="ask-suggest">' + ['How do I find a good master?', 'Which trade can I learn in 3 months?', 'How do I register for a trade test?'].map(function (q) { return '<button type="button">' + esc(q) + '</button>'; }).join('') + '</div>' +
      '<form class="ask-form" id="ask-form"><label class="visually-hidden" for="ask-input">Your question</label><textarea id="ask-input" rows="1" maxlength="600" placeholder="Type your question"></textarea>' +
      '<button type="submit" class="btn btn-primary" aria-label="Send">' + icon('send') + '</button></form>';
    document.body.appendChild(panel);
    document.body.appendChild(fab);
    var log = $('#ask-log'), input = $('#ask-input');
    function open(on) {
      panel.hidden = !on; fab.setAttribute('aria-expanded', String(on));
      if (on) input.focus(); else fab.focus();
    }
    fab.addEventListener('click', function () { open(panel.hidden); });
    $('#ask-close').addEventListener('click', function () { open(false); });
    panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') open(false); });
    $$('.ask-suggest button', panel).forEach(function (b) { b.addEventListener('click', function () { input.value = b.textContent; input.focus(); }); });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#ask-form').requestSubmit ? $('#ask-form').requestSubmit() : $('#ask-form').dispatchEvent(new Event('submit', { cancelable: true })); } });
    function bubble(cls, text) { var p = document.createElement('p'); p.className = 'bubble ' + cls; p.textContent = text; log.appendChild(p); log.scrollTop = log.scrollHeight; return p; }
    $('#ask-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var q = input.value.trim();
      if (!q) { input.focus(); return; }
      bubble('me', q); input.value = '';
      var ai = CFG.ai || {};
      if (!ai.enabled || !ai.endpoint) { bubble('bot soon', ai.comingSoonText || 'Feature coming soon.'); return; }
      if (navigator.onLine === false) { bubble('bot soon', 'You are offline. Connect to the internet to ask a trainer.'); return; }
      var waiting = bubble('bot', 'Thinking…');
      var p = getProfile();
      fetch(ai.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: q, context: { page: PAGE, trade: document.body.getAttribute('data-trade') || '', state: p ? p.state : '', interests: p ? p.interests : [] } }) })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (d) { waiting.textContent = d && d.answer ? d.answer : 'Sorry, no answer came back. Please try again.'; })
        .catch(function () { waiting.className = 'bubble bot soon'; waiting.textContent = 'The trainer could not be reached just now. Please try again later.'; });
    });
  }

  /* ---------- boot ---------- */
  function init() {
    initNav();
    initOffline();
    initSiteSearch();
    initCarousel();
    initDirectory();
    initTradePage();
    initTabs();
    initQuiz();
    initBuilder();
    initDashboard();
    initStates();
    initAsk();
    if (window.Scenes) Scenes.mountAll(document);
    syncSaveButtons();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
