/* Apprentice Pathways Explorer — animated trade scenes
   Every trade gets a small SVG illustration (about 3–6 KB) animated with CSS only.
   A scene = background + prop (the work) + worker (with a tool and an action) + effects. */
(function (global) {
  'use strict';

  /* ---------- tiny SVG helpers ---------- */
  function A(cls, ox, oy, dur, delay) {
    var s = 'transform-origin:' + ox + 'px ' + oy + 'px;';
    if (dur) s += 'animation-duration:' + dur + 's;';
    if (delay) s += 'animation-delay:' + delay + 's;';
    return ' class="' + cls + '" style="' + s + '"';
  }
  function R(x, y, w, h, fill, rx, extra) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"' + (rx ? ' rx="' + rx + '"' : '') + ' fill="' + fill + '"' + (extra || '') + '/>'; }
  function C(cx, cy, r, fill, extra) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '"' + (extra || '') + '/>'; }
  function E(cx, cy, rx, ry, fill, extra) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + fill + '"' + (extra || '') + '/>'; }
  function P(d, fill, extra) { return '<path d="' + d + '" fill="' + fill + '"' + (extra || '') + '/>'; }
  function L(x1, y1, x2, y2, stroke, w, extra) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + stroke + '" stroke-width="' + w + '" stroke-linecap="round"' + (extra || '') + '/>'; }
  function S(d, stroke, w, extra) { return '<path d="' + d + '" fill="none" stroke="' + stroke + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (extra || '') + '/>'; }
  function G(inner, attrs) { return '<g' + (attrs || '') + '>' + inner + '</g>'; }
  function nest(x, y, w, h, inner, cls) {
    var svg = '<svg x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" overflow="visible">' + inner + '</svg>';
    return cls ? '<g class="' + cls + '">' + svg + '</g>' : svg;
  }
  function T(x, y, txt, size, fill, extra) { return '<text x="' + x + '" y="' + y + '" font-size="' + size + '" font-family="Arial, sans-serif" font-weight="700" fill="' + fill + '"' + (extra || '') + '>' + txt + '</text>'; }
  function rep(n, fn) { var s = ''; for (var i = 0; i < n; i++) s += fn(i); return s; }
  function shade(hex, amt) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.max(0, Math.min(255, (n >> 16) + amt));
    var g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
    var b = Math.max(0, Math.min(255, (n & 255) + amt));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  function wheel(cx, cy, r, spin) {
    var spokes = G(L(cx - r * 0.5, cy, cx + r * 0.5, cy, '#8b9399', 2) + L(cx, cy - r * 0.5, cx, cy + r * 0.5, '#8b9399', 2), spin ? A('a-spin', cx, cy, 0.8) : '');
    return C(cx, cy, r, '#1f2326') + C(cx, cy, r * 0.5, '#c9cfd3') + spokes + C(cx, cy, r * 0.15, '#6b7378');
  }
  function bench(y, top) { return R(166, y, 148, 7, top || '#8f6a4a', 2) + R(172, y + 7, 6, 172 - y, shade(top || '#8f6a4a', -30)) + R(300, y + 7, 6, 172 - y, shade(top || '#8f6a4a', -30)); }

  /* ---------- backgrounds (320 × 200) ---------- */
  var FLOOR = 168;
  var BG = {
    garage: function () {
      return R(0, 0, 320, FLOOR, '#d9dfdc') + R(10, 18, 120, 150, '#bcc6c2') + rep(18, function (i) { return L(10, 24 + i * 8, 130, 24 + i * 8, '#aab5b1', 1.2); }) +
        R(150, 14, 150, 18, '#1d5a46', 3) + R(156, 20, 60, 6, '#f4c430', 2) +
        R(0, FLOOR, 320, 32, '#62686a') + E(120, 186, 30, 4, '#555b5d') +
        C(26, 150, 14, '#2a2e31') + C(26, 150, 6, '#55595c') + C(26, 126, 14, '#2a2e31') + C(26, 126, 6, '#55595c');
    },
    site: function () {
      return R(0, 0, 320, FLOOR, '#cfe8f3') + G(rep(8, function (i) { return L(290, 30, 290 + 22 * Math.cos(i * 0.785), 30 + 22 * Math.sin(i * 0.785), '#ffd166', 3); }), A('a-spin', 290, 30, 12)) + C(290, 30, 12, '#ffd166') +
        L(40, 168, 40, 26, '#e0a100', 4) + L(40, 30, 130, 30, '#e0a100', 4) + L(40, 30, 64, 50, '#e0a100', 2) + L(120, 30, 120, 56, '#6b7378', 1.5) + R(112, 56, 16, 8, '#6b7378') +
        R(0, FLOOR, 320, 32, '#c7a26b') + R(8, 152, 30, 16, '#b8b6ae') + R(14, 140, 22, 12, '#b8b6ae');
    },
    workshop: function () {
      return R(0, 0, 320, FLOOR, '#eadbc3') + R(12, 26, 126, 76, '#d6c19f', 3) + rep(6, function (r) { return rep(12, function (c) { return C(20 + c * 10, 34 + r * 12, 1.2, '#bfa77f'); }); }) +
        R(30, 40, 4, 34, '#8a7454') + R(24, 36, 16, 8, '#6b7378', 2) + S('M60 40 v40', '#8a7454', 4) + P('M50 76 l20 0 l-4 10 l-12 0z', '#6b7378') + S('M96 38 q12 18 0 38', '#8a7454', 3) + R(110, 44, 18, 4, '#6b7378') +
        R(0, FLOOR, 320, 32, '#9b7653') + rep(5, function (i) { return L(0, 174 + i * 6, 320, 174 + i * 6, '#8a6748', 1); });
    },
    bench: function () {
      return R(0, 0, 320, FLOOR, '#e2e8ec') + R(14, 34, 120, 5, '#a9b4bb') + R(20, 18, 22, 16, '#f4c430', 2) + R(46, 22, 30, 12, '#1d5a46', 2) + R(82, 14, 18, 20, '#c9d2d8', 2) +
        R(14, 78, 120, 5, '#a9b4bb') + R(24, 60, 26, 18, '#7aa6c2', 2) + R(56, 66, 40, 12, '#e9ecef', 2) + R(0, FLOOR, 320, 32, '#a8b1b7');
    },
    salon: function () {
      return R(0, 0, 320, FLOOR, '#f3d9dd') + R(14, 24, 62, 92, '#c9a34f', 6) + R(20, 30, 50, 80, '#e6f1f4', 4) + L(30, 44, 44, 34, '#ffffff', 3) + L(30, 58, 54, 38, '#ffffff', 2) +
        R(96, 30, 40, 4, '#c9a34f') + C(104, 24, 5, '#e78fb3') + C(118, 24, 5, '#f4c430') + C(130, 24, 5, '#7cc4a4') +
        R(0, FLOOR, 320, 32, '#e7dfe1') + rep(16, function (i) { return R(i * 20 + (i % 2) * 0, FLOOR + (i % 2) * 16, 20, 16, '#cfc4c7'); });
    },
    kitchen: function () {
      return R(0, 0, 320, FLOOR, '#f4f1e8') + rep(20, function (i) { return L(i * 16, 0, i * 16, 120, '#e4ddca', 1); }) + rep(8, function (i) { return L(0, i * 16, 320, i * 16, '#e4ddca', 1); }) +
        R(16, 40, 110, 5, '#8f6a4a') + R(24, 22, 14, 18, '#d9531e', 3) + R(44, 26, 14, 14, '#f4c430', 3) + R(64, 20, 14, 20, '#1d5a46', 3) + R(86, 28, 30, 12, '#c9cfd3', 2) +
        R(0, 120, 320, FLOOR - 120, '#ece6d6') + R(0, FLOOR, 320, 32, '#b9a58a');
    },
    farm: function () {
      return R(0, 0, 320, 200, '#cfe9f6') + C(282, 30, 14, '#ffd166') + E(70, 140, 120, 46, '#9ccb6c') + E(250, 146, 130, 44, '#88bb5c') +
        rep(9, function (i) { return R(8 + i * 18, 126, 4, 26, '#b08a5a'); }) + L(6, 132, 170, 132, '#b08a5a', 3) + L(6, 144, 170, 144, '#b08a5a', 3) +
        R(0, 156, 320, 44, '#7fb04f') + rep(14, function (i) { return S('M' + (6 + i * 23) + ' 176 q2 -6 4 0 q2 -6 4 0', '#5f9238', 1.5); });
    },
    studio: function () {
      return R(0, 0, 320, FLOOR, '#2c3350') + P('M70 0 L110 0 L190 168 L20 168 Z', 'rgba(255,240,200,0.08)') + P('M240 0 L270 0 L310 168 L180 168 Z', 'rgba(170,200,255,0.07)') +
        rep(10, function (i) { return C(14 + i * 31, 14 + (i % 3) * 9, 1.2, '#8a93c4'); }) + R(0, FLOOR, 320, 32, '#1d2236') + L(0, FLOOR, 320, FLOOR, '#3a4266', 2);
    },
    office: function () {
      return R(0, 0, 320, FLOOR, '#e4ecef') + R(16, 22, 110, 80, '#ffffff', 3) + R(22, 28, 98, 68, '#bfe0ee') +
        R(30, 62, 14, 34, '#9fc3d3') + R(48, 50, 18, 46, '#8fb6c8') + R(70, 70, 14, 26, '#9fc3d3') + R(88, 56, 24, 40, '#8fb6c8') + L(71, 28, 71, 96, '#ffffff', 3) +
        R(0, FLOOR, 320, 32, '#c9b8a3') + R(14, 146, 18, 22, '#b6714a', 3) + S('M23 146 q-10 -18 -2 -30 M23 146 q8 -20 2 -32 M23 146 q16 -10 14 -24', '#3f8f5b', 4);
    },
    shop: function () {
      return R(0, 0, 320, FLOOR, '#f1e6d6') + rep(16, function (i) { return P('M' + i * 20 + ' 0 h20 v18 q-10 8 -20 0z', i % 2 ? '#2f7d5b' : '#e8b23a'); }) +
        R(14, 44, 96, 5, '#8f6a4a') + R(14, 84, 96, 5, '#8f6a4a') + R(20, 28, 16, 16, '#c0392b', 3) + R(40, 28, 16, 16, '#2a5aa8', 3) + R(60, 28, 16, 16, '#f4c430', 3) + R(80, 28, 16, 16, '#7d3c98', 3) +
        R(20, 68, 16, 16, '#1d5a46', 3) + R(40, 68, 16, 16, '#e67e22', 3) + R(60, 68, 16, 16, '#d35b8f', 3) + R(0, FLOOR, 320, 32, '#b48c62');
    },
    industrial: function () {
      return R(0, 0, 320, FLOOR, '#efdcc4') + R(14, 70, 50, 98, '#b8aa96', 4) + E(39, 70, 25, 6, '#a89a86') + R(74, 96, 36, 72, '#c4b6a2', 4) +
        L(0, 112, 160, 112, '#9d8f7c', 6) + L(0, 126, 160, 126, '#a89a86', 4) + R(0, FLOOR, 320, 32, '#8d8577');
    },
    road: function () {
      var city = rep(8, function (i) { var h = 30 + (i * 37) % 40; return R(i * 40, 120 - h, 32, h, i % 2 ? '#a9c6d6' : '#b9d3e0'); });
      return R(0, 0, 320, 200, '#cfe8f3') + G(G(city) + G(city, ' transform="translate(320 0)"'), A('a-scroll', 0, 0, 14)) +
        R(0, 120, 320, 30, '#8fbf5a') + R(0, 150, 320, 50, '#4a4f55') + G(rep(12, function (i) { return R(i * 40, 172, 22, 4, '#f4f1e8'); }), A('a-dash', 0, 0, 0.6));
    },
    lab: function () {
      return R(0, 0, 320, FLOOR, '#eef3f6') + R(14, 40, 120, 4, '#b9c4c9') + R(22, 22, 10, 18, '#8fd3ff', 2) + R(38, 26, 12, 14, '#ffd166', 2) + R(56, 18, 10, 22, '#9b59b6', 2) + R(74, 24, 14, 16, '#7cc4a4', 2) +
        R(14, 88, 120, 4, '#b9c4c9') + R(26, 70, 30, 18, '#ffffff', 2) + R(64, 74, 22, 14, '#d5e8f0', 2) + R(0, FLOOR, 320, 32, '#b9c4c9');
    },
    hotel: function () {
      return R(0, 0, 320, FLOOR, '#efe3cf') + rep(16, function (i) { return L(i * 20 + 10, 0, i * 20 + 10, FLOOR, '#e6d6bb', 3); }) +
        R(24, 30, 60, 40, '#c9a34f', 3) + R(28, 34, 52, 32, '#7fb1c9') + R(0, FLOOR, 320, 32, '#8f6a4a') + rep(6, function (i) { return L(0, 174 + i * 5, 320, 174 + i * 5, '#7d5c3f', 1); });
    }
  };

  /* ---------- tools (hand at 0,0, pointing right/down) ---------- */
  var TOOLS = {
    none: function () { return ''; },
    wrench: function () { return G(R(0, -2.5, 22, 5, '#9aa4ab', 2) + P('M20 -7 h8 v4 h-4 v6 h4 v4 h-8z', '#9aa4ab'), ' transform="rotate(30)"'); },
    hammer: function () { return G(R(-2, -24, 4, 28, '#8b5a2b', 1.5) + R(-10, -30, 20, 8, '#5d666d', 2), ' transform="rotate(30)"'); },
    mallet: function () { return G(R(-2, -22, 4, 26, '#8b5a2b', 1.5) + R(-9, -32, 18, 11, '#c08a52', 3), ' transform="rotate(30)"'); },
    screwdriver: function () { return G(R(0, -3, 11, 6, '#f4c430', 2) + R(11, -1, 13, 2, '#aab3ba'), ' transform="rotate(25)"'); },
    trowel: function () { return G(R(-1.5, -2, 10, 4, '#8b5a2b', 2) + L(8, 0, 12, 4, '#6b7378', 2) + P('M10 2 L30 2 L22 12 Z', '#aab3ba'), ' transform="rotate(10)"'); },
    roller: function () { return G(L(0, 0, 0, -20, '#555', 3) + L(0, -20, 8, -24, '#555', 2) + R(4, -34, 8, 22, '#dfe5e8', 3), ''); },
    brush: function () { return G(R(0, -2, 14, 4, '#8b5a2b', 2) + R(14, -3.5, 5, 7, '#aab3ba') + P('M19 -4 L26 -3 L26 3 L19 4 Z', '#333'), ' transform="rotate(-20)"'); },
    saw: function () { return G(R(-2, -4, 10, 8, '#8b5a2b', 2) + P('M8 -3 L44 1 L44 6 L8 4 Z', '#c7cdd1') + S('M10 4 l3 2 l3 -2 l3 2 l3 -2 l3 2 l3 -2 l3 2 l3 -2 l3 2 l3 -2', '#8b9399', 1), ' transform="rotate(12)"'); },
    scissors: function () { return G(C(-1, -4, 3.5, 'none', ' stroke="#2a5aa8" stroke-width="2"') + C(-1, 4, 3.5, 'none', ' stroke="#2a5aa8" stroke-width="2"') + P('M2 -2 L22 -1 L4 1 Z', '#aab3ba') + P('M2 2 L22 1 L4 -1 Z', '#c7cdd1'), ''); },
    comb: function () { return G(R(0, -3, 22, 4, '#2a2e31', 1) + rep(9, function (i) { return L(2 + i * 2.3, 1, 2 + i * 2.3, 5, '#2a2e31', 1); }), ' transform="rotate(15)"'); },
    clipper: function () { return G(R(0, -4, 20, 9, '#2a2e31', 4) + R(18, -4, 5, 9, '#aab3ba', 1), ' transform="rotate(10)"'); },
    spoon: function () { return G(L(0, 0, 36, 22, '#8b5a2b', 3.5) + E(39, 24, 6, 4, '#8b5a2b', ' transform="rotate(30 39 24)"'), ''); },
    knife: function () { return G(R(-2, -2.5, 10, 5, '#2a2e31', 2) + P('M8 -3 L30 -1 L30 2 L8 3 Z', '#d5dade'), ' transform="rotate(15)"'); },
    spray: function () { return G(R(-3, -2, 6, 12, '#2a2e31', 2) + R(-4, -12, 18, 10, '#c0392b', 3) + R(14, -9, 8, 3, '#6b7378'), ''); },
    torch: function () { return G(R(0, -2.5, 16, 5, '#2a2e31', 2) + L(16, 0, 26, 6, '#6b7378', 2.5), ' transform="rotate(10)"'); },
    solder: function () { return G(R(0, -3, 14, 6, '#1d5a46', 3) + L(14, 0, 28, 3, '#aab3ba', 2) + C(28, 3, 1.8, '#ff7a1a'), ' transform="rotate(15)"'); },
    pliers: function () { return G(S('M0 -3 L10 -1 L22 -1 M0 3 L10 1 L22 1', '#2a5aa8', 3), ' transform="rotate(20)"'); },
    meter: function () { return G(R(0, -9, 14, 20, '#f4c430', 2) + R(2, -6, 10, 6, '#cfe3c8') + L(14, 6, 26, 12, '#c0392b', 1.5), ''); },
    camera: function () { return G(R(-4, -14, 22, 14, '#2a2e31', 3) + C(7, -7, 5, '#4a5560') + C(7, -7, 2.5, '#8fd3ff') + R(10, -17, 6, 3, '#2a2e31'), ''); },
    can: function () { return G(R(-4, -6, 16, 14, '#2f7d5b', 3) + L(12, -2, 26, -8, '#2f7d5b', 3) + S('M-4 -6 q-8 4 0 10', '#2f7d5b', 2.5), ''); },
    scoop: function () { return G(L(0, 0, 10, 2, '#8b5a2b', 3) + P('M10 -4 h14 q0 10 -7 10 q-7 0 -7 -10z', '#c9cfd3'), ''); },
    squeegee: function () { return G(R(-3, -2, 8, 4, '#8b5a2b', 2) + R(4, -14, 6, 28, '#f4c430', 2), ''); },
    piping: function () { return G(P('M0 -6 L22 0 L0 6 Z', '#f6f6f6', ' stroke="#ddd"') + C(22, 0, 1.6, '#e78fb3'), ' transform="rotate(25)"'); },
    smoker: function () { return G(R(-2, -6, 12, 14, '#aab3ba', 2) + P('M10 -6 l8 -6 l2 2 l-6 6z', '#aab3ba'), ''); },
    tray: function () { return G(R(-6, -2, 26, 3, '#c9cfd3', 1) + R(4, -12, 6, 10, '#bfe3f2', 1) + R(12, -9, 5, 7, '#f4c430', 1), ''); },
    stick: function () { return L(0, 0, 30, 30, '#8b5a2b', 3); },
    needle: function () { return G(L(0, 0, 14, 4, '#aab3ba', 1.5) + S('M0 0 q-6 -6 -12 0', '#d9531e', 1), ''); },
    tongs: function () { return G(S('M0 -2 L26 2 M0 2 L26 6', '#4a5560', 2.5), ''); },
    stapler: function () { return G(R(0, -6, 18, 8, '#2a5aa8', 2) + R(0, 2, 14, 4, '#2a2e31', 1), ''); },
    phone: function () { return G(R(-2, -16, 11, 18, '#2a2e31', 2) + R(0, -14, 7, 12, '#8fd3ff', 1), ''); },
    peel: function () { return G(L(0, 0, 18, 6, '#8b5a2b', 3) + R(18, 0, 18, 10, '#c08a52', 2), ''); },
    jug: function () { return G(P('M0 -8 h12 l2 16 h-16z', '#e9eef0', ' stroke="#b9c4c9"') + R(1, -2, 11, 9, '#8b1e3f'), ''); }
  };

  /* ---------- worker figure (80 × 120 local box) ---------- */
  var SKINS = ['#8d5524', '#a0662f', '#6b3f1d', '#7a4a24'];
  function hairOrHat(type, color) {
    switch (type) {
      case 'hardhat': return P('M28 18 a12 11 0 0 1 24 0 z', '#f4c430') + R(26, 16, 28, 3.5, '#e0ad1c', 1.5);
      case 'cap': return P('M29 16 a11 9 0 0 1 22 0 z', color || '#c0392b') + R(46, 13.5, 13, 3, color || '#c0392b', 1.5);
      case 'chef': return C(34, 6, 6, '#ffffff') + C(42, 4, 7, '#ffffff') + C(49, 7, 6, '#ffffff') + R(30, 8, 22, 9, '#ffffff', 2) + L(30, 16, 52, 16, '#e1e5e8', 1.5);
      case 'wrap': return P('M28 19 Q28 4 41 5 Q54 5 53 18 Q48 12 40 12 Q32 12 28 19Z', color || '#2f7d5b') + C(30, 9, 4.5, color || '#2f7d5b');
      case 'puff': return P('M29 19 A11 11 0 0 1 51 17 Q47 10 40 10 Q32 10 29 19Z', '#1b1410') + C(32, 9, 6, '#1b1410');
      case 'veil': return E(40, 13, 18, 4, '#e9e2c8') + P('M30 13 a10 9 0 0 1 20 0z', '#e9e2c8') + R(28, 13, 24, 18, 'rgba(60,60,60,0.35)', 3);
      case 'mask': return P('M29 19 A11 11 0 0 1 51 17 Q47 10 40 10 Q32 10 29 19Z', '#1b1410') + R(40, 8, 15, 24, '#3a3f44', 3) + R(46, 14, 8, 5, '#6ad1ff');
      case 'phones': return P('M29 19 A11 11 0 0 1 51 17 Q47 10 40 10 Q32 10 29 19Z', '#1b1410') + S('M29 18 a11 11 0 0 1 22 0', '#2a2e31', 3) + R(26, 16, 6, 9, '#c0392b', 2) + R(48, 16, 6, 9, '#c0392b', 2);
      default: return P('M29 19 A11 11 0 0 1 51 17 Q47 10 40 10 Q32 10 29 19Z', '#1b1410');
    }
  }
  function worker(o) {
    var skin = o.skin, shirt = o.outfit, pants = o.pants || '#2c3e50', dark = shade(shirt, -28);
    var tool = (TOOLS[o.tool] || TOOLS.none)();
    var arm = G(L(51, 39, 68, 54, shirt, 9) + C(69, 55, 4.8, skin) + G(tool, ' transform="translate(69 55)"'), A('arm a-' + o.act, 51, 39));
    var faceExtra = o.hat === 'mask' ? '' : C(45.5, 19, 1.3, '#1a1a1a') + S('M43 24 q2.5 1.5 5 0', '#3a2414', 1);
    return nest(o.x, 58, 80, 120,
      E(40, 117, 20, 3, 'rgba(0,0,0,0.18)') +
      R(28, 76, 10, 38, pants, 4) + R(42, 76, 10, 38, pants, 4) + R(25, 111, 15, 6, '#222', 3) + R(41, 111, 15, 6, '#222', 3) +
      L(30, 40, 24, 70, dark, 9) + C(24, 71, 4.5, skin) +
      P('M26 37 Q40 31 54 37 L56 80 L24 80 Z', shirt) + L(30, 37, 32, 80, dark, 1.2, ' opacity="0.5"') +
      R(36, 28, 8, 8, skin) + C(40, 19, 11, skin) + C(29.5, 20, 2.3, skin) + faceExtra + hairOrHat(o.hat, o.hatColor) + arm, 'worker');
  }

  /* ---------- effects ---------- */
  var FX = {
    sparks: function (x, y) { return rep(8, function (i) { var a = i * 0.785, dx = Math.cos(a) * 14, dy = Math.sin(a) * 14; return L(x, y, x + dx, y + dy, i % 2 ? '#ffd166' : '#ff9f1c', 2, A('a-spark', x, y, 0.5, (i % 4) * 0.12)); }) + C(x, y, 5, '#fff3b0', A('a-pulse', x, y, 0.3)); },
    steam: function (x, y) { return rep(3, function (i) { return S('M' + (x - 12 + i * 12) + ' ' + y + ' q-5 -8 0 -16 q5 -8 0 -16', 'rgba(255,255,255,0.85)', 3, A('a-rise', x, y, 2.4, i * 0.7)); }); },
    smoke: function (x, y) { return rep(3, function (i) { return C(x + i * 3, y, 5 + i, 'rgba(120,120,120,0.55)', A('a-rise', x, y, 2, i * 0.6)); }); },
    bubbles: function (x, y) { return rep(4, function (i) { return C(x - 8 + i * 6, y, 2 + (i % 2), 'none', ' stroke="#9fdcf5" stroke-width="1.5"' + A('a-rise', x, y, 2, i * 0.45).replace(' class', ' class')); }); },
    drops: function (x, y, col) { return rep(3, function (i) { return P('M' + x + ' ' + y + ' q3 5 0 7 q-3 -2 0 -7z', col || '#3d9ad1', A('a-fall', x, y, 1.2, i * 0.4)); }); },
    dust: function (x, y, col) { return rep(6, function (i) { return C(x - 6 + (i * 7) % 16, y + (i % 3) * 2, 1.6, col || '#d4b483', A('a-fall', x, y, 1, i * 0.17)); }); },
    notes: function (x, y) { return rep(3, function (i) { return G(C(x + i * 10, y, 3, '#f4c430') + L(x + i * 10 + 3, y, x + i * 10 + 3, y - 12, '#f4c430', 1.6), A('a-rise', x, y, 2.2, i * 0.7)); }); },
    hearts: function (x, y) { return rep(3, function (i) { return P('M' + (x + i * 9) + ' ' + y + ' c-4 -4 -9 0 -4 5 l4 4 l4 -4 c5 -5 0 -9 -4 -5z', i === 1 ? '#f4c430' : '#e74c6f', A('a-rise', x, y, 2.4, i * 0.8)); }); },
    sparkles: function (x, y) { return rep(4, function (i) { var px = x + [0, 18, -14, 8][i], py = y + [0, 10, 14, -12][i]; return P('M' + px + ' ' + (py - 5) + ' L' + (px + 1.4) + ' ' + (py - 1.4) + ' L' + (px + 5) + ' ' + py + ' L' + (px + 1.4) + ' ' + (py + 1.4) + ' L' + px + ' ' + (py + 5) + ' L' + (px - 1.4) + ' ' + (py + 1.4) + ' L' + (px - 5) + ' ' + py + ' L' + (px - 1.4) + ' ' + (py - 1.4) + 'Z', '#ffd166', A('a-twinkle', px, py, 1.4, i * 0.35)); }); },
    waves: function (x, y) { return rep(3, function (i) { return S('M' + (x - 10) + ' ' + (y + 6) + ' a12 12 0 0 1 20 0', '#2f9e74', 2.5, A('a-wave', x, y + 6, 1.8, i * 0.6)); }); },
    flash: function (x, y) { return C(x, y, 16, '#fffbe6', A('a-flash', x, y, 2.5)) + C(x, y, 30, 'rgba(255,251,230,0.45)', A('a-flash', x, y, 2.5)); },
    mist: function (x, y) { return rep(6, function (i) { return C(x + (i % 3) * 5, y - 4 + (i % 2) * 6, 2.4, 'rgba(192,57,43,0.55)', A('a-drift', x, y, 0.9, i * 0.14)); }); }
  };

  /* ---------- props (absolute 320 × 200 coordinates) ---------- */
  function carBody(tint, hood, extra) {
    var c = shade(tint, -30);
    var s = P('M0 48 Q2 28 25 26 L45 6 Q50 0 62 0 L102 0 Q112 0 120 10 L134 26 Q152 28 152 48 L152 58 Q152 64 146 64 L6 64 Q0 64 0 58 Z', tint) +
      P('M50 8 L62 4 L84 4 L84 25 L38 25 Z', '#bfe3f2') + P('M89 4 L102 4 Q110 4 116 12 L124 25 L89 25 Z', '#bfe3f2') +
      L(86, 27, 86, 58, c, 1.5) + R(94, 32, 9, 3, c, 1) + R(0, 52, 152, 4, c, 2) + R(2, 34, 8, 6, '#ffe08a', 2) + R(146, 34, 5, 6, '#e94b3c', 1) + (extra || '') +
      wheel(30, 64, 13, hood === 'drive') + wheel(124, 64, 13, hood === 'drive');
    if (hood === 'open') s = R(6, 16, 26, 10, '#50575c', 2) + R(10, 12, 10, 5, '#6b7378', 1) + s + P('M42 26 L12 -14 L3 -8 L30 26 Z', c);
    if (hood === 'battery') s = R(6, 16, 26, 10, '#50575c', 2) + R(10, 8, 16, 10, '#2a2e31', 1) + T(12, 16, '+', 7, '#e94b3c') + T(20, 16, '–', 7, '#8fd3ff') + s + P('M42 26 L12 -14 L3 -8 L30 26 Z', c);
    return s;
  }
  function client(x, y, skin, hairStyle, tint) {
    /* seated client facing left, head centre at (x, y) */
    var hair = '';
    if (hairStyle === 'braids') hair = P('M' + (x - 11) + ' ' + (y - 2) + ' A12 12 0 0 1 ' + (x + 12) + ' ' + (y - 3) + ' L' + (x + 12) + ' ' + y + ' Z', '#1b1410') + G(rep(5, function (i) { return L(x + 2 + i * 2.5, y - 4, x + 4 + i * 3, y + 26, '#1b1410', 2); }), A('a-growy', x, y - 4, 3));
    if (hairStyle === 'short') hair = G(P('M' + (x - 12) + ' ' + (y - 1) + ' A12 12 0 0 1 ' + (x + 12) + ' ' + (y - 2) + ' Q' + x + ' ' + (y - 16) + ' ' + (x - 12) + ' ' + (y - 1) + 'Z', '#1b1410'), A('a-trim', x, y, 3));
    if (hairStyle === 'gele') hair = rep(4, function (i) { return P('M' + (x - 12) + ' ' + (y - 2) + ' Q' + (x - 16 + i * 6) + ' ' + (y - 30 - (i % 2) * 6) + ' ' + (x + 14) + ' ' + (y - 4) + ' Z', i % 2 ? shade(tint, 25) : tint, A('a-lay', x, y, 4, i * 0.6)); }) + C(x + 12, y - 8, 4, shade(tint, -20));
    if (hairStyle === 'bare') hair = P('M' + (x - 11) + ' ' + (y - 3) + ' A12 12 0 0 1 ' + (x + 12) + ' ' + (y - 4) + ' Q' + x + ' ' + (y - 14) + ' ' + (x - 11) + ' ' + (y - 3) + 'Z', '#1b1410');
    return P('M' + (x - 14) + ' ' + (y + 12) + ' Q' + x + ' ' + (y + 8) + ' ' + (x + 16) + ' ' + (y + 12) + ' L' + (x + 26) + ' ' + (y + 46) + ' L' + (x - 22) + ' ' + (y + 46) + ' Z', '#e9eef0') +
      R(x - 4, y + 8, 8, 6, skin) + C(x, y, 12, skin) + C(x - 5, y - 1, 1.3, '#1a1a1a') + S('M' + (x - 7) + ' ' + (y + 5) + ' q2.5 1.5 5 0', '#3a2414', 1) + hair;
  }
  function salonChair(x) { return R(x, 134, 54, 12, '#2a2e31', 4) + R(x + 40, 92, 14, 50, '#2a2e31', 4) + R(x + 22, 146, 8, 18, '#8b9399') + E(x + 26, 168, 20, 4, '#8b9399'); }
  function desk() { return bench(136, '#8f6a4a') + R(240, 124, 8, 12, '#3a3f44') + R(226, 132, 36, 4, '#3a3f44', 1) + R(170, 131, 46, 5, '#d5dade', 1) + R(196, 62, 104, 64, '#1f2933', 4); }
  function screenContent(kind) {
    var x = 202, y = 68, w = 92, h = 52, bg = '#0f1720';
    var s = '';
    switch (kind) {
      case 'code':
        s = rep(6, function (i) { var ww = [50, 34, 60, 40, 28, 54][i]; return R(x + 8 + (i % 3 === 1 ? 8 : 0), y + 6 + i * 7, ww, 3.5, ['#7cc4a4', '#f4c430', '#8fd3ff', '#e78fb3', '#f4c430', '#7cc4a4'][i], 1.5, A('a-growx', x + 8, y, 4, i * 0.45)); }) + R(x + 70, y + 41, 3, 6, '#ffffff', 0, A('a-blink', 0, 0, 1)); break;
      case 'web':
        bg = '#f6f8fb'; s = R(x, y, w, 7, '#d5dee5') + C(x + 4, y + 3.5, 1.5, '#e94b3c') + C(x + 9, y + 3.5, 1.5, '#f4c430') + R(x + 6, y + 11, 80, 14, '#1d5a46', 2) + R(x + 12, y + 16, 34, 3, '#f4c430', 1) +
          rep(3, function (i) { return R(x + 6 + i * 28, y + 30, 24, 18, '#ffffff', 2, ' stroke="#d5dee5"' + A('a-bob', x, y, 1.6, i * 0.3).replace(' class', ' class')); }); break;
      case 'chart':
        s = L(x + 8, y + 46, x + 86, y + 46, '#55606a', 1.5) + L(x + 8, y + 6, x + 8, y + 46, '#55606a', 1.5) + rep(5, function (i) { var bh = [16, 26, 20, 34, 30][i]; return R(x + 14 + i * 14, y + 46 - bh, 9, bh, i === 3 ? '#f4c430' : '#2f9e74', 1, A('a-growy', 0, y + 46, 3, i * 0.3)); }); break;
      case 'shield':
        s = G(P('M248 74 L268 80 L268 94 Q268 108 248 114 Q228 108 228 94 L228 80 Z', '#2f9e74') + R(242, 90, 12, 10, '#ffffff', 2) + S('M244 90 v-4 a4 4 0 0 1 8 0 v4', '#ffffff', 2), A('a-pulse2', 248, 94, 1.6)) + R(x + 4, y + 2, 84, 2, '#7cc4a4', 0, A('a-slidey', 0, 0, 2.2)); break;
      case 'network':
        var nodes = [[220, 80], [250, 74], [276, 86], [232, 106], [266, 108]];
        s = S('M220 80 L250 74 L276 86 L266 108 L232 106 Z M250 74 L232 106 M250 74 L266 108', '#3d6b8a', 1.5) + nodes.map(function (n, i) { return C(n[0], n[1], 5, i === 1 ? '#f4c430' : '#7cc4a4', A('a-pulse', n[0], n[1], 1.2, i * 0.25)); }).join(''); break;
      case 'social':
        bg = '#f6f8fb'; s = R(x + 30, y + 2, 32, 48, '#ffffff', 3, ' stroke="#d5dee5"') + R(x + 34, y + 7, 24, 16, '#e8b23a', 2) + R(x + 34, y + 27, 20, 3, '#9aa4ab') + R(x + 34, y + 33, 14, 3, '#9aa4ab') +
          P('M' + (x + 46) + ' ' + (y + 44) + ' c-3 -3 -7 0 -3 4 l3 3 l3 -3 c4 -4 0 -7 -3 -4z', '#e74c6f', A('a-pulse2', x + 46, y + 44, 0.9)); break;
      case 'ui':
        bg = '#f6f8fb'; s = R(x + 32, y + 2, 28, 48, '#ffffff', 4, ' stroke="#b9c4c9"') + R(x + 36, y + 8, 20, 10, '#d5dee5', 2) + R(x + 36, y + 22, 20, 3, '#d5dee5') + R(x + 36, y + 28, 14, 3, '#d5dee5') +
          R(x + 36, y + 38, 20, 7, '#1d5a46', 3, A('a-pulse2', x + 46, y + 41, 1.4)) + P('M' + (x + 70) + ' ' + (y + 30) + ' l0 10 l3 -3 l3 5 l2 -1 l-3 -5 l4 0z', '#2a2e31', A('a-cursor', 0, 0, 3)); break;
      case 'design':
        bg = '#f6f8fb'; s = S('M214 110 C230 70 262 120 282 78', '#e74c6f', 3, ' pathLength="100" stroke-dasharray="100"' + A('a-draw', 0, 0, 3).replace(' class', ' class')) + R(212, 108, 5, 5, '#ffffff', 0, ' stroke="#2a5aa8"') + R(280, 76, 5, 5, '#ffffff', 0, ' stroke="#2a5aa8"') +
          rep(4, function (i) { return R(x + 4, y + 4 + i * 9, 7, 7, ['#e74c6f', '#f4c430', '#1d5a46', '#2a5aa8'][i], 1); }); break;
      case 'anim':
        s = E(248, 116, 10, 2.5, 'rgba(255,255,255,0.25)', A('a-squash', 248, 116, 0.9)) + C(248, 106, 7, '#f4c430', A('a-bounce', 248, 112, 0.9)) + L(x + 4, y + 50, x + 88, y + 50, '#3d6b8a', 1); break;
      case 'ledger':
        bg = '#f6f8fb'; s = rep(5, function (r) { return rep(4, function (c) { return R(x + 6 + c * 21, y + 6 + r * 9, 19, 7, r === 0 ? '#1d5a46' : '#ffffff', 0, ' stroke="#d5dee5"'); }); }) + R(x + 6, y + 15, 82, 7, 'rgba(244,196,48,0.45)', 0, A('a-slidey2', 0, 0, 3)); break;
      case 'cad':
        bg = '#1d3d6e'; s = S('M214 112 V78 H262 V112 Z M262 92 H284 V112 H262 M238 78 V96 H214 M240 112 V102 H252 V112', '#e8f1ff', 1.5, ' pathLength="100" stroke-dasharray="100"' + A('a-draw', 0, 0, 4).replace(' class', ' class')); break;
    }
    return R(x, y, w, h, bg, 2) + s;
  }

  var PROPS = {
    car: function () { return nest(160, 95, 152, 80, carBody('#2a5aa8', 'open')) + E(236, 174, 74, 4, 'rgba(0,0,0,0.2)'); },
    carElectric: function () { return nest(160, 95, 152, 80, carBody('#c0392b', 'battery')) + E(236, 174, 74, 4, 'rgba(0,0,0,0.2)'); },
    carBody: function () { return nest(160, 95, 152, 80, carBody('#1d5a46', 'closed', R(60, 30, 22, 16, '#b9b9b9', 3) + R(92, 30, 20, 16, '#f6f6f6', 2, ' opacity="0.8"'))) + E(236, 174, 74, 4, 'rgba(0,0,0,0.2)'); },
    drive: function () { return nest(86, 104, 152, 80, carBody('#e8b23a', 'drive', C(70, 16, 7, '#7a4a24') + P('M63 14 a7 6 0 0 1 14 0z', '#1b1410')), 'a-bob-car'); },
    truck: function () {
      return nest(160, 86, 150, 90,
        R(52, 0, 98, 64, '#e9eef0', 3) + R(52, 0, 98, 10, '#1d5a46', 3) + T(70, 40, 'CARGO', 13, '#9aa4ab') + P('M0 72 L0 30 Q0 20 8 20 L32 20 L46 40 L50 72 Z', '#d9531e') + P('M8 26 L28 26 L38 40 L8 40 Z', '#bfe3f2') +
        R(0, 64, 150, 8, '#2a2e31') + wheel(22, 74, 12) + wheel(104, 74, 12) + wheel(130, 74, 12));
    },
    keke: function () {
      return nest(166, 98, 140, 80,
        P('M10 62 L14 18 Q16 6 30 6 L98 6 Q112 6 114 20 L118 62 Z', '#f2c230') + R(14, 34, 104, 6, '#2f7d5b') + P('M16 14 L40 14 L36 34 L16 34 Z', '#bfe3f2') + R(50, 14, 56, 20, '#3a3f44', 2) +
        C(70, 22, 6, '#6b3f1d') + wheel(16, 66, 11) + wheel(92, 66, 11) + wheel(116, 66, 11));
    },
    tyre: function () {
      return R(212, 160, 6, 12, '#4a5560') + R(244, 160, 6, 12, '#4a5560') + C(230, 126, 36, '#1f2326') + C(230, 126, 20, '#c9cfd3') +
        G(rep(5, function (i) { var a = i * 1.2566; return L(230, 126, 230 + 18 * Math.cos(a), 126 + 18 * Math.sin(a), '#8b9399', 3); }), A('a-spin', 230, 126, 1.2)) + C(230, 126, 5, '#6b7378') +
        R(280, 128, 30, 42, '#c0392b', 8) + C(295, 122, 7, '#e9eef0', ' stroke="#2a2e31" stroke-width="2"') + L(295, 122, 298, 118, '#c0392b', 1.5, A('a-sway', 295, 122, 0.8));
    },
    wall: function () {
      var s = R(176, 92, 130, 80, '#d8d2c4');
      [156, 140, 124, 108].forEach(function (y, r) {
        s += rep(5, function (i) {
          var x = 176 + i * 34 - (r % 2 ? 17 : 0), w = 32;
          if (x < 176) { w = x + 32 - 176; x = 176; }
          if (x >= 306) return '';
          if (x + w > 306) w = 306 - x;
          return R(x, y, w, 15, '#b8b6ae');
        });
      });
      s += rep(3, function (i) { return R(176 + i * 34, 92, 32, 15, '#c4c2ba', 0, A('a-lay', 0, 0, 5, i * 1)); });
      return s + R(178, 84, 60, 5, '#f4c430', 2) + C(208, 86.5, 1.8, '#7cc4a4') + E(186, 170, 16, 4, '#8d8b84');
    },
    tiles: function () {
      var s = R(180, 68, 124, 100, '#9fb0b8');
      for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) { if (r === 0 && c === 3) continue; s += R(182 + c * 31, 70 + r * 25, 29, 23, (r + c) % 2 ? '#e8eef0' : '#dfe8ec'); }
      return s + R(275, 70, 29, 23, '#e8eef0', 0, A('a-slot', 0, 0, 3)) + R(190, 156, 30, 14, '#cfd8dc', 2) + R(192, 150, 30, 6, '#e8eef0', 1);
    },
    screed: function () {
      return R(176, 56, 132, 116, '#b4aea4') + rep(30, function (i) { return C(180 + (i * 37) % 126, 62 + (i * 23) % 104, 1.4, '#9f998f'); }) +
        R(176, 66, 132, 106, '#f5f3ee', 0, A('a-growx', 176, 0, 4)) + R(176, 56, 132, 10, '#ffffff') + P('M176 66 h132 v4 q-66 8 -132 0z', '#e9e6df') + R(186, 158, 22, 12, '#dfe5e8', 2);
    },
    paint: function () {
      return R(176, 56, 132, 116, '#dcd6cb') + rep(4, function (i) { return R(180 + i * 31, 60, 29, 108, '#2f9e74', 1, A('a-growy-top', 0, 60, 3.2, i * 0.8)); }) +
        R(186, 160, 24, 10, '#4a5560', 1) + R(286, 148, 18, 22, '#e9eef0', 2) + R(286, 148, 18, 6, '#2f9e74', 2);
    },
    pipes: function () {
      return R(262, 46, 44, 38, '#2b2b2b', 6) + rep(4, function (i) { return L(262, 54 + i * 8, 306, 54 + i * 8, '#3d3d3d', 1.5); }) + L(284, 84, 284, 100, '#d8dde0', 8) +
        L(176, 104, 290, 104, '#d8dde0', 9) + L(212, 104, 212, 168, '#d8dde0', 9) + R(206, 98, 12, 12, '#c9cfd3', 2) + R(244, 97, 10, 14, '#2a5aa8', 2) +
        G(R(236, 88, 26, 4, '#c0392b', 2), A('a-turn-slow', 249, 90, 2)) + E(226, 166, 14, 5, '#2a5aa8') + R(214, 150, 24, 16, '#2a5aa8', 2);
    },
    rebar: function () {
      var s = rep(9, function (i) { return L(184 + i * 14, 68, 184 + i * 14, 170, '#8b5a3c', 3); }) + rep(6, function (i) { return L(180, 76 + i * 18, 300, 76 + i * 18, '#a0673f', 2.5); });
      return s + rep(5, function (i) { return C(198 + i * 21, 94 + (i % 3) * 18, 3, '#d5dade', A('a-pulse', 198 + i * 21, 94, 1.5, i * 0.3)); });
    },
    window: function () {
      return R(184, 62, 116, 100, '#cfe9f4') + R(184, 62, 116, 100, 'none', 0, ' stroke="#c9ced3" stroke-width="7"') + L(242, 62, 242, 162, '#c9ced3', 6) +
        G(L(196, 120, 216, 80, '#ffffff', 5) + L(206, 124, 222, 92, '#ffffff', 2.5), A('a-pulse', 0, 0, 2)) + G(L(254, 120, 274, 80, '#ffffff', 5), A('a-pulse', 0, 0, 2, 1)) + R(176, 164, 132, 6, '#a9b4bb', 2);
    },
    roof: function () {
      var s = R(190, 112, 112, 60, '#e7d3b0') + R(232, 132, 24, 40, '#8f6a4a') + R(268, 124, 22, 18, '#bfe3f2');
      return s + rep(5, function (i) { return P('M' + (180 + i * 13) + ' ' + (112 - i * 9.6) + ' L' + (193 + i * 13) + ' ' + (112 - (i + 1) * 9.6) + ' L' + (297 - i * 13) + ' ' + (112 - (i + 1) * 9.6) + ' L' + (310 - i * 13) + ' ' + (112 - i * 9.6) + 'Z', i % 2 ? '#2f7d5b' : '#3b8c69', A('a-lay', 0, 0, 5, i * 0.5)); });
    },
    drill: function () {
      return L(232, 40, 206, 170, '#d9531e', 4) + L(232, 40, 258, 170, '#d9531e', 4) + L(214, 130, 250, 130, '#d9531e', 3) + L(220, 96, 244, 96, '#d9531e', 3) + L(224, 68, 240, 68, '#d9531e', 3) +
        G(rep(12, function (i) { return R(229, 40 + i * 12, 6, 6, i % 2 ? '#6b7378' : '#aab3ba'); }), A('a-drillpipe', 0, 0, 0.6)) + R(264, 140, 42, 30, '#f4c430', 3) + R(270, 146, 12, 8, '#2a2e31', 1) + E(232, 170, 22, 4, '#8a6a4a');
    },
    excavator: function () {
      return R(150, 152, 106, 18, '#2a2e31', 8) + rep(5, function (i) { return C(160 + i * 22, 161, 5, '#55595c'); }) + R(162, 110, 74, 42, '#f4b400', 4) + R(170, 116, 26, 22, '#bfe3f2', 2) + C(182, 126, 5, '#6b3f1d') + P('M178 123 a5 4 0 0 1 9 0z', '#f4c430') +
        G(S('M226 120 L270 82 L298 128', '#e0a100', 9) + P('M290 124 L310 124 L306 142 L292 140 Z', '#4a5560'), A('a-dig', 226, 120, 1.8)) + E(298, 168, 20, 6, '#8a6a4a') + E(298, 164, 12, 5, '#9b7653');
    },
    paving: function () {
      var s = R(176, 150, 134, 22, '#b9a58a');
      for (var r = 0; r < 2; r++) for (var c = 0; c < 6; c++) s += R(178 + c * 22 + (r ? 11 : 0), 152 + r * 10, 20, 8, (r + c) % 2 ? '#c0392b' : '#8d8577', 2);
      return s + R(176, 116, 40, 34, '#8f6a4a') + rep(3, function (i) { return R(178, 118 + i * 10, 36, 8, '#8d8577', 2); }) + R(284, 132, 20, 8, '#c0392b', 2, A('a-dropin', 0, 0, 2.4));
    },
    wiring: function () {
      return R(180, 68, 48, 64, '#e9ecef', 4, ' stroke="#b9c4c9"') + rep(5, function (i) { return R(186 + i * 8, 80, 6, 14, i === 2 ? '#c0392b' : '#2a2e31', 1); }) + R(186, 102, 36, 22, '#d5dade', 2) +
        S('M228 86 Q262 70 284 60', '#c0392b', 2.5) + S('M228 92 Q260 80 284 64', '#2a2e31', 2.5) + S('M228 110 Q254 126 276 136', '#2f9e74', 2.5) + L(284, 40, 284, 62, '#2a2e31', 1.5) +
        C(284, 72, 18, 'rgba(255,224,138,0.5)', A('a-pulse', 284, 72, 1.6)) + C(284, 72, 9, '#ffe08a') + R(280, 60, 8, 5, '#9aa4ab') + R(268, 130, 18, 16, '#ffffff', 2, ' stroke="#b9c4c9"') + C(273, 138, 1.5, '#2a2e31') + C(281, 138, 1.5, '#2a2e31');
    },
    solar: function () {
      var dots = rep(3, function (i) { return C(224, 128, 2.5, '#f4c430', A('a-flow', 224, 128, 1.5, i * 0.5)); });
      return P('M194 112 L222 70 L306 70 L284 112 Z', '#2a5aa8') + S('M208 91 L292 91 M222 70 L208 112 M250 70 L236 112 M278 70 L264 112', '#9fc3ea', 1.2) + L(214, 112, 214, 168, '#6b7378', 3) + L(278, 112, 278, 168, '#6b7378', 3) +
        S('M222 112 Q222 126 200 128', '#2a2e31', 2) + dots + R(170, 120, 32, 44, '#f6f8fb', 3, ' stroke="#b9c4c9"') + R(176, 126, 20, 8, '#1f2933', 1) + C(186, 148, 3, '#2f9e74', A('a-blink', 0, 0, 1.4)) + R(176, 156, 20, 4, '#2f9e74', 1, A('a-growx', 176, 0, 3));
    },
    aircon: function () {
      return R(188, 62, 116, 32, '#f7f9fa', 6, ' stroke="#d5dade"') + R(196, 84, 100, 3, '#d5dade', 1) + C(290, 70, 2, '#2a5aa8', A('a-blink', 0, 0, 1.6)) +
        rep(3, function (i) { return S('M' + (206 + i * 30) + ' 98 q6 6 0 12 q-6 6 0 12', '#8fd3ff', 2.5, A('a-fall', 206 + i * 30, 98, 1.6, i * 0.4)); }) +
        R(226, 126, 80, 46, '#e3e7ea', 4, ' stroke="#c9cfd3"') + C(256, 149, 17, '#c9cfd3') + G(rep(3, function (i) { var a = i * 2.094; return E(256 + 8 * Math.cos(a), 149 + 8 * Math.sin(a), 8, 3.5, '#8b9399', ' transform="rotate(' + (i * 120) + ' ' + (256 + 8 * Math.cos(a)) + ' ' + (149 + 8 * Math.sin(a)) + ')"'); }), A('a-spin', 256, 149, 0.6)) + rep(4, function (i) { return L(280, 136 + i * 7, 300, 136 + i * 7, '#b9c4c9', 1.5); });
    },
    generator: function () {
      return G(R(182, 110, 108, 56, '#d9372b', 6) + R(182, 110, 108, 10, '#b82a20', 6) + R(196, 128, 34, 22, '#2a2e31', 3) + C(206, 139, 5, '#f6f8fb') + C(222, 139, 5, '#f6f8fb') + R(244, 128, 36, 30, '#b82a20', 3) + rep(4, function (i) { return L(248, 134 + i * 6, 276, 134 + i * 6, '#8f1e17', 1.5); }) + R(278, 92, 8, 20, '#4a5560', 2), A('a-shake', 236, 140, 0.14)) +
        wheel(196, 168, 6) + wheel(276, 168, 6);
    },
    rewind: function () {
      return bench(150) + C(240, 112, 36, '#6e7881') + C(240, 112, 26, '#b87333') + rep(12, function (i) { var a = i * 0.5236; return L(240 + 14 * Math.cos(a), 112 + 14 * Math.sin(a), 240 + 25 * Math.cos(a), 112 + 25 * Math.sin(a), '#d4924f', 3); }) +
        G(C(240, 112, 11, '#9aa4ab') + L(232, 112, 248, 112, '#4a5560', 3) + L(240, 104, 240, 120, '#4a5560', 3), A('a-spin', 240, 112, 1.4)) + G(C(292, 136, 12, '#b87333') + C(292, 136, 4, '#4a5560') + L(286, 136, 298, 136, '#8b5a2b', 2), A('a-spin', 292, 136, 1)) + S('M282 132 Q268 124 262 118', '#b87333', 1.5);
    },
    cctv: function () {
      return R(292, 66, 14, 20, '#9aa4ab', 2) + G(R(232, 66, 60, 20, '#f1f3f4', 6, ' stroke="#c9cfd3"') + C(236, 76, 7, '#2a2e31') + C(236, 76, 3, '#5c8fb3') + C(282, 70, 2, '#e94b3c', A('a-blink', 0, 0, 1)) + P('M229 76 L170 50 L170 104 Z', 'rgba(143,211,255,0.18)'), A('a-pan', 298, 76, 3)) +
        bench(140) + R(190, 104, 56, 36, '#1f2933', 3) + R(194, 108, 48, 26, '#3d6b8a', 1) + C(218, 118, 4, '#2a2e31') + R(214, 122, 8, 10, '#2a2e31', 2) + R(260, 126, 34, 14, '#2a2e31', 2) + C(288, 133, 1.5, '#2f9e74', A('a-blink', 0, 0, 0.8));
    },
    dish: function () {
      return L(270, 96, 270, 172, '#6b7378', 4) + E(256, 100, 28, 34, '#eef1f3', ' stroke="#c9cfd3" stroke-width="2" transform="rotate(-25 256 100)"') + L(256, 100, 222, 84, '#6b7378', 2.5) + R(214, 78, 10, 10, '#2a2e31', 2) +
        R(180, 150, 40, 18, '#2a2e31', 2) + C(212, 159, 1.6, '#2f9e74', A('a-blink', 0, 0, 1));
    },
    phone: function () {
      return bench(128) + R(230, 70, 40, 58, '#1f2328', 7) + R(234, 76, 32, 46, '#3ec1d3', 3, A('a-pulse', 0, 0, 1.8)) + R(176, 116, 42, 12, '#2f7d5b', 2) + rep(4, function (i) { return R(180 + i * 9, 119, 6, 6, '#2a2e31', 1); }) +
        L(288, 128, 288, 86, '#9aa4ab', 2) + L(288, 86, 262, 66, '#9aa4ab', 2) + C(262, 66, 9, 'rgba(191,227,242,0.7)', ' stroke="#9aa4ab" stroke-width="2"');
    },
    pc: function () {
      return bench(130) + R(172, 78, 40, 52, '#2a2e31', 3) + R(176, 82, 32, 44, '#3a3f44', 2) + G(C(192, 98, 9, '#55595c') + L(184, 98, 200, 98, '#8b9399', 2) + L(192, 90, 192, 106, '#8b9399', 2), A('a-spin', 192, 98, 0.5)) + R(180, 114, 24, 6, '#2f9e74', 1) +
        R(226, 70, 76, 50, '#1f2933', 3) + R(230, 74, 68, 40, '#0f1720', 2) + R(240, 100, 48, 4, '#3a3f44', 2) + R(240, 100, 48, 4, '#2f9e74', 2, A('a-growx', 240, 0, 2.5)) + R(258, 120, 12, 10, '#3a3f44');
    },
    tv: function () {
      return bench(130) + R(204, 58, 102, 66, '#1c1f22', 4) + G(rep(6, function (i) { return R(209 + i * 15.3, 63, 15.3, 56, ['#e9eef0', '#f4c430', '#3ec1d3', '#2f9e74', '#e74c6f', '#2a5aa8'][i]); }), A('a-flicker', 0, 0, 2)) + R(176, 118, 26, 12, '#2f7d5b', 2) + R(250, 124, 10, 6, '#2a2e31');
    },
    fan: function () {
      return E(250, 170, 24, 4, '#2a2e31') + L(250, 170, 250, 104, '#4a5560', 4) + C(250, 92, 30, 'none', ' stroke="#9aa4ab" stroke-width="2"') + L(220, 92, 280, 92, '#c9cfd3', 1) + L(250, 62, 250, 122, '#c9cfd3', 1) +
        G(rep(3, function (i) { return E(250, 78, 7, 13, '#3ec1d3', ' transform="rotate(' + (i * 120) + ' 250 92)"'); }), A('a-spin', 250, 92, 0.35)) + C(250, 92, 5, '#2a2e31') + bench(150) ;
    },
    weld: function () {
      return R(180, 80, 120, 88, 'none', 0, ' stroke="#6b7178" stroke-width="6"') + rep(5, function (i) { return L(200 + i * 20, 80, 200 + i * 20, 168, '#7d848b', 4); }) + L(180, 124, 300, 124, '#6b7178', 5) + C(184, 116, 10, 'rgba(255,243,176,0.6)', A('a-pulse', 184, 116, 0.25));
    },
    anvil: function () {
      return P('M184 128 H254 Q262 128 266 120 H272 Q270 136 254 138 H244 L250 160 H262 V170 H176 V160 H188 L194 138 Z', '#3d4246') + R(194, 120, 48, 8, '#ff7a1a', 3, A('a-pulse', 0, 0, 0.8)) +
        R(276, 130, 34, 40, '#6b4a32', 3) + G(P('M282 132 Q286 112 292 126 Q296 108 302 130 Z', '#ff7a1a') + P('M286 132 Q290 120 294 130 Q298 118 300 132 Z', '#ffd166'), A('a-flicker2', 292, 132, 0.4));
    },
    lathe: function () {
      return R(170, 118, 140, 22, '#5c7a8a', 3) + R(170, 86, 34, 54, '#4a6878', 3) + C(214, 110, 13, '#8b9399') + G(L(204, 110, 224, 110, '#4a5560', 3) + L(214, 100, 214, 120, '#4a5560', 3), A('a-spin', 214, 110, 0.3)) +
        R(226, 104, 60, 12, '#c9ced3', 2) + G(rep(8, function (i) { return L(228 + i * 8, 104, 232 + i * 8, 116, '#9aa4ab', 1.5); }), A('a-slidex-s', 0, 0, 0.3)) + R(286, 98, 20, 22, '#4a6878', 2) + R(244, 116, 14, 8, '#2a2e31') + R(176, 140, 8, 30, '#3d5a68') + R(296, 140, 8, 30, '#3d5a68');
    },
    saw: function () {
      return bench(132, '#b07a45') + R(176, 120, 124, 12, '#d9a066', 2) + L(180, 126, 296, 126, '#c48a4f', 1) + R(286, 112, 8, 20, '#2a5aa8', 1) + R(230, 96, 50, 24, '#c48a4f', 2) + R(236, 100, 38, 16, '#d9a066', 1);
    },
    sofa: function () {
      return R(180, 112, 126, 50, '#8f6a4a', 6) + R(180, 112, 66, 50, '#2f7d5b', 6) + R(184, 96, 58, 30, '#2f7d5b', 6) + R(246, 96, 56, 30, '#f2d27a', 4) + rep(5, function (i) { return L(250 + i * 11, 100, 250 + i * 11, 124, '#e2bf5c', 1.5); }) +
        R(174, 118, 14, 40, '#24644a', 5) + R(298, 118, 12, 40, '#8f6a4a', 5) + R(186, 160, 6, 10, '#5d4330') + R(294, 160, 6, 10, '#5d4330') + C(214, 110, 2, '#1d4d38') + C(230, 110, 2, '#1d4d38');
    },
    pot: function () {
      return R(188, 132, 116, 40, '#3a3f44', 4) + G(P('M222 132 q4 -10 8 0 M240 132 q4 -10 8 0 M258 132 q4 -10 8 0', '#3ec1d3'), A('a-flicker2', 246, 132, 0.3)) +
        P('M200 98 H290 V126 Q290 134 282 134 H208 Q200 134 200 126 Z', '#a9b2b8') + E(245, 98, 45, 6, '#d9531e') + R(194, 100, 8, 5, '#8b9399', 2) + R(288, 100, 8, 5, '#8b9399', 2) + rep(5, function (i) { return C(222 + i * 11, 97, 1.5, '#f4c430'); });
    },
    oven: function () {
      return R(198, 88, 104, 82, '#d7dde1', 5) + R(208, 104, 84, 44, '#2a2a2a', 3) + R(208, 104, 84, 44, '#ff9f1c', 3, ' opacity="0.35"' + A('a-pulse', 0, 0, 2).replace(' class', ' class')) +
        G(P('M224 140 Q224 124 250 124 Q276 124 276 140 Z', '#c8822e') + S('M236 130 l6 -4 M250 128 l6 -4 M262 130 l6 -4', '#a5641f', 1.5), A('a-rise-bread', 250, 140, 3)) + R(208, 94, 84, 6, '#b9c4c9', 2) + C(218, 158, 4, '#4a5560') + C(232, 158, 4, '#4a5560');
    },
    cake: function () {
      var dots = rep(7, function (i) { return C(208 + i * 12, 112, 3, '#e78fb3', A('a-pop', 208 + i * 12, 112, 3.5, i * 0.35)); });
      return bench(148, '#c9a34f') + R(228, 138, 34, 10, '#c9cfd3', 2) + R(204, 110, 82, 30, '#f7e3ea', 4) + R(220, 84, 50, 28, '#fdf5f7', 4) + dots + C(245, 76, 5, '#f4c430') + L(245, 76, 245, 66, '#f4c430', 1.5);
    },
    fryer: function () {
      return R(188, 140, 116, 32, '#3a3f44', 4) + P('M196 116 H296 L288 140 H204 Z', '#2a2e31') + E(246, 117, 50, 5, '#e8b84a') +
        rep(4, function (i) { return C(222 + i * 16, 116, 6, '#c8822e', A('a-bob', 222 + i * 16, 116, 0.8, i * 0.2)); });
    },
    bottles: function () {
      return bench(146, '#8f6a4a') + rep(5, function (i) {
        var x = 186 + i * 23;
        return P('M' + x + ' 146 V112 Q' + x + ' 104 ' + (x + 5) + ' 100 V92 H' + (x + 11) + ' V100 Q' + (x + 16) + ' 104 ' + (x + 16) + ' 112 V146 Z', '#e9f4f8', ' stroke="#b9c4c9"') +
          R(x + 1.5, 110, 13, 35, '#8b1e3f', 2, A('a-growy', 0, 145, 3, i * 0.4)) + R(x + 2, 122, 12, 10, '#f4c430', 1) + R(x + 5, 88, 6, 5, '#c0392b', 1);
      });
    },
    butcher: function () {
      return L(180, 54, 310, 54, '#6b7378', 3) + G(L(220, 54, 220, 64, '#6b7378', 1.5) + P('M212 64 h16 q4 20 -8 28 q-12 -8 -8 -28z', '#b5403a'), A('a-sway', 220, 54, 2)) + G(L(272, 54, 272, 64, '#6b7378', 1.5) + P('M264 64 h16 q4 20 -8 28 q-12 -8 -8 -28z', '#c0574f'), A('a-sway', 272, 54, 2, 0.5)) +
        bench(130, '#8f6a4a') + R(180, 122, 90, 8, '#e2c08d', 3) + P('M196 122 Q200 106 222 106 Q246 104 250 122 Z', '#b5403a') + P('M206 112 q14 -6 30 0', 'none', ' stroke="#f3d6c9" stroke-width="3"');
    },
    hotel: function () {
      return R(250, 58, 54, 30, '#8f6a4a', 2) + rep(6, function (i) { return C(258 + (i % 3) * 17, 66 + Math.floor(i / 3) * 14, 2.5, '#f4c430'); }) +
        R(186, 110, 120, 62, '#6b4a32', 3) + R(182, 104, 128, 8, '#8f6a4a', 2) + P('M236 104 a10 9 0 0 1 20 0z', '#e0ad1c') + R(234, 102, 24, 3, '#c9a34f', 1) + C(246, 94, 2, '#e0ad1c') + R(206, 124, 80, 30, '#5a3d29', 3);
    },
    chicken: function () {
      function hen(x, y, col, d) {
        return E(x, y, 14, 10, col) + P('M' + (x + 10) + ' ' + (y - 4) + ' l8 -6 l-2 10z', col) + L(x - 4, y + 9, x - 4, y + 16, '#e0a100', 1.5) + L(x + 2, y + 9, x + 2, y + 16, '#e0a100', 1.5) +
          G(C(x - 12, y - 8, 6, col) + P('M' + (x - 16) + ' ' + (y - 14) + ' q3 -4 6 0 q3 -4 4 2z', '#e94b3c') + P('M' + (x - 18) + ' ' + (y - 8) + ' l-5 2 l5 2z', '#e0a100') + C(x - 13, y - 9, 1, '#1a1a1a'), A('a-peck', x - 6, y - 4, 0.9, d));
      }
      return R(264, 96, 46, 54, '#b08a5a', 2) + P('M258 98 L287 76 L316 98 Z', '#c0392b') + R(278, 124, 18, 26, '#6b4a32') + hen(196, 150, '#ffffff', 0) + hen(232, 156, '#c8822e', 0.3) + hen(258, 160, '#f2efe6', 0.6) + R(180, 166, 40, 5, '#8f6a4a', 2);
    },
    fish: function () {
      function fishy(x, y, d) { return G(E(x, y, 12, 6, '#f4c430') + P('M' + (x + 10) + ' ' + y + ' l8 -6 v12z', '#e0ad1c') + C(x - 7, y - 1, 1.2, '#1a1a1a'), A('a-swim', x, y, 4, d)); }
      return R(176, 112, 136, 60, '#9aa7a8', 4) + R(182, 118, 124, 50, '#3d8fb5', 2) + rep(3, function (i) { return S('M' + (190 + i * 40) + ' 124 q6 -3 12 0', '#8fd3ff', 1.5); }) + fishy(220, 140, 0) + fishy(266, 154, 1.2) + fishy(244, 130, 2.2);
    },
    plants: function () {
      return R(176, 158, 136, 14, '#7a5536', 2) + rep(4, function (i) {
        var x = 192 + i * 32;
        return G(L(x, 158, x, 114, '#3f8f5b', 3) + E(x - 8, 132, 9, 4, '#4caf6a', ' transform="rotate(-30 ' + (x - 8) + ' 132)"') + E(x + 8, 124, 9, 4, '#4caf6a', ' transform="rotate(30 ' + (x + 8) + ' 124)"') + C(x + 4, 140, 4.5, '#e94b3c') + C(x - 3, 118, 4, '#e94b3c'), A('a-growy', x, 158, 4, i * 0.4));
      });
    },
    goat: function () {
      return G(S('M286 128 q8 -6 6 -12', '#8a6a4a', 3), A('a-wag', 286, 128, 0.4)) + E(250, 136, 38, 18, '#e8dcc6') + E(262, 132, 12, 8, '#8a6a4a') + rep(4, function (i) { return L(226 + i * 16, 148, 226 + i * 16, 168, '#d6c7ad', 4); }) +
        G(E(206, 118, 12, 9, '#e8dcc6') + P('M200 108 l-6 -10 l4 1z M208 108 l2 -12 l3 2z', '#8a6a4a') + C(201, 117, 1.4, '#1a1a1a') + P('M198 126 l2 8 l3 -7z', '#d6c7ad'), A('a-graze', 214, 126, 2)) + rep(5, function (i) { return S('M' + (200 + i * 22) + ' 170 q2 -8 4 0 q2 -6 4 0', '#3f8f5b', 2); });
    },
    snail: function () {
      function sn(x, y, d) { return G(P('M' + (x - 14) + ' ' + (y + 6) + ' q-6 0 -6 -4 h26 q0 4 -6 4z', '#c9a77f') + C(x, y - 4, 9, '#8a5a32') + S('M' + x + ' ' + (y - 4) + ' m-4 0 a4 4 0 1 1 8 0 a6 6 0 1 1 -12 0', '#e2bf8f', 1.5) + L(x - 16, y, x - 19, y - 6, '#c9a77f', 1.5), A('a-crawl', x, y, 6, d)); }
      return R(178, 128, 132, 44, '#a77b50', 3) + R(182, 132, 124, 36, '#6b4a32', 2) + E(214, 160, 12, 5, '#4caf6a') + E(280, 162, 14, 5, '#4caf6a') + sn(224, 150, 0) + sn(268, 156, 2);
    },
    bees: function () {
      function hive(x, y) { return R(x, y, 40, 22, '#f4c430', 2) + R(x, y + 24, 40, 22, '#f6f1e3', 2) + R(x - 3, y - 6, 46, 6, '#e0ad1c', 2) + R(x + 12, y + 42, 16, 3, '#2a2e31'); }
      var bees = G(rep(4, function (i) { var a = i * 1.5708; var bx = 262 + 30 * Math.cos(a), by = 96 + 22 * Math.sin(a); return E(bx, by, 4, 2.6, '#f4c430', ' stroke="#2a2e31" stroke-width="1.2"') + E(bx, by - 3, 2.5, 1.6, 'rgba(255,255,255,0.8)'); }), A('a-spin', 262, 96, 4));
      return hive(214, 118) + hive(264, 118) + L(218, 166, 218, 172, '#6b4a32', 3) + L(300, 166, 300, 172, '#6b4a32', 3) + R(210, 164, 96, 4, '#6b4a32') + bees;
    },
    grinder: function (tint) {
      return G(P('M214 78 H260 L250 100 H224 Z', '#9aa4ab') + R(206, 100, 62, 40, '#2f7d5b', 4) + R(214, 108, 20, 14, '#1d5a46', 2) + C(256, 120, 9, '#4a5560') + R(268, 112, 18, 8, '#9aa4ab'), A('a-shake', 236, 120, 0.12)) +
        R(212, 140, 50, 30, '#4a5560', 2) + R(281, 118, 4, 34, tint || '#efe2b8', 1, A('a-pulse', 0, 0, 0.5)) + P('M266 172 Q266 152 284 152 Q302 152 302 172 Z', '#8f6a4a') + E(284, 154, 14, 4, tint || '#efe2b8');
    },
    tractor: function () {
      return rep(5, function (i) { return L(176, 160 + i * 3, 312, 160 + i * 3, '#6b8f3a', 1.5); }) +
        nest(120, 92, 140, 80, R(40, 26, 56, 26, '#c0392b', 3) + R(30, 4, 34, 30, 'none', 0, ' stroke="#2a2e31" stroke-width="3"') + C(46, 18, 6, '#6b3f1d') + P('M41 15 a6 5 0 0 1 11 0z', '#f4c430') + R(92, 30, 26, 18, '#c0392b', 3) + R(110, 12, 4, 20, '#4a5560') + wheel(46, 56, 22, true) + wheel(112, 64, 13, true) +
          rep(3, function (i) { return C(16 - i * 8, 64, 4 + i * 2, 'rgba(160,130,90,0.5)', A('a-rise', 16, 64, 1.2, i * 0.3)); }), 'a-tractor');
    },
    sewing: function () {
      return bench(132) + R(176, 126, 120, 6, '#2f9e74', 1, A('a-slidex', 0, 0, 1.4)) + rep(6, function (i) { return L(180 + i * 18, 129, 188 + i * 18, 129, '#ffffff', 1, ' stroke-dasharray="2 2"'); }) +
        P('M210 126 V90 Q210 82 218 82 H286 Q294 82 294 90 V126 H280 V98 H224 V126 Z', '#1e1e1e') + R(200, 120, 104, 8, '#1e1e1e', 2) + rep(3, function (i) { return L(234 + i * 14, 88, 242 + i * 14, 88, '#c9a34f', 1.5); }) +
        G(L(230, 98, 230, 116, '#c9cfd3', 2), A('a-needle', 0, 0, 0.25)) + G(C(296, 100, 9, '#3a3f44') + L(289, 100, 303, 100, '#8b9399', 2), A('a-spin', 296, 100, 0.6));
    },
    dress: function () {
      return L(256, 150, 256, 172, '#4a5560', 3) + E(256, 172, 16, 3, '#4a5560') + G(P('M244 68 Q256 62 268 68 L272 96 Q290 128 296 150 H216 Q222 128 240 96 Z', '#7d3c98') + P('M240 96 H272', 'none', ' stroke="#f4c430" stroke-width="3"') + rep(4, function (i) { return C(232 + i * 16, 132, 3, '#f4c430'); }), A('a-sway-s', 256, 68, 3)) + C(256, 62, 6, '#c9a77f') +
        S('M236 82 q20 10 40 0', '#f4c430', 2) + R(180, 140, 24, 30, '#c0392b', 3) + R(184, 132, 16, 8, '#2a5aa8', 2);
    },
    dye: function () {
      return L(184, 50, 312, 50, '#6b4a32', 2) + G(R(196, 50, 28, 40, '#1d2f6b', 1) + rep(4, function (i) { return C(203 + (i % 2) * 14, 58 + Math.floor(i / 2) * 16, 4, 'none', ' stroke="#e8eefc" stroke-width="2"'); }), A('a-sway', 210, 50, 2.4)) +
        G(R(276, 50, 28, 44, '#2b4a9b', 1) + S('M280 60 h20 M280 70 h20 M280 80 h20', '#e8eefc', 2, ' stroke-dasharray="3 3"'), A('a-sway', 290, 50, 2.4, 0.6)) +
        P('M210 140 Q206 172 246 172 Q286 172 282 140 Z', '#8a5a32') + E(246, 140, 37, 7, '#1d2f6b') + G(R(240, 104, 14, 40, '#e8eefc', 2) + R(240, 126, 14, 18, '#3b5bb5', 2), A('a-dip', 247, 104, 2)) + FX.drops(256, 146, '#1d2f6b');
    },
    loom: function () {
      return L(188, 52, 188, 170, '#8f6a4a', 6) + L(304, 52, 304, 170, '#8f6a4a', 6) + L(188, 56, 304, 56, '#8f6a4a', 5) + L(188, 150, 304, 150, '#8f6a4a', 5) +
        rep(14, function (i) { return L(198 + i * 7.5, 58, 198 + i * 7.5, 148, '#e7d3b0', 1); }) + G(rep(5, function (i) { return R(196, 116 + i * 6.5, 100, 6, ['#c0392b', '#f4c430', '#1d5a46', '#c0392b', '#7d3c98'][i]); }), A('a-growy', 0, 148, 5)) +
        G(P('M200 104 h22 l4 3 l-4 3 h-22 l-4 -3z', '#6b4a32'), A('a-shuttle', 0, 0, 1.6)) + L(194, 96, 298, 96, '#c9a34f', 3);
    },
    shoe: function () {
      return bench(134) + P('M206 128 Q206 104 226 100 L248 98 Q258 98 262 108 L290 116 Q300 120 298 128 Z', '#6b3e22') + R(204, 128, 96, 6, '#1e1e1e', 2) + S('M226 106 Q244 104 258 112', '#e2bf8f', 1.5, ' stroke-dasharray="3 2"') + R(178, 124, 22, 10, '#c9a77f', 2);
    },
    bag: function () {
      return bench(146, '#8f6a4a') + S('M222 104 Q222 78 248 78 Q274 78 274 104', '#6b3e22', 5) + R(204, 102, 88, 44, '#c0392b', 8) + R(204, 102, 88, 12, '#a93226', 8) + R(242, 112, 12, 8, '#f4c430', 2) +
        S('M210 140 H286', '#ffffff', 1.6, ' stroke-dasharray="4 3" pathLength="100"' + A('a-dashmove', 0, 0, 1).replace(' class', ' class'));
    },
    embroider: function () {
      return bench(150) + C(244, 112, 38, '#f6f1e6') + C(244, 112, 38, 'none', ' stroke="#c99a5b" stroke-width="5"') + R(278, 106, 10, 12, '#c99a5b', 2) +
        S('M244 92 C256 92 260 104 244 112 C228 104 232 92 244 92 M244 112 C262 108 266 124 250 128 M244 112 C226 108 222 124 238 128 M244 112 V136', '#d9531e', 2.5, ' pathLength="100" stroke-dasharray="100"' + A('a-draw', 0, 0, 4).replace(' class', ' class')) + C(244, 112, 3, '#f4c430');
    },
    washer: function () {
      return R(200, 92, 80, 80, '#f3f5f6', 6, ' stroke="#d5dade"') + R(200, 92, 80, 16, '#e3e7ea', 6) + C(214, 100, 3, '#2f9e74') + R(240, 98, 30, 4, '#b9c4c9', 2) + C(240, 140, 26, '#c9cfd3') + C(240, 140, 21, '#9fd3ea') +
        G(C(232, 132, 7, '#e74c6f') + C(248, 144, 8, '#f4c430') + C(236, 150, 6, '#2a5aa8'), A('a-spin', 240, 140, 0.8)) + R(286, 134, 26, 36, '#b48c62', 4) + R(288, 126, 22, 10, '#ffffff', 3);
    },
    hair: function () { return salonChair(222) + client(238, 98, '#7a4a24', 'braids'); },
    barber: function () { return salonChair(222) + client(238, 98, '#6b3f1d', 'short'); },
    makeup: function () { return salonChair(222) + client(238, 98, '#8d5524', 'bare') + C(232, 102, 4, 'rgba(231,76,111,0.45)', A('a-pulse', 232, 102, 1.6)) + R(188, 140, 30, 4, '#c9a34f'); },
    gele: function () { return salonChair(222) + client(238, 98, '#a0662f', 'gele', '#c9a34f'); },
    wig: function () {
      return bench(140) + L(250, 140, 250, 116, '#c9cfd3', 4) + G(P('M234 112 Q232 70 250 68 Q270 68 268 112 Q270 132 262 136 L262 104 Q250 96 240 104 L240 136 Q232 132 234 112Z', '#1b1410') + C(250, 92, 13, '#e2c4a0') + P('M236 90 Q238 70 250 70 Q264 70 266 92 Q258 80 250 80 Q242 80 236 90Z', '#1b1410'), A('a-sway-s', 250, 140, 3));
    },
    nails: function () {
      return bench(136, '#c9a34f') + R(222, 126, 84, 10, '#f6f1e6', 4) + R(262, 100, 44, 30, '#7a4a24', 10) +
        rep(4, function (i) { return R(228, 100 + i * 7, 44, 6, '#7a4a24', 3); }) +
        rep(4, function (i) { return R(226, 100.5 + i * 7, 7, 5, '#e74c6f', 2, A('a-pulse', 0, 0, 1.6, i * 0.3)); }) +
        R(190, 114, 12, 16, '#e74c6f', 3) + R(193, 106, 6, 8, '#2a2e31', 1);
    },
    soap: function () {
      return bench(134) + P('M200 104 H252 L246 134 H206 Z', '#e9eef0', ' stroke="#b9c4c9"') + E(226, 106, 26, 4, '#f6c2d6') + rep(3, function (i) { return R(262, 122 - i * 9, 34, 8, ['#f4c430', '#7cc4a4', '#e78fb3'][i], 2); }) + R(296, 92, 12, 30, '#2f9e74', 4) + R(299, 86, 6, 6, '#2a2e31', 1);
    },
    spa: function () {
      return R(176, 128, 136, 12, '#f6f1e6', 4) + R(182, 140, 6, 30, '#8f6a4a') + R(300, 140, 6, 30, '#8f6a4a') + C(292, 120, 9, '#7a4a24') + P('M190 128 Q190 112 214 112 H282 Q290 112 290 122 V128 Z', '#ffffff', ' stroke="#e3dccb"') +
        R(182, 100, 8, 14, '#f6f1e6', 1) + G(P('M186 100 q-3 -6 0 -10 q3 4 0 10z', '#ff9f1c'), A('a-flicker2', 186, 100, 0.5)) + R(196, 104, 8, 10, '#f6f1e6', 1) + G(P('M200 104 q-3 -6 0 -10 q3 4 0 10z', '#ff9f1c'), A('a-flicker2', 200, 104, 0.6));
    },
    pottery: function () {
      return R(208, 140, 74, 32, '#7a5a43', 4) + E(245, 140, 32, 6, '#9c8c80') + E(245, 140, 32, 6, 'none', ' stroke="#7d6e62" stroke-width="2" stroke-dasharray="6 6"' + A('a-dashmove', 0, 0, 0.5).replace(' class', ' class')) +
        G(P('M228 138 Q224 120 234 110 Q238 104 236 98 H254 Q252 104 256 110 Q266 120 262 138 Z', '#b5653d') + E(245, 98, 9, 2.5, '#9a4f2c'), A('a-throw', 245, 138, 1.6)) + rep(2, function (i) { return P('M' + (282 + i * 0) + ' ' + (70 + i * 30) + ' h28 v4 h-28z', '#8f6a4a') + P('M' + (288) + ' ' + (70 + i * 30) + ' q-2 -14 6 -18 h4 q8 4 6 18z', i ? '#c48a5a' : '#b5653d'); });
    },
    carve: function () {
      return R(226, 146, 40, 26, '#6b4a32', 3) + P('M232 146 Q228 120 236 104 Q232 88 246 80 Q262 80 260 98 Q268 116 260 146 Z', '#a0683c') + S('M240 94 q6 3 12 0 M244 104 v6 M240 118 q6 4 12 0', '#6b4a32', 2) + R(276, 150, 30, 20, '#c48a4f', 2) + R(280, 142, 22, 8, '#d9a066', 2);
    },
    cast: function () {
      return R(226, 146, 70, 26, '#b9a58a', 3) + R(250, 146, 18, 6, '#ff7a1a', 1, A('a-pulse', 0, 0, 0.5)) + G(P('M198 108 h28 l-4 22 h-20z', '#4a5560') + E(212, 108, 14, 3, '#ff9f1c'), ' transform="rotate(35 212 118)"') + S('M228 124 Q246 128 256 146', '#ff9f1c', 4, A('a-pulse', 0, 0, 0.3)) +
        R(282, 92, 24, 4, '#8f6a4a') + P('M286 92 q-2 -16 8 -20 q10 4 8 20z', '#b8862d');
    },
    basket: function () {
      return P('M206 116 L216 168 H276 L286 116 Z', '#c9a061') + rep(6, function (i) { return L(208 + i * 0, 120 + i * 8, 284, 120 + i * 8, '#a5793f', 2.5, A('a-lay', 0, 0, 5, i * 0.5)); }) + rep(7, function (i) { return L(214 + i * 11, 116, 220 + i * 9, 168, '#e2bf7f', 1.5); }) + E(246, 116, 40, 5, 'none', ' stroke="#a5793f" stroke-width="4"') +
        rep(4, function (i) { return L(290, 110 + i * 4, 312, 170, '#e2bf7f', 2); });
    },
    calabash: function () {
      return bench(146) + P('M206 118 Q206 146 246 146 Q286 146 286 118 Z', '#c8893e') + E(246, 118, 40, 6, '#a5692c') +
        S('M214 128 q8 -8 16 0 q8 8 16 0 q8 -8 16 0 q8 8 16 0', '#5a3418', 2, ' pathLength="100" stroke-dasharray="100"' + A('a-draw', 0, 0, 3.5).replace(' class', ' class')) + S('M226 138 h40', '#5a3418', 1.5, ' stroke-dasharray="3 3"') + E(292, 140, 14, 6, '#d9a066');
    },
    ring: function () {
      return bench(136, '#6b4a32') + R(228, 112, 50, 6, '#9aa4ab', 2) + C(262, 115, 9, 'none', ' stroke="#e0ad1c" stroke-width="4"') + C(262, 106, 3, '#8fd3ff') + R(196, 120, 16, 16, '#4a5560', 2) + G(P('M204 120 q-4 -8 0 -14 q4 6 0 14z', '#3ec1d3'), A('a-flicker2', 204, 120, 0.3));
    },
    beads: function () {
      return L(196, 60, 304, 60, '#8f6a4a', 4) + rep(3, function (i) {
        var x = 212 + i * 36, cols = ['#c0392b', '#f4c430', '#2f9e74'];
        return G(S('M' + (x - 12) + ' 60 Q' + x + ' 116 ' + (x + 12) + ' 60', '#c9a34f', 1) + rep(7, function (k) { var t = k / 6; var bx = (1 - t) * (1 - t) * (x - 12) + 2 * (1 - t) * t * x + t * t * (x + 12); var by = (1 - t) * (1 - t) * 60 + 2 * (1 - t) * t * 116 + t * t * 60; return C(bx, by, 3.4, cols[(i + k) % 3]); }), A('a-sway', x, 60, 2.2, i * 0.4));
      }) + bench(146) + rep(10, function (i) { return C(200 + i * 9, 142, 2.6, ['#c0392b', '#f4c430', '#2f9e74', '#2a5aa8'][i % 4]); });
    },
    camera: function () {
      return R(234, 52, 76, 120, '#c9d7e3') + E(272, 172, 38, 3, '#aab9c6') + L(206, 94, 206, 172, '#4a5560', 2.5) + L(206, 172, 196, 172, '#4a5560', 2) + L(206, 172, 216, 172, '#4a5560', 2) + P('M190 72 h32 l-6 22 h-20z', '#f6f8fb', ' stroke="#b9c4c9"') +
        modelFigure(232, '#e78fb3');
    },
    video: function () {
      return R(234, 52, 76, 120, '#d7e6dc') + modelFigure(232, '#2f9e74') + L(196, 112, 184, 172, '#4a5560', 2.5) + L(196, 112, 208, 172, '#4a5560', 2.5) + L(196, 112, 196, 172, '#4a5560', 2) + R(178, 92, 40, 20, '#2a2e31', 4) + C(222, 102, 7, '#4a5560') + C(222, 102, 3.5, '#8fd3ff') + C(186, 98, 2.5, '#e94b3c', A('a-blink', 0, 0, 1));
    },
    mixer: function () {
      return bench(132, '#3a3f44') + R(196, 112, 96, 20, '#1f2933', 3) + rep(8, function (i) { return L(204 + i * 11, 116, 204 + i * 11, 128, '#4a5560', 2) + R(201 + i * 11, 118, 6, 4, '#f4c430', 1, A('a-fader', 0, 0, 1.2, i * 0.15)); }) +
        G(R(176, 70, 22, 40, '#2a2e31', 3) + C(187, 98, 7, '#4a5560') + C(187, 80, 4, '#4a5560'), A('a-thump', 187, 90, 0.5)) + G(R(290, 70, 22, 40, '#2a2e31', 3) + C(301, 98, 7, '#4a5560') + C(301, 80, 4, '#4a5560'), A('a-thump', 301, 90, 0.5)) +
        R(212, 64, 64, 40, '#0f1720', 3) + S('M216 84 q4 -10 8 0 t8 0 t8 0 t8 0 t8 0 t8 0', '#7cc4a4', 1.5);
    },
    turntable: function () {
      return R(180, 118, 130, 54, '#1f2933', 4) + R(176, 112, 138, 10, '#2a2e31', 3) + E(212, 112, 24, 6, '#3a3f44') + E(212, 112, 24, 6, 'none', ' stroke="#55595c" stroke-width="2" stroke-dasharray="5 4"' + A('a-dashmove', 0, 0, 0.4).replace(' class', ' class')) +
        E(278, 112, 24, 6, '#3a3f44') + E(278, 112, 24, 6, 'none', ' stroke="#55595c" stroke-width="2" stroke-dasharray="5 4"' + A('a-dashmove', 0, 0, 0.4).replace(' class', ' class')) + R(238, 106, 14, 6, '#7cc4a4', 2) +
        P('M214 0 L236 0 L280 112 L190 112 Z', 'rgba(231,76,111,0.12)', A('a-pulse', 0, 0, 1)) + P('M280 0 L300 0 L310 112 L250 112 Z', 'rgba(143,211,255,0.12)', A('a-pulse', 0, 0, 1, 0.5));
    },
    content: function () {
      return L(232, 116, 220, 172, '#4a5560', 2.5) + L(232, 116, 244, 172, '#4a5560', 2.5) + C(232, 90, 26, 'none', ' stroke="#fff8e1" stroke-width="7"' + A('a-pulse', 232, 90, 1.8).replace(' class', ' class')) + C(232, 90, 26, 'none', ' stroke="#f4c430" stroke-width="1.5"') + R(224, 76, 16, 28, '#2a2e31', 3) + R(226, 79, 12, 22, '#3ec1d3', 2);
    },
    easel: function () {
      return L(230, 70, 214, 172, '#8f6a4a', 4) + L(262, 70, 278, 172, '#8f6a4a', 4) + L(246, 70, 246, 172, '#8f6a4a', 3) + R(204, 64, 84, 72, '#fbf8f1', 2, ' stroke="#d5c9b3"') +
        S('M210 120 Q232 92 250 112 Q266 128 284 104', '#2f9e74', 4, ' pathLength="100" stroke-dasharray="100"' + A('a-draw', 0, 0, 4).replace(' class', ' class')) + C(268, 82, 8, '#f4c430', A('a-pop', 268, 82, 4, 1)) + S('M214 130 h64', '#2a5aa8', 3, ' pathLength="100" stroke-dasharray="100"' + A('a-draw', 0, 0, 4, 0.8).replace(' class', ' class')) + R(206, 136, 80, 4, '#8f6a4a');
    },
    balloons: function () {
      var cols = ['#f4c430', '#ffffff', '#2f9e74', '#e78fb3'];
      return rep(11, function (i) { var a = Math.PI - i * Math.PI / 10; var x = 250 + 54 * Math.cos(a), y = 136 - 74 * Math.sin(a); return C(x, y, 10, cols[i % 4], ' stroke="rgba(0,0,0,0.08)"' + A('a-bob', x, y, 1.6, (i % 4) * 0.3).replace(' class', ' class')); }) +
        R(226, 140, 48, 32, '#ffffff', 3, ' stroke="#e3dccb"') + P('M232 140 q18 -18 36 0', '#e78fb3');
    },
    interior: function () {
      return R(196, 128, 104, 32, '#2f7d5b', 8) + R(190, 120, 18, 40, '#24644a', 6) + R(290, 120, 16, 40, '#24644a', 6) + R(200, 112, 92, 22, '#3b8c69', 6) + E(248, 170, 64, 4, '#c9a34f') +
        G(L(250, 46, 236, 62, '#6b4a32', 1) + L(250, 46, 264, 62, '#6b4a32', 1) + R(226, 62, 48, 36, '#c9a34f', 2) + R(230, 66, 40, 28, '#e8b23a') + C(244, 76, 4, '#ffffff'), A('a-sway', 250, 46, 2.6)) + L(186, 172, 186, 92, '#4a5560', 2) + P('M176 92 h20 l-4 -14 h-12z', '#f4c430');
    },
    print: function () {
      return bench(136) + P('M206 100 l10 -6 h12 q6 6 18 6 q12 0 18 -6 h12 l10 6 l-6 14 h-8 v22 h-52 v-22 h-8z', '#ffffff', ' stroke="#d5dade"') + R(234, 108, 26, 16, '#e74c6f', 2, A('a-growx', 234, 0, 2.4)) + R(198, 94, 98, 36, 'none', 2, ' stroke="#c48a4f" stroke-width="4"');
    },
    survey: function () {
      return L(220, 112, 206, 172, '#e0a100', 3) + L(220, 112, 234, 172, '#e0a100', 3) + L(220, 112, 220, 172, '#e0a100', 2) + R(208, 92, 24, 20, '#f4c430', 3) + R(212, 96, 16, 8, '#2a2e31', 1) +
        L(232, 100, 292, 100, '#e94b3c', 1.5, ' stroke-dasharray="4 4"' + A('a-dashmove', 0, 0, 0.6).replace(' class', ' class')) + rep(8, function (i) { return R(290, 60 + i * 14, 8, 14, i % 2 ? '#ffffff' : '#e94b3c'); });
    },
    flask: function () {
      return bench(132, '#d5dade') + P('M206 94 V78 H218 V94 L230 126 H194 Z', '#e9f4f8', ' stroke="#9aa4ab"') + P('M199 114 H225 L230 126 H194 Z', '#2f9e74') + FX.bubbles(212, 108) +
        P('M252 98 V78 H262 V98 L272 126 H242 Z', '#e9f4f8', ' stroke="#9aa4ab"') + P('M246 112 H268 L272 126 H242 Z', '#e94b3c') + R(282, 100, 24, 6, '#9aa4ab', 1) + rep(3, function (i) { return R(285 + i * 7, 88, 5, 24, '#e9f4f8', 2, ' stroke="#9aa4ab"') + R(285 + i * 7, 102, 5, 10, ['#f4c430', '#2a5aa8', '#7cc4a4'][i], 2); });
    },
    refinery: function () {
      return R(236, 88, 40, 84, '#c9cfd3', 4) + E(256, 88, 20, 5, '#b9c4c9') + L(290, 40, 290, 172, '#6b7378', 6) + G(P('M284 40 Q286 22 290 30 Q294 16 298 40 Z', '#ff7a1a') + P('M287 40 Q289 30 291 34 Q293 26 295 40 Z', '#ffd166'), A('a-flicker2', 290, 40, 0.35)) +
        L(176, 128, 236, 128, '#9aa4ab', 8) + L(276, 140, 290, 140, '#9aa4ab', 6) + G(C(186, 112, 12, 'none', ' stroke="#c0392b" stroke-width="3"') + L(174, 112, 198, 112, '#c0392b', 2) + L(186, 100, 186, 124, '#c0392b', 2), A('a-spin', 186, 112, 3)) + L(186, 124, 186, 128, '#6b7378', 3);
    },
    mast: function () {
      return L(252, 40, 226, 172, '#9aa4ab', 3) + L(252, 40, 278, 172, '#9aa4ab', 3) + rep(6, function (i) { var y = 60 + i * 20; var dx = (y - 40) * 26 / 132; return L(252 - dx, y, 252 + dx + 4, y + 20, '#b9c4c9', 1.5) + L(252 + dx, y, 252 - dx - 4, y + 20, '#b9c4c9', 1.5); }) +
        R(238, 46, 6, 18, '#f6f8fb', 1) + R(260, 46, 6, 18, '#f6f8fb', 1) + C(252, 38, 3, '#e94b3c', A('a-blink', 0, 0, 1)) + R(184, 150, 30, 22, '#e3e7ea', 2);
    },
    delivery: function () {
      return nest(100, 96, 150, 90,
        wheel(30, 70, 15, true) + wheel(112, 70, 15, true) + P('M30 70 L54 46 H94 L112 70', 'none', ' stroke="#2a2e31" stroke-width="5"') + R(48, 40, 52, 12, '#c0392b', 5) + R(82, 10, 34, 30, '#f4c430', 3) + T(86, 30, 'GO', 12, '#2a2e31') +
        L(48, 40, 38, 24, '#4a5560', 3) + P('M58 40 L62 14 Q64 6 72 8 L76 40 Z', '#2f7d5b') + C(70, 2, 8, '#6b3f1d') + P('M61 0 a9 8 0 0 1 18 0 v3 h-18z', '#c0392b') + L(62, 18, 40, 24, '#2f7d5b', 5), 'a-bob-car');
    },
    pos: function () {
      return R(190, 120, 120, 52, '#1d5a46', 3) + R(186, 114, 128, 8, '#8f6a4a', 2) + R(222, 82, 26, 34, '#2a2e31', 4) + R(226, 86, 18, 10, '#8fd3ff', 1) + rep(6, function (i) { return C(229 + (i % 3) * 6, 102 + Math.floor(i / 3) * 6, 1.6, '#9aa4ab'); }) +
        R(227, 60, 16, 24, '#ffffff', 1, A('a-growy', 0, 84, 2.5)) + R(266, 98, 30, 16, '#2f9e74', 2) + R(270, 102, 22, 8, '#7cc4a4', 1) + T(258, 150, 'POS', 16, '#f4c430');
    }
  };
  /* screen variants share a desk */
  ['code', 'web', 'chart', 'shield', 'network', 'social', 'ui', 'design', 'anim', 'ledger', 'cad'].forEach(function (k) {
    PROPS['screen-' + k] = function () { return desk() + screenContent(k) + (k === 'social' ? P('M290 134 l-14 -6 v-6 l14 -6z', '#f4c430') : '') + (k === 'ledger' ? R(280, 122, 16, 14, '#2a2e31', 2) : ''); };
  });

  function modelFigure(x, outfit) {
    /* a person facing left, used for photo and video subjects */
    return '<g transform="translate(' + (x + 80) + ' 0) scale(-1 1)">' + worker({ x: 0, skin: '#6b3f1d', outfit: outfit, pants: '#2c3e50', hat: 'puff', tool: 'none', act: 'pose' }) + '</g>';
  }

  /* ---------- scene definitions ---------- */
  var D = {
    wall: { bg: 'site', tool: 'trowel', act: 'swing', hat: 'hardhat', wx: 90 },
    tiles: { bg: 'site', tool: 'trowel', act: 'stroke', hat: 'hardhat', wx: 96 },
    screed: { bg: 'site', tool: 'trowel', act: 'saw', hat: 'cap', wx: 92 },
    paint: { bg: 'site', tool: 'roller', act: 'stroke', hat: 'cap', wx: 98 },
    pipes: { bg: 'workshop', tool: 'wrench', act: 'turn', hat: 'cap', wx: 92, fx: ['drops', 212, 112] },
    rebar: { bg: 'site', tool: 'pliers', act: 'turn', hat: 'hardhat', wx: 98 },
    window: { bg: 'site', tool: 'screwdriver', act: 'turn', hat: 'cap', wx: 98 },
    roof: { bg: 'site', tool: 'hammer', act: 'swing', hat: 'hardhat', wx: 102 },
    drill: { bg: 'site', tool: 'none', act: 'sway', hat: 'hardhat', wx: 100, fx: ['drops', 232, 166, '#8a6a4a'] },
    excavator: { bg: 'site', worker: false, fx: ['dust', 298, 150, '#9b7653'] },
    paving: { bg: 'site', tool: 'mallet', act: 'swing', hat: 'hardhat', wx: 98 },
    wiring: { bg: 'bench', tool: 'screwdriver', act: 'turn', hat: 'cap', hatColor: '#2a5aa8', wx: 100, fx: ['sparkles', 284, 72] },
    solar: { bg: 'site', tool: 'wrench', act: 'turn', hat: 'hardhat', wx: 96 },
    aircon: { bg: 'bench', tool: 'screwdriver', act: 'turn', hat: 'cap', hatColor: '#2a5aa8', wx: 100 },
    generator: { bg: 'garage', tool: 'wrench', act: 'turn', hat: 'cap', wx: 100, fx: ['smoke', 282, 88] },
    rewind: { bg: 'workshop', tool: 'none', act: 'turn', wx: 108 },
    cctv: { bg: 'bench', tool: 'screwdriver', act: 'turn', hat: 'cap', hatColor: '#1d5a46', wx: 92 },
    dish: { bg: 'site', tool: 'wrench', act: 'turn', hat: 'cap', wx: 140, fx: ['waves', 218, 60] },
    phone: { bg: 'bench', tool: 'solder', act: 'turn', wx: 96, fx: ['smoke', 190, 108] },
    pc: { bg: 'bench', tool: 'screwdriver', act: 'turn', wx: 92 },
    tv: { bg: 'bench', tool: 'solder', act: 'turn', wx: 94, fx: ['smoke', 186, 112] },
    fan: { bg: 'bench', tool: 'screwdriver', act: 'turn', wx: 104 },
    car: { bg: 'garage', tool: 'wrench', act: 'turn', hat: 'cap', hatColor: '#1d5a46', wx: 90, fx: ['sparks', 176, 104] },
    carElectric: { bg: 'garage', tool: 'meter', act: 'turn', hat: 'cap', hatColor: '#c0392b', wx: 90, fx: ['sparkles', 178, 100] },
    carBody: { bg: 'garage', tool: 'spray', act: 'sway', hat: 'cap', wx: 90, fx: ['mist', 184, 112] },
    tyre: { bg: 'garage', tool: 'wrench', act: 'turn', wx: 104 },
    keke: { bg: 'garage', tool: 'wrench', act: 'turn', hat: 'cap', wx: 100 },
    truck: { bg: 'garage', tool: 'wrench', act: 'turn', hat: 'cap', hatColor: '#d9531e', wx: 96 },
    drive: { bg: 'road', worker: false },
    weld: { bg: 'workshop', tool: 'torch', act: 'sway', hat: 'mask', wx: 92, fx: ['sparks', 184, 116] },
    anvil: { bg: 'workshop', tool: 'hammer', act: 'swing', wx: 108, fx: ['sparks', 216, 120] },
    lathe: { bg: 'workshop', tool: 'none', act: 'turn', hat: 'cap', wx: 98, fx: ['dust', 246, 104, '#c9cfd3'] },
    saw: { bg: 'workshop', tool: 'saw', act: 'saw', wx: 104, fx: ['dust', 192, 132, '#d9a066'] },
    sofa: { bg: 'workshop', tool: 'stapler', act: 'swing-s', wx: 96 },
    pot: { bg: 'kitchen', tool: 'spoon', act: 'stir', hat: 'chef', outfit: '#ffffff', wx: 104, fx: ['steam', 246, 88] },
    oven: { bg: 'kitchen', tool: 'peel', act: 'sway', hat: 'chef', outfit: '#ffffff', wx: 112 },
    cake: { bg: 'kitchen', tool: 'piping', act: 'stroke-s', hat: 'chef', outfit: '#ffffff', wx: 118 },
    fryer: { bg: 'kitchen', tool: 'spoon', act: 'stir', hat: 'wrap', outfit: '#ffffff', wx: 104, fx: ['steam', 246, 108] },
    bottles: { bg: 'kitchen', tool: 'jug', act: 'sway', hat: 'wrap', wx: 104 },
    butcher: { bg: 'kitchen', tool: 'knife', act: 'chop', hat: 'cap', hatColor: '#ffffff', outfit: '#ffffff', wx: 108 },
    hotel: { bg: 'hotel', tool: 'tray', act: 'sway', hat: 'cap', hatColor: '#8b1e3f', outfit: '#8b1e3f', wx: 96, fx: ['sparkles', 246, 88] },
    chicken: { bg: 'farm', tool: 'scoop', act: 'swing-s', hat: 'wrap', hatColor: '#e8b23a', wx: 104, fx: ['dust', 180, 128, '#e0ad1c'] },
    fish: { bg: 'farm', tool: 'scoop', act: 'swing-s', hat: 'cap', wx: 100, fx: ['bubbles', 242, 140] },
    plants: { bg: 'farm', tool: 'can', act: 'sway', hat: 'wrap', hatColor: '#c0392b', wx: 106, fx: ['drops', 192, 104] },
    goat: { bg: 'farm', tool: 'stick', act: 'sway', hat: 'cap', wx: 100 },
    snail: { bg: 'farm', tool: 'none', act: 'sway', hat: 'wrap', wx: 100 },
    bees: { bg: 'farm', tool: 'smoker', act: 'sway', hat: 'veil', outfit: '#f6f1e3', wx: 108, fx: ['smoke', 190, 104] },
    grinder: { bg: 'farm', tool: 'none', act: 'sway', hat: 'wrap', wx: 112 },
    tractor: { bg: 'farm', worker: false },
    sewing: { bg: 'shop', tool: 'none', act: 'type', wx: 112 },
    dress: { bg: 'shop', tool: 'scissors', act: 'snip', hat: 'puff', wx: 112, fx: ['sparkles', 272, 84] },
    dye: { bg: 'farm', tool: 'stick', act: 'stir', hat: 'wrap', hatColor: '#1d2f6b', wx: 112 },
    loom: { bg: 'shop', tool: 'none', act: 'type', hat: 'cap', hatColor: '#7d3c98', wx: 106 },
    shoe: { bg: 'workshop', tool: 'hammer', act: 'swing-s', wx: 112 },
    bag: { bg: 'shop', tool: 'needle', act: 'saw', hat: 'puff', wx: 118 },
    embroider: { bg: 'shop', tool: 'needle', act: 'sway', hat: 'wrap', wx: 106 },
    washer: { bg: 'bench', tool: 'none', act: 'sway', hat: 'puff', wx: 112, fx: ['bubbles', 240, 112] },
    hair: { bg: 'salon', tool: 'comb', act: 'stroke-s', hat: 'puff', wx: 140 },
    barber: { bg: 'salon', tool: 'clipper', act: 'saw', wx: 140, fx: ['dust', 236, 104, '#1b1410'] },
    makeup: { bg: 'salon', tool: 'brush', act: 'stroke-s', hat: 'puff', wx: 140, fx: ['sparkles', 214, 82] },
    gele: { bg: 'salon', tool: 'none', act: 'sway', hat: 'wrap', hatColor: '#7d3c98', wx: 140 },
    wig: { bg: 'salon', tool: 'comb', act: 'stroke-s', hat: 'puff', wx: 150 },
    nails: { bg: 'salon', tool: 'brush', act: 'sway', hat: 'puff', wx: 136, fx: ['sparkles', 236, 104] },
    soap: { bg: 'kitchen', tool: 'spoon', act: 'stir', hat: 'wrap', hatColor: '#2f9e74', wx: 112 },
    spa: { bg: 'salon', tool: 'none', act: 'stroke-s', hat: 'puff', outfit: '#ffffff', wx: 110, fx: ['steam', 236, 104] },
    pottery: { bg: 'workshop', tool: 'none', act: 'sway', hat: 'wrap', wx: 140 },
    carve: { bg: 'workshop', tool: 'mallet', act: 'swing', wx: 148, fx: ['dust', 234, 110, '#a0683c'] },
    cast: { bg: 'workshop', tool: 'tongs', act: 'sway', hat: 'cap', wx: 120, fx: ['sparks', 254, 146] },
    basket: { bg: 'farm', tool: 'none', act: 'type', hat: 'wrap', wx: 128 },
    calabash: { bg: 'shop', tool: 'knife', act: 'sway', wx: 130 },
    ring: { bg: 'bench', tool: 'pliers', act: 'turn', wx: 150, fx: ['sparkles', 262, 104] },
    beads: { bg: 'shop', tool: 'pliers', act: 'turn', hat: 'puff', wx: 118 },
    camera: { bg: 'studio', tool: 'camera', act: 'pose', hat: 'cap', hatColor: '#2a2e31', wx: 108, fx: ['flash', 206, 80] },
    video: { bg: 'studio', tool: 'none', act: 'type', hat: 'cap', hatColor: '#2a2e31', wx: 106 },
    mixer: { bg: 'studio', tool: 'none', act: 'type', hat: 'phones', wx: 112, fx: ['notes', 256, 56] },
    turntable: { bg: 'studio', tool: 'none', act: 'type', hat: 'phones', wx: 112, fx: ['notes', 240, 70] },
    content: { bg: 'office', tool: 'phone', act: 'wave', hat: 'puff', wx: 140, fx: ['hearts', 262, 82] },
    easel: { bg: 'workshop', tool: 'brush', act: 'stroke-s', hat: 'wrap', wx: 124 },
    balloons: { bg: 'hotel', tool: 'none', act: 'wave', hat: 'puff', wx: 118, fx: ['sparkles', 250, 70] },
    interior: { bg: 'office', tool: 'hammer', act: 'swing-s', hat: 'puff', wx: 140 },
    print: { bg: 'workshop', tool: 'squeegee', act: 'saw', hat: 'cap', wx: 132 },
    survey: { bg: 'site', tool: 'none', act: 'sway', hat: 'hardhat', wx: 124 },
    flask: { bg: 'lab', tool: 'none', act: 'sway', outfit: '#ffffff', hat: 'puff', wx: 104 },
    refinery: { bg: 'industrial', tool: 'none', act: 'turn', hat: 'hardhat', outfit: '#e67e22', wx: 108 },
    mast: { bg: 'site', tool: 'wrench', act: 'turn', hat: 'hardhat', outfit: '#e67e22', wx: 112, fx: ['waves', 252, 28] },
    delivery: { bg: 'road', worker: false },
    pos: { bg: 'shop', tool: 'none', act: 'type', hat: 'puff', wx: 140, fx: ['sparkles', 236, 58] }
  };
  ['code', 'web', 'chart', 'shield', 'network', 'social', 'ui', 'design', 'anim', 'ledger', 'cad'].forEach(function (k) { D['screen-' + k] = { bg: 'office', tool: 'none', act: 'type', wx: 98 }; });

  var OUTFITS = {
    construction: '#e67e22', electrical: '#2a5aa8', electronics: '#1d5a46', auto: '#34495e', metal: '#5d6d7e', wood: '#8e5b33', food: '#ffffff', agric: '#3f8f5b',
    fashion: '#7d3c98', beauty: '#d35b8f', crafts: '#b5653d', creative: '#2c3e50', digital: '#1d5a46', technical: '#e67e22', business: '#2a5aa8'
  };

  function hash(str) { var h = 0; for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h; }

  function render(trade, opts) {
    opts = opts || {};
    var key = trade.scene, d = D[key] || D.wall, h = hash(trade.id);
    var bg = (BG[d.bg] || BG.workshop)();
    var prop = PROPS[key] ? PROPS[key](trade.tint) : '';
    var who = '';
    if (d.worker !== false) {
      var hat = d.hat || ['short', 'puff', 'wrap', 'short'][h % 4];
      who = worker({ x: d.wx || 90, skin: SKINS[h % SKINS.length], outfit: d.outfit || OUTFITS[trade.cat] || '#1d5a46', pants: d.outfit === '#ffffff' ? '#34495e' : '#2c3e50', hat: hat, hatColor: d.hatColor, tool: d.tool, act: d.act });
    }
    var fx = d.fx ? FX[d.fx[0]](d.fx[1], d.fx[2], d.fx[3]) : '';
    var label = opts.label || (trade.title + ' animation');
    return '<svg class="scene' + (opts.cls ? ' ' + opts.cls : '') + '" viewBox="0 0 320 200" role="img" aria-label="' + label.replace(/"/g, '&quot;') + '" preserveAspectRatio="xMidYMid slice">' + bg + prop + who + fx + '</svg>';
  }

  /* Pause animations for scenes that are off-screen, to save battery on phones. */
  var observer = null;
  function watch(root) {
    var scenes = (root || document).querySelectorAll('svg.scene');
    if (!('IntersectionObserver' in global)) return;
    if (!observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.target.classList.toggle('paused', !e.isIntersecting); });
      }, { rootMargin: '100px' });
    }
    for (var i = 0; i < scenes.length; i++) { scenes[i].classList.add('paused'); observer.observe(scenes[i]); }
  }

  function mountAll(root) {
    var slots = (root || document).querySelectorAll('[data-scene-for]');
    for (var i = 0; i < slots.length; i++) {
      var id = slots[i].getAttribute('data-scene-for');
      var t = (global.TRADES || []).filter(function (x) { return x.id === id; })[0];
      if (t && !slots[i].querySelector('svg.scene')) slots[i].insertAdjacentHTML('afterbegin', render(t, { cls: slots[i].getAttribute('data-scene-cls') || '' }));
    }
    watch(root);
  }

  global.Scenes = { render: render, mountAll: mountAll, watch: watch, keys: Object.keys(D) };
})(typeof window !== 'undefined' ? window : globalThis);
