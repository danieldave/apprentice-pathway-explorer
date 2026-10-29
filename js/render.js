/* Apprentice Pathways Explorer — shared markup helpers
   Used by the browser (app.js) and by tools/build.js, so static pages and live filters render identical cards. */
(function (global) {
  'use strict';
  var D = (typeof module !== 'undefined' && module.exports) ? require('./data.js') : global;

  var ICONS = {
    hammer: '<path d="M15 12l-8.5 8.5a2.1 2.1 0 0 1-3-3L12 9"/><path d="M17.6 15L22 10.6 13.4 2 9 6.4z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    close: '<path d="M18 6L6 18M6 6l12 12"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    play: '<path d="M7 4l13 8-13 8z"/>',
    pause: '<path d="M8 4v16M16 4v16"/>',
    prev: '<path d="M15 18l-6-6 6-6"/>',
    next: '<path d="M9 18l6-6-6-6"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
    send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
    map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    flag: '<path d="M5 21V4h11l-1 4 4 4H5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    wallet: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M16 13h2M3 10h18"/>',
    award: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14L7 22l5-3 5 3-1.5-8"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V4H3v13h5"/>',
    wifi: '<path d="M2 8a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r="1"/>'
  };
  function icon(name, cls) { return '<svg class="' + (cls || 'icon') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[name] || '') + '</svg>'; }

  function esc(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  var COST_SHORT = ['', 'Low', 'Medium', 'High'];

  function tradeUrl(t, root) { return (root || '') + 'trade/' + t.id + '.html'; }

  function cardHTML(t, root) {
    var cat = D.CATEGORIES[t.cat];
    return '<article class="card" data-id="' + t.id + '" data-cat="' + t.cat + '" data-group="' + cat.group + '" data-min="' + t.months[0] + '" data-cost="' + t.cost + '">' +
      '<a class="media" href="' + tradeUrl(t, root) + '" tabindex="-1" aria-hidden="true" data-scene-for="' + t.id + '"></a>' +
      '<div class="card-body">' +
        '<div class="card-meta"><span class="tag">' + esc(cat.label) + '</span>' + (t.months[0] <= 1 ? '<span class="tag tag-hi">1 month start</span>' : '') + '</div>' +
        '<h3><a href="' + tradeUrl(t, root) + '">' + esc(t.title) + '</a></h3>' +
        '<p>' + esc(t.summary) + '</p>' +
        '<dl class="card-facts"><div><dt>Training</dt><dd>' + esc(D.durationLabel(t.months)) + '</dd></div><div><dt>Start-up cost</dt><dd>' + COST_SHORT[t.cost] + '</dd></div></dl>' +
        '<div class="card-actions"><a class="btn-text" href="' + tradeUrl(t, root) + '">View pathway ' + icon('arrow') + '</a>' +
        '<button type="button" class="save-btn" data-save="' + t.id + '" aria-pressed="false" aria-label="Save ' + esc(t.title) + '">' + icon('bookmark') + '</button></div>' +
      '</div></article>';
  }

  /* Numbered steps: the first step to take, then every stage of the training path. */
  function pathHTML(t) {
    return '<ol class="path"><li class="first"><strong>First step</strong>' + esc(t.first) + '</li>' +
      t.path.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>';
  }

  var api = { ICONS: ICONS, icon: icon, esc: esc, cardHTML: cardHTML, pathHTML: pathHTML, tradeUrl: tradeUrl, COST_SHORT: COST_SHORT };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.Render = api;
})(typeof window !== 'undefined' ? window : globalThis);
