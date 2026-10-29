#!/usr/bin/env node
/* Apprentice Pathways Explorer — static page generator
   Usage:
     node tools/build.js                          builds the site into the project folder
     SITE_URL=https://yourdomain.com node tools/build.js   adds canonical links and a correct sitemap
     node tools/build.js --preview <folder>       builds a copy for a single-page preview host

   Edit trades in js/data.js, then run this again to refresh every page. */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '..');
const D = require(path.join(ROOT_DIR, 'js/data.js'));
const Rn = require(path.join(ROOT_DIR, 'js/render.js'));
global.TRADES = D.TRADES;
require(path.join(ROOT_DIR, 'js/scenes.js'));
const Scenes = globalThis.Scenes;

const args = process.argv.slice(2);
const previewIdx = args.indexOf('--preview');
const PREVIEW = previewIdx !== -1;
const OUT = PREVIEW ? path.resolve(args[previewIdx + 1]) : ROOT_DIR;
const SITE_URL = (process.env.SITE_URL || '').replace(/\/+$/, '');
const SITE_NAME = 'Apprentice Pathways Explorer';
const { esc, icon } = Rn;

const NAV = [
  ['index.html', 'Home', 'home'], ['trades.html', 'Trades', 'trades'], ['careers.html', 'Careers', 'careers'], ['skills.html', 'Talents / Skills', 'skills'],
  ['planner.html', 'Pathway Planner', 'planner'], ['opportunities.html', 'Opportunities', 'opportunities'], ['dashboard.html', 'My Dashboard', 'dashboard']
];

function link(root, href) {
  if (PREVIEW && href === 'index.html') return root ? root : './';
  if (PREVIEW && href.indexOf('index.html#') === 0) return (root || './') + href.slice('index.html'.length);
  return root + href;
}

function head({ title, description, root, pathName, jsonld, noindex }) {
  const canonical = SITE_URL && pathName !== null ? SITE_URL + '/' + (pathName === 'index.html' ? '' : pathName) : '';
  const ogImg = SITE_URL ? SITE_URL + '/icons/og-image.png' : root + 'icons/og-image.png';
  return `<!DOCTYPE html>
<html lang="en-NG">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="claude:viewport-fit-sides" content="cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}${canonical ? `<link rel="canonical" href="${canonical}">\n<meta property="og:url" content="${canonical}">\n` : ''}<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${ogImg}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#154536">
<link rel="manifest" href="${root}manifest.webmanifest">
<link rel="icon" href="${root}icons/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${root}icons/icon-192.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800&family=JetBrains+Mono:wght@500&family=Public+Sans:wght@400;600;700&display=swap">
<link rel="stylesheet" href="${root}css/style.css">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>\n` : ''}</head>
`;
}

function header(root, page) {
  const items = NAV.map(([href, label, key]) => `<li><a href="${link(root, href)}"${key === page ? ' aria-current="page"' : ''}>${label}</a></li>`).join('');
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-row">
    <a class="brand" href="${link(root, 'index.html')}" aria-label="${SITE_NAME} home">
      <span class="brand-mark">${icon('hammer')}</span>
      <span>Apprentice Pathways<small>Explorer · Nigeria</small></span>
    </a>
    <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">${icon('menu')}</button>
    <nav class="site-nav" id="site-nav" aria-label="Main">
      <ul class="nav-list">${items}</ul>
    </nav>
  </div>
</header>
`;
}

function footer(root) {
  const g = (key) => D.TRADES.filter((t) => D.groupOf(t) === key).length;
  return `<footer class="site-footer">
  <div class="wrap footer-grid">
    <div>
      <a class="brand" href="${link(root, 'index.html')}"><span>Apprentice Pathways<small>Explorer · Nigeria</small></span></a>
      <p>Free guides to ${D.TRADES.length} trades, careers and skills in Nigeria, with personal learning plans. Your profile and plans stay on your own device.</p>
    </div>
    <div>
      <h2>Explore</h2>
      <ul>
        <li><a href="${root}trades.html">Trades (${g('trades')})</a></li>
        <li><a href="${root}careers.html">Careers (${g('careers')})</a></li>
        <li><a href="${root}skills.html">Talents / Skills (${g('skills')})</a></li>
      </ul>
    </div>
    <div>
      <h2>Plan</h2>
      <ul>
        <li><a href="${root}planner.html">Pathway Finder</a></li>
        <li><a href="${root}planner.html#plan">Learning plan builder</a></li>
        <li><a href="${root}dashboard.html">My Dashboard</a></li>
      </ul>
    </div>
    <div>
      <h2>Get started</h2>
      <ul>
        <li><a href="${root}opportunities.html">Programmes &amp; trade tests</a></li>
        <li><a href="${root}opportunities.html#states">Help in your state</a></li>
        <li><a href="${root}opportunities.html#agreement">Apprenticeship checklist</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-base"><div class="wrap">© <span id="year">2026</span> ${SITE_NAME}. Training times are typical ranges; masters and centres vary. Check programme details on official websites before you apply.</div></div>
</footer>
`;
}

function scripts(root, page, extra) {
  const pre = PREVIEW && page === 'home' ? `<script>document.body.setAttribute('data-page','home');document.body.setAttribute('data-root','');</script>\n` : '';
  return `${pre}<script src="${root}js/data.js"></script>
<script src="${root}js/render.js"></script>
<script src="${root}js/scenes.js"></script>
<script src="${root}js/config.js"></script>
<script src="${root}js/app.js"></script>
${extra || ''}</body>
</html>
`;
}

function page({ file, title, description, page, root = '', main, jsonld, bodyAttrs = '', noindex }) {
  let html = head({ title, description, root, pathName: noindex ? null : file, jsonld, noindex }) +
    `<body data-page="${page}" data-root="${root}"${bodyAttrs}>\n` + header(root, page) + `<main id="main">\n${main}\n</main>\n` + footer(root) + scripts(root, page);
  if (PREVIEW && file === 'index.html') {
    // single-page preview hosts wrap the main file themselves: keep only the head bits and the body content
    html = html.replace(/<!DOCTYPE html>\n<html lang="en-NG">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport"[^>]*>\n/, '')
      .replace('</head>\n', '').replace(/<body[^>]*>\n/, '').replace('</body>\n</html>\n', '');
  }
  const out = path.join(OUT, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  return file;
}

const written = [];
const byGroup = (g) => D.TRADES.filter((t) => D.groupOf(t) === g);
const sample = (id) => D.TRADES.find((t) => t.id === id);

/* ---------------- HOME ---------------- */
const shortOnes = D.TRADES.filter((t) => t.months[0] <= 1).sort((a, b) => a.title.localeCompare(b.title));
written.push(page({
  file: 'index.html', page: 'home',
  title: `${SITE_NAME} | Trades, careers & apprenticeships in Nigeria`,
  description: `Explore ${D.TRADES.length} trades, careers and skills in Nigeria. See training paths, years required, skills and the first step to take, then build a free personal learning plan.`,
  jsonld: { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, description: 'Apprenticeship and trade pathways in Nigeria', inLanguage: 'en-NG' },
  main: `
  <section class="mat hero">
    <div class="wrap hero-grid">
      <div>
        <p class="eyebrow">Learn it · Master it · Earn your freedom</p>
        <h1>Find your trade. <em>Plan</em> your path.</h1>
        <p class="lead">Explore ${D.TRADES.length} trades, careers and creative skills across Nigeria. See how long training takes, the skills you will learn, and the very first step to take, then get a learning plan made for you.</p>
        <div class="search">
          <label class="search-field" for="site-search">${icon('search')}<span class="visually-hidden">Search trades</span>
            <input id="site-search" type="search" placeholder="Search: tailoring, solar, welding, baking…" autocomplete="off" aria-controls="site-search-results" aria-expanded="false">
          </label>
          <ul class="search-results" id="site-search-results" hidden></ul>
        </div>
        <div class="hero-actions">
          <a class="btn btn-primary" href="planner.html">Take the Pathway Finder ${icon('arrow')}</a>
          <a class="btn btn-ghost" href="planner.html#plan">Build a learning plan</a>
        </div>
        <p class="hero-stats"><span><strong>${D.TRADES.length}</strong> pathways</span><span><strong>${Object.keys(D.CATEGORIES).length}</strong> categories</span><span><strong>36</strong> states + FCT</span><span><strong>Free</strong>, no sign-up</span></p>
      </div>
      <div class="stage" aria-roledescription="carousel" aria-label="Trades in action">
        <div class="stage-view" id="stage-view"></div>
        <div class="stage-progress" id="stage-progress"><span></span></div>
        <div class="stage-caption">
          <div><h2 id="stage-title">Trades in action</h2><p id="stage-meta">A new trade every 5 seconds</p></div>
          <div class="stage-controls">
            <button type="button" class="icon-btn" id="stage-prev" aria-label="Previous trade">${icon('prev')}</button>
            <button type="button" class="icon-btn" id="stage-toggle" aria-label="Pause slideshow">${icon('pause')}</button>
            <button type="button" class="icon-btn" id="stage-next" aria-label="Next trade">${icon('next')}</button>
            <a class="btn btn-primary btn-sm" id="stage-link" href="trades.html">See pathway</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="groups-title">
    <div class="wrap">
      <div class="section-head"><div><p class="eyebrow">Explore</p><h2 id="groups-title">Choose where to start</h2></div></div>
      <div class="group-grid">
        ${[['careers', 'software-dev'], ['skills', 'fashion-design'], ['trades', 'auto-mechanic']].map(([g, s]) => `
        <a class="group-card" href="${D.GROUPS[g].page}">
          <div class="media" data-scene-for="${s}"></div>
          <div class="group-body"><h3>${D.GROUPS[g].label}</h3><p>${esc(D.GROUPS[g].blurb)}</p><span class="go">See ${byGroup(g).length} pathways ${icon('arrow')}</span></div>
        </a>`).join('')}
      </div>
    </div>
  </section>

  <section class="section band" aria-labelledby="cats-title">
    <div class="wrap">
      <div class="section-head"><div><p class="eyebrow">Browse</p><h2 id="cats-title">All ${Object.keys(D.CATEGORIES).length} categories</h2></div></div>
      <div class="cat-grid">
        ${Object.keys(D.CATEGORIES).map((c) => `<a class="cat-link" href="${D.GROUPS[D.CATEGORIES[c].group].page}#cat-${c}"><span>${esc(D.CATEGORIES[c].label)}</span><span class="count">${D.TRADES.filter((t) => t.cat === c).length}</span></a>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="how-title">
    <div class="wrap">
      <div class="section-head"><div><p class="eyebrow">The journey</p><h2 id="how-title">How an apprenticeship works</h2><p>Every pathway on this site follows the same five stages, from your first choice to the day your master gives you your freedom.</p></div></div>
      <ol class="steps">${D.JOURNEY.map((s) => `<li><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('')}</ol>
    </div>
  </section>

  <section class="section band" aria-labelledby="short-title">
    <div class="wrap">
      <div class="section-head"><div><p class="eyebrow">Start fast</p><h2 id="short-title">Skills you can start in about a month</h2><p>Short courses that can start bringing income quickly. Build a 1-month plan for any of them.</p></div></div>
      <div class="card-grid">${shortOnes.slice(0, 8).map((t) => Rn.cardHTML(t, '')).join('')}</div>
    </div>
  </section>

  <section class="section" aria-labelledby="plan-title">
    <div class="wrap two-col" style="align-items:center">
      <div>
        <p class="eyebrow" style="color:var(--good)">Pathway Planner</p>
        <h2 id="plan-title" class="display" style="font-size:clamp(1.9rem,4.5vw,2.8rem)">Your own learning plan, step by step</h2>
        <p class="lead" style="color:var(--muted)">Answer six quick questions and get your best-matched trades with the numbered steps to follow. Then choose how long you can train, from 1 month to 3 years, and get dated steps you can tick off as you go.</p>
        <div class="hero-actions"><a class="btn btn-dark" href="planner.html">Start the Pathway Finder</a><a class="btn btn-ghost" href="dashboard.html">Open my dashboard</a></div>
      </div>
      <ul class="tick-list panel">
        <li>${icon('check')}<span><strong>No sign-up needed.</strong> Save a profile without giving your name, phone number or email.</span></li>
        <li>${icon('check')}<span><strong>Works offline.</strong> Plans and pages you have opened stay available without data.</span></li>
        <li>${icon('check')}<span><strong>Track progress.</strong> Tick off each step and see what comes next.</span></li>
        <li>${icon('check')}<span><strong>Move devices.</strong> Copy a backup code and restore your plans on another phone.</span></li>
      </ul>
    </div>
  </section>

  <section class="section band" aria-labelledby="opp-title">
    <div class="wrap">
      <div class="section-head"><div><p class="eyebrow">Opportunities</p><h2 id="opp-title">Programmes &amp; certification</h2><p>National training programmes, trade tests and certificates that help apprentices get recognised.</p></div><a class="btn btn-ghost" href="opportunities.html">See all opportunities ${icon('arrow')}</a></div>
      <div class="opp-grid">${D.OPPORTUNITIES.slice(0, 3).map(oppCard).join('')}</div>
    </div>
  </section>`
}));

function oppCard(o) {
  return `<article class="opp"><p class="by">${esc(o.by)}</p><h3>${esc(o.name)}</h3><dl><div><dt>What it is</dt><dd>${esc(o.what)}</dd></div><div><dt>What you get</dt><dd>${esc(o.gets)}</dd></div><div><dt>Who can apply</dt><dd>${esc(o.who)}</dd></div></dl><a class="btn-text" href="${o.url}" target="_blank" rel="noopener">Official website ${icon('arrow')}</a></article>`;
}

/* ---------------- GROUP DIRECTORIES ---------------- */
for (const g of ['trades', 'careers', 'skills']) {
  const list = byGroup(g).sort((a, b) => a.title.localeCompare(b.title));
  const cats = Object.keys(D.CATEGORIES).filter((c) => D.CATEGORIES[c].group === g);
  const label = D.GROUPS[g].label;
  written.push(page({
    file: D.GROUPS[g].page, page: g,
    title: `${label} in Nigeria: ${list.length} apprenticeship pathways | ${SITE_NAME}`,
    description: `${D.GROUPS[g].blurb} Compare ${list.length} ${label.toLowerCase()} pathways in Nigeria by training time, start-up cost and skills.`,
    jsonld: { '@context': 'https://schema.org', '@type': 'ItemList', name: `${label} pathways in Nigeria`, numberOfItems: list.length, itemListElement: list.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.title, url: SITE_URL ? `${SITE_URL}/trade/${t.id}.html` : `trade/${t.id}.html` })) },
    main: `
  <section class="mat page-head">
    <div class="wrap">
      <p class="crumbs"><a href="${link('', 'index.html')}">Home</a><span>/</span><span>${label}</span></p>
      <h1>${label}</h1>
      <p class="lead">${esc(D.GROUPS[g].blurb)} ${list.length} pathways, each with its training path, skills, years required and first step.</p>
    </div>
  </section>
  <section class="section">
    <div class="wrap">
      <div class="toolbar">
        <div class="toolbar-row">
          <label class="search-field" for="dir-search">${icon('search')}<span class="visually-hidden">Search ${label}</span><input id="dir-search" type="search" placeholder="Search ${label.toLowerCase()}" autocomplete="off"></label>
          <label class="visually-hidden" for="f-length">Training length</label>
          <select class="select" id="f-length"><option value="0">Any training length</option><option value="1">Start in 1 month</option><option value="3">Up to 3 months</option><option value="12">Up to 1 year</option><option value="24">Up to 2 years</option></select>
          <label class="visually-hidden" for="f-cost">Start-up cost</label>
          <select class="select" id="f-cost"><option value="0">Any start-up cost</option><option value="1">Low cost only</option><option value="2">Low or medium</option></select>
          <label class="visually-hidden" for="f-sort">Sort</label>
          <select class="select" id="f-sort"><option value="az">Sort: A–Z</option><option value="short">Sort: shortest training</option><option value="cost">Sort: lowest cost</option></select>
        </div>
        <div class="chips" role="group" aria-label="Filter by category">
          <button type="button" class="chip" data-filter-cat="all" aria-pressed="true">All</button>
          ${cats.map((c) => `<button type="button" class="chip" data-filter-cat="${c}" aria-pressed="false">${esc(D.CATEGORIES[c].label)}</button>`).join('\n          ')}
        </div>
        <div class="toolbar-row" style="justify-content:space-between"><p class="result-count" id="result-count" aria-live="polite">Showing ${list.length} of ${list.length} pathways</p><button type="button" class="btn-text" id="dir-reset">Clear filters</button></div>
      </div>
      <div class="card-grid" id="card-grid">${list.map((t) => Rn.cardHTML(t, '')).join('\n')}</div>
      <p class="empty-state" id="dir-empty" hidden>No pathways match those filters. Try “Clear filters”.</p>
    </div>
  </section>`
  }));
}

/* ---------------- TRADE PAGES ---------------- */
for (const t of D.TRADES) {
  const cat = D.CATEGORIES[t.cat], grp = D.GROUPS[cat.group];
  const related = D.TRADES.filter((x) => x.cat === t.cat && x.id !== t.id).slice(0, 4);
  const yrs = D.durationLabel(t.months);
  written.push(page({
    file: `trade/${t.id}.html`, page: cat.group, root: '../', bodyAttrs: ` data-trade="${t.id}"`,
    title: `${t.title}: training path, skills & years required in Nigeria | ${SITE_NAME}`,
    description: `How to become a ${t.title.toLowerCase()} professional in Nigeria. ${t.summary} Typical training: ${yrs}.`,
    jsonld: [
      { '@context': 'https://schema.org', '@type': 'Occupation', name: t.title, description: t.summary, skills: t.skills.join(', '), occupationalCategory: cat.label, occupationLocation: { '@type': 'Country', name: 'Nigeria' }, educationRequirements: `Apprenticeship or vocational training, typically ${yrs}. ${cat.route}` },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL ? SITE_URL + '/' : undefined }, { '@type': 'ListItem', position: 2, name: grp.label, item: SITE_URL ? `${SITE_URL}/${grp.page}` : undefined }, { '@type': 'ListItem', position: 3, name: t.title }] }
    ],
    main: `
  <section class="mat page-head">
    <div class="wrap">
      <p class="crumbs"><a href="${link('../', 'index.html')}">Home</a><span>/</span><a href="../${grp.page}">${grp.label}</a><span>/</span><a href="../${grp.page}#cat-${t.cat}">${esc(cat.label)}</a></p>
      <h1>${esc(t.title)}</h1>
      <p class="lead">${esc(t.summary)}</p>
    </div>
  </section>
  <section class="section">
    <div class="wrap trade-grid">
      <figure class="trade-figure" style="margin:0">
        <div class="media">${Scenes.render(t)}</div>
        <div class="facts">
          <div class="fact"><span>${icon('clock')} Years required</span><strong>${esc(yrs)}</strong></div>
          <div class="fact"><span>Category</span><strong>${esc(cat.label)}</strong></div>
          <div class="fact"><span>${icon('wallet')} Start-up cost</span><strong>${Rn.COST_SHORT[t.cost]}</strong></div>
          <div class="fact"><span>Work setting</span><strong>${{ indoor: 'Indoors', outdoor: 'Outdoors / on site', mixed: 'Indoors and on site' }[t.setting]}</strong></div>
        </div>
      </figure>
      <div class="trade-body">
        <div class="first-step"><p class="eyebrow">${icon('flag')} Your first step</p><p>${esc(t.first)}</p></div>
        <div><h2>Summary of the work</h2><p class="summary">${esc(t.summary)}</p>${t.hubs ? `<p class="note" style="margin-top:8px">${icon('map')} Known clusters: ${esc(t.hubs)}.</p>` : ''}</div>
        <div><h2>Skills training</h2><ul class="skill-list">${t.skills.map((s) => `<li>${icon('check')}<span>${esc(s)}</span></li>`).join('')}</ul></div>
        <div><h2>Training path, step by step</h2>${Rn.pathHTML(t)}</div>
        <div><h2>${icon('award')} Certification</h2><p>${esc(cat.route)}</p></div>
        <div class="row-actions">
          <a class="btn btn-primary" href="../planner.html#t-${t.id}">Build my learning plan ${icon('arrow')}</a>
          <button type="button" class="btn btn-ghost" data-save="${t.id}">${icon('bookmark')} Save this trade</button>
          <button type="button" class="btn btn-ghost" id="share-link">${icon('copy')} Copy link</button>
        </div>
        <label class="visually-hidden" for="share-box">Link to this page</label><input class="select" id="share-box" hidden readonly>
      </div>
    </div>
  </section>
  ${related.length ? `<section class="section band" aria-labelledby="rel-title">
    <div class="wrap">
      <div class="section-head"><div><p class="eyebrow">Related</p><h2 id="rel-title">More in ${esc(cat.label)}</h2></div></div>
      <div class="card-grid">${related.map((r) => Rn.cardHTML(r, '../')).join('')}</div>
    </div>
  </section>` : ''}`
  }));
}

/* ---------------- PLANNER ---------------- */
written.push(page({
  file: 'planner.html', page: 'planner',
  title: `Pathway Planner: career quiz & personal learning plan | ${SITE_NAME}`,
  description: 'Take a free career quiz to find the trades that suit you in Nigeria, then build a personal step-by-step learning plan from 1 month to 3 years.',
  main: `
  <section class="mat page-head">
    <div class="wrap">
      <p class="crumbs"><a href="${link('', 'index.html')}">Home</a><span>/</span><span>Pathway Planner</span></p>
      <h1>Plan your path</h1>
      <p class="lead">Find the trades that suit you, then turn your choice into a dated plan with numbered steps you can tick off.</p>
    </div>
  </section>
  <section class="section">
    <div class="wrap">
      <div class="tabs" role="tablist" aria-label="Planner tools">
        <button type="button" class="tab" role="tab" id="tab-quiz" data-tab="quiz" aria-controls="panel-quiz" aria-selected="true">1. Pathway Finder quiz</button>
        <button type="button" class="tab" role="tab" id="tab-plan" data-tab="plan" aria-controls="panel-plan" aria-selected="false" tabindex="-1">2. Learning plan builder</button>
      </div>
      <div id="panel-quiz" role="tabpanel" aria-labelledby="tab-quiz">
        <div class="quiz panel" id="quiz-body"><p class="note">Loading the quiz…</p></div>
        <div id="quiz-results" hidden></div>
      </div>
      <div id="panel-plan" role="tabpanel" aria-labelledby="tab-plan" hidden>
        <form class="panel" id="plan-form" novalidate>
          <h2>Build a learning plan</h2>
          <div class="form-grid">
            <div class="field full"><label for="p-trade">Trade or course</label><select id="p-trade"><option value="">Choose a trade or course</option></select><span class="hint" id="p-trade-hint"></span></div>
            <div class="field"><label for="p-months">How long can you train?</label>
              <select id="p-months"><option value="typical">The typical time for this trade</option><option value="1">1 month</option><option value="3">3 months</option><option value="6">6 months</option><option value="12">1 year</option><option value="24">2 years</option><option value="36">3 years</option></select></div>
            <div class="field"><label for="p-hours">Hours of practice per training day</label>
              <select id="p-hours"><option value="2">About 2 hours (part-time)</option><option value="4">About 4 hours</option><option value="6" selected>About 6 hours</option><option value="8">About 8 hours (full-time)</option></select></div>
            <div class="field"><label for="p-start">Start date</label><input type="date" id="p-start"></div>
          </div>
          <p class="err" id="plan-err" role="alert"></p>
          <div class="row-actions"><button type="submit" class="btn btn-dark">Create my plan</button><span class="note">Nothing is sent anywhere. Plans are saved on this device.</span></div>
        </form>
        <div id="plan-out" style="margin-top:24px" hidden></div>
      </div>
    </div>
  </section>`
}));

/* ---------------- OPPORTUNITIES ---------------- */
written.push(page({
  file: 'opportunities.html', page: 'opportunities',
  title: `Apprenticeship programmes, trade tests & certificates in Nigeria | ${SITE_NAME}`,
  description: 'National apprenticeship and skills programmes in Nigeria (SUPA, TVET, 3MTT, NDE), trade tests, NABTEB and NSQ certificates, and where to get help in every state and the FCT.',
  main: `
  <section class="mat page-head">
    <div class="wrap">
      <p class="crumbs"><a href="${link('', 'index.html')}">Home</a><span>/</span><span>Opportunities</span></p>
      <h1>Opportunities</h1>
      <p class="lead">Programmes, certificates and local help for apprentices in all 36 states and the FCT.</p>
    </div>
  </section>
  <section class="section">
    <div class="wrap">
      <div class="section-head"><div><p class="eyebrow">National</p><h2>Programmes &amp; certificates</h2></div></div>
      <p class="callout" style="margin-bottom:20px"><strong>Check before you apply.</strong> Intakes, stipends and rules change often. Confirm details on the official website (addresses end in .gov.ng). Government programmes do not ask you to pay agents to apply. Information last checked: October 2026.</p>
      <div class="opp-grid">${D.OPPORTUNITIES.map(oppCard).join('')}</div>
    </div>
  </section>
  <section class="section band" id="states" aria-labelledby="states-title">
    <div class="wrap two-col">
      <div>
        <p class="eyebrow" style="color:var(--good)">Local help</p>
        <h2 id="states-title" class="display" style="font-size:clamp(1.9rem,4.5vw,2.6rem)">Find help in your state</h2>
        <p class="note" style="margin-top:8px">Choose your state to see where to ask about apprenticeships, and any trade clusters near you.</p>
        <div class="field" style="margin-top:16px;max-width:360px"><label for="state-select">Your state</label><select id="state-select"><option value="">Choose a state</option></select></div>
      </div>
      <div id="state-result" class="state-result" aria-live="polite"></div>
    </div>
  </section>
  <section class="section" aria-labelledby="routes-title">
    <div class="wrap two-col">
      <div>
        <p class="eyebrow" style="color:var(--good)">Traditional routes</p>
        <h2 id="routes-title" class="display" style="font-size:clamp(1.9rem,4.5vw,2.6rem)">Learning under a master</h2>
        <ul class="tick-list" style="margin-top:16px">
          <li>${icon('check')}<span><strong>Master apprenticeship.</strong> Most Nigerian artisans learn under a master (oga) in a workshop, then receive their “freedom” when they are ready to work alone.</span></li>
          <li>${icon('check')}<span><strong>Igba Boi (Igbo apprenticeship system).</strong> An apprentice serves a business owner for an agreed period and is then set up with capital or stock to start their own business.</span></li>
          <li>${icon('check')}<span><strong>Skills acquisition centres.</strong> State and local governments, churches, mosques and NGOs run centres with short practical courses.</span></li>
          <li>${icon('check')}<span><strong>Technical colleges.</strong> Government technical colleges teach trades and prepare students for NABTEB exams.</span></li>
        </ul>
      </div>
      <div class="panel" id="agreement">
        <h2>Apprenticeship agreement checklist</h2>
        <p class="note" style="margin-bottom:12px">Agree these in writing before you start, with a parent or guarantor present.</p>
        <ul class="tick-list">
          <li>${icon('check')}<span>Names of the master, the apprentice and a guarantor</span></li>
          <li>${icon('check')}<span>Start date and length of training</span></li>
          <li>${icon('check')}<span>Training fee, how it is paid, and what happens if training ends early</span></li>
          <li>${icon('check')}<span>Working days and hours, and any feeding or transport support</span></li>
          <li>${icon('check')}<span>When you will sit a trade test or certificate exam</span></li>
          <li>${icon('check')}<span>What the freedom ceremony includes, and whether tools are given</span></li>
          <li>${icon('check')}<span>Signatures of everyone, with a copy for each person</span></li>
        </ul>
      </div>
    </div>
  </section>`
}));

/* ---------------- DASHBOARD ---------------- */
written.push(page({
  file: 'dashboard.html', page: 'dashboard',
  title: `My Dashboard | ${SITE_NAME}`,
  description: 'Your saved trades, learning plans and progress. Stored privately on your own device.',
  noindex: true,
  main: `
  <section class="mat page-head">
    <div class="wrap">
      <p class="crumbs"><a href="${link('', 'index.html')}">Home</a><span>/</span><span>My Dashboard</span></p>
      <h1>My Dashboard</h1>
      <p class="lead">Your profile, plans and progress. Everything is stored on this device only. No name, phone number or email needed.</p>
    </div>
  </section>
  <section class="section" id="dash">
    <div class="wrap dash-grid">
      <div class="dash-side">
        <div class="panel">
          <div class="profile-top"><div class="avatar" id="pf-avatar">A</div><div><strong id="pf-name">Guest apprentice</strong><span class="profile-id" id="pf-id"></span></div></div>
          <form id="profile-form" novalidate>
            <div class="form-grid" style="grid-template-columns:minmax(0,1fr)">
              <div class="field"><label for="pf-nick">Nickname <span class="note">(optional)</span></label><input id="pf-nick" type="text" maxlength="30" autocomplete="nickname" placeholder="Any name you like"><span class="err" id="pf-err"></span></div>
              <div class="field"><span class="label">Avatar colour</span><div class="swatches" id="pf-swatches"></div></div>
              <div class="field"><label for="pf-state">State <span class="note">(optional)</span></label><select id="pf-state"><option value="">Prefer not to say</option></select></div>
              <div class="field"><label for="pf-goal">Main goal <span class="note">(optional)</span></label><select id="pf-goal"><option value="">Not sure yet</option><option value="business">Own my shop or business</option><option value="job">Get a paid job</option><option value="freelance">Freelance or remote work</option></select></div>
              <div class="field"><span class="label">Interests <span class="note">(optional)</span></span><div class="chips" id="pf-ints"></div></div>
            </div>
            <div class="row-actions" style="margin-top:16px"><button type="submit" class="btn btn-dark">Save profile</button></div>
          </form>
        </div>
        <div class="panel">
          <h2>Move to another device</h2>
          <p class="note">Make a backup code, then paste it on your new phone or computer to restore your profile and plans.</p>
          <div class="row-actions" style="margin-top:12px"><button type="button" class="btn btn-ghost" id="bk-make">${icon('copy')} Copy backup code</button></div>
          <label class="visually-hidden" for="bk-code">Your backup code</label><textarea class="select" id="bk-code" rows="3" readonly hidden style="width:100%;margin-top:10px;padding:10px"></textarea>
          <div class="field" style="margin-top:14px"><label for="bk-input">Restore from a backup code</label><textarea id="bk-input" rows="3" placeholder="Paste your backup code here"></textarea><span class="err" id="bk-err" role="alert"></span></div>
          <button type="button" class="btn btn-ghost" id="bk-restore">Restore</button>
        </div>
        <div class="panel">
          <h2>Your data</h2>
          <p class="note">Clear your profile, saved trades and plans from this device.</p>
          <div class="confirm"><button type="button" class="btn btn-danger" id="clear-all">${icon('trash')} Clear my data</button></div>
          <div class="confirm" id="clear-confirm" hidden><span>Delete everything on this device?</span><button type="button" class="btn btn-danger btn-sm" id="clear-yes">Yes, delete</button><button type="button" class="btn btn-ghost btn-sm" id="clear-no">Cancel</button></div>
        </div>
      </div>
      <div class="dash-main">
        <div class="stats">
          <div class="stat"><strong id="st-saved">0</strong><span>Saved trades</span></div>
          <div class="stat"><strong id="st-plans">0</strong><span>Learning plans</span></div>
          <div class="stat"><strong id="st-steps">0/0</strong><span>Steps done</span></div>
        </div>
        <div class="panel" id="plans"><div class="section-head" style="margin-bottom:12px"><h2 style="margin:0">My learning plans</h2><a class="btn btn-ghost btn-sm" href="planner.html#plan">New plan</a></div><div id="dash-plans" style="display:grid;gap:12px"></div></div>
        <div class="panel"><h2>Saved trades</h2><div id="dash-saved"></div></div>
        <div class="two-col">
          <div class="panel"><h2>Pathway Finder</h2><div id="dash-quiz"></div></div>
          <div class="panel"><h2>Recently viewed</h2><div id="dash-recent"></div></div>
        </div>
      </div>
    </div>
  </section>`
}));

/* ---------------- OFFLINE & 404 ---------------- */
written.push(page({
  file: 'offline.html', page: 'offline', noindex: true,
  title: `You are offline | ${SITE_NAME}`, description: 'This page is not saved for offline use yet.',
  main: `<section class="section"><div class="wrap" style="max-width:640px"><h1 class="display" style="font-size:2.6rem">You are offline</h1><p class="lead" style="color:var(--muted)">This page has not been saved on your device yet. Pages you opened before, and your dashboard, still work.</p><div class="hero-actions"><a class="btn btn-dark" href="dashboard.html">Open my dashboard</a><a class="btn btn-ghost" href="${link('', 'index.html')}">Home</a></div></div></section>`
}));
if (!PREVIEW) {
  written.push(page({
    file: '404.html', page: 'notfound', root: '/', noindex: true,
    title: `Page not found | ${SITE_NAME}`, description: 'This page does not exist.',
    main: `<section class="section"><div class="wrap" style="max-width:640px"><h1 class="display" style="font-size:2.6rem">Page not found</h1><p class="lead" style="color:var(--muted)">The page you asked for is not here. It may have moved.</p><div class="hero-actions"><a class="btn btn-dark" href="/">Go to the home page</a><a class="btn btn-ghost" href="/trades.html">Browse trades</a></div></div></section>`
  }));
}

/* ---------------- SEO files, manifest, service worker ---------------- */
const base = SITE_URL || 'https://www.example.com';
const indexable = written.filter((f) => !['dashboard.html', 'offline.html', '404.html'].includes(f));
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<!-- ${SITE_URL ? '' : 'Replace https://www.example.com with your real domain, or rebuild with SITE_URL=https://yourdomain node tools/build.js'} -->\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.map((f) => `  <url><loc>${base}/${f === 'index.html' ? '' : f}</loc><changefreq>monthly</changefreq><priority>${f === 'index.html' ? '1.0' : f.startsWith('trade/') ? '0.7' : '0.8'}</priority></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /dashboard.html\n\nSitemap: ${base}/sitemap.xml\n`);
fs.writeFileSync(path.join(OUT, 'manifest.webmanifest'), JSON.stringify({
  name: SITE_NAME, short_name: 'Pathways', description: 'Trades, careers and apprenticeship pathways in Nigeria, with personal learning plans.',
  start_url: './index.html', scope: './', display: 'standalone', background_color: '#f2f5f1', theme_color: '#154536', lang: 'en-NG',
  icons: [{ src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }, { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }, { src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml' }]
}, null, 2));

const assets = ['css/style.css', 'js/data.js', 'js/render.js', 'js/scenes.js', 'js/config.js', 'js/app.js', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png'];
// Core pages are saved for offline use straight away; each trade page is saved the first time it is opened.
const precache = ['./'].concat(written.filter((f) => f !== '404.html' && !f.startsWith('trade/')), assets);
const hash = crypto.createHash('sha1');
for (const f of written.concat(assets)) { const p = path.join(fs.existsSync(path.join(OUT, f)) ? OUT : ROOT_DIR, f); if (fs.existsSync(p)) hash.update(fs.readFileSync(p)); }
const version = hash.digest('hex').slice(0, 10);
fs.writeFileSync(path.join(OUT, 'sw.js'), `/* Apprentice Pathways Explorer — offline support (generated by tools/build.js) */
const CACHE = 'ape-${version}';
const PRECACHE = ${JSON.stringify(precache, null, 0)};

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Never cache the AI endpoint
  if (url.pathname.startsWith('/api/')) return;
  if (req.mode === 'navigate') {
    // Pages: try the network first so content stays fresh, fall back to the saved copy
    event.respondWith(fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then((hit) => hit || caches.match('offline.html'))));
    return;
  }
  // Files and fonts: use the saved copy, refresh it in the background
  event.respondWith(caches.match(req).then((hit) => {
    const net = fetch(req).then((res) => {
      if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => hit);
    return hit || net;
  }));
});
`);

/* copy static assets when building a preview copy */
if (PREVIEW) {
  for (const dir of ['css', 'js', 'icons']) {
    fs.mkdirSync(path.join(OUT, dir), { recursive: true });
    for (const f of fs.readdirSync(path.join(ROOT_DIR, dir))) fs.copyFileSync(path.join(ROOT_DIR, dir, f), path.join(OUT, dir, f));
  }
}

console.log(`Built ${written.length} pages into ${OUT}${SITE_URL ? ' for ' + SITE_URL : ''} (cache ${version})`);
