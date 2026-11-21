// 🎄 다 같이 트리 꾸미기: 트리 그림 + 장식 그림 + 꾸미기 창
(function () {
  const LINE = '#5b4036';
  const COL = {
    red: '#e8474f', gold: '#f2c14e', blue: '#5b9cf0', pink: '#ff9db5', white: '#fffaf2', purple: '#a487e8', mint: '#7fd9c0',
    cream: '#fff6dc', sky: '#cfe6ff',
  };
  const shade = (h, t) => {
    const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).map((x) => Math.round(t < 0 ? x * (1 + t) : x + (255 - x) * t));
    return '#' + c.map((x) => x.toString(16).padStart(2, '0')).join('');
  };

  // ───────── 트리 모양 (viewBox 0 0 240 300) ─────────
  const TIERS = [
    { ax: 120, ay: 34, by: 108, hw: 54 },
    { ax: 120, ay: 74, by: 178, hw: 80 },
    { ax: 120, ay: 132, by: 258, hw: 106 },
  ];
  function onTree(x, y) {
    return TIERS.some((t) => y > t.ay + 10 && y < t.by - 1 && Math.abs(x - 120) <= t.hw * (y - t.ay) / (t.by - t.ay) - 3);
  }
  const onGround = (x, y) => y >= 256 && y <= 294 && x >= 14 && x <= 226;

  function tierPath(t) {
    // 아래가 몽글몽글한 삼각형
    const n = Math.round(t.hw / 13);
    const L = t.ax - t.hw, R = t.ax + t.hw, w = (R - L) / n;
    let d = `M${t.ax} ${t.ay} Q${t.ax + 6} ${t.ay + 2} ${R - 2} ${t.by - 6} Q${R + 2} ${t.by + 2} ${R - 4} ${t.by + 2}`;
    for (let i = n - 1; i >= 0; i--) {
      const x0 = L + w * (i + 1) - 4, x1 = L + w * i + (i === 0 ? 4 : 0);
      d += ` Q${(x0 + x1) / 2} ${t.by + 11} ${x1} ${t.by + 2}`;
    }
    d += ` Q${L - 2} ${t.by + 2} ${L + 2} ${t.by - 6} Q${t.ax - 6} ${t.ay + 2} ${t.ax} ${t.ay} Z`;
    return d;
  }
  function treeBase(lightsOn) {
    const tiers = TIERS.slice().reverse().map((t) => `
      <path d="${tierPath(t)}" fill="#3f9c6d" stroke="${LINE}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M${t.ax - 4} ${t.ay + 14} Q${t.ax - t.hw * 0.45} ${(t.ay + t.by) / 2} ${t.ax - t.hw * 0.72} ${t.by - 6}" stroke="#5fbf86" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>
      <path d="M${t.ax - t.hw + 8} ${t.by + 1} Q${t.ax} ${t.by + 8} ${t.ax + t.hw - 8} ${t.by + 1}" stroke="#2f7f57" stroke-width="4" fill="none" opacity=".45"/>
      ${[-0.6, -0.2, 0.25, 0.65].map((f, i) => `<circle cx="${t.ax + f * t.hw}" cy="${t.by + 3 + (i % 2) * 2}" r="2.2" fill="#fff" opacity=".9"/>`).join('')}`).join('');
    return `
      ${lightsOn ? '<circle cx="120" cy="160" r="130" fill="url(#treeGlow)"/>' : ''}
      <ellipse cx="120" cy="284" rx="112" ry="12" fill="#000" opacity=".1"/>
      <rect x="105" y="250" width="30" height="34" rx="4" fill="#9a5e38" stroke="${LINE}" stroke-width="3"/>
      <path d="M112 256 L112 280 M126 258 L126 282" stroke="#7a4527" stroke-width="2" opacity=".5"/>
      ${tiers}`;
  }
  function topper(v) {
    const g = (inner) => `<g transform="translate(120 30)">${inner}</g>`;
    if (v === 'bow') return g(`<path d="M0 0 C-10 -14 -26 -10 -22 0 C-20 8 -8 6 0 0 Z" fill="#e8474f" stroke="${LINE}" stroke-width="2.4"/>
      <path d="M0 0 C10 -14 26 -10 22 0 C20 8 8 6 0 0 Z" fill="#e8474f" stroke="${LINE}" stroke-width="2.4"/>
      <path d="M-3 3 L-12 20 L-6 18 L-3 23 Z M3 3 L12 20 L6 18 L3 23 Z" fill="#d23b44" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>
      <circle r="5.5" fill="#ff6b73" stroke="${LINE}" stroke-width="2.4"/>`);
    if (v === 'snow') return g(`<g stroke="#8fc4f5" stroke-width="7" stroke-linecap="round">${[0, 60, 120].map((a) => `<path d="M0 -17 L0 17" transform="rotate(${a})"/>`).join('')}</g>
      <g stroke="#fff" stroke-width="3.6" stroke-linecap="round" fill="none">${[0, 60, 120, 180, 240, 300].map((a) => `<g transform="rotate(${a})"><path d="M0 0 L0 -16"/><path d="M0 -10 L-5 -14 M0 -10 L5 -14"/></g>`).join('')}</g>
      <circle r="4" fill="#fff" stroke="#8fc4f5" stroke-width="2"/>`);
    if (v === 'moon') return g(`<path d="M6 -18 A18 18 0 1 0 6 18 A13 13 0 1 1 6 -18 Z" fill="#ffd96b" stroke="${LINE}" stroke-width="2.6" stroke-linejoin="round"/>
      <circle cx="12" cy="-6" r="2.2" fill="#ffd96b" stroke="${LINE}" stroke-width="1.4"/><circle cx="16" cy="6" r="1.6" fill="#ffd96b" stroke="${LINE}" stroke-width="1.2"/>
      <ellipse cx="-8" cy="4" rx="2" ry="1.4" fill="#ff9db5" opacity=".8"/>`);
    // 별
    const pts = Array.from({ length: 10 }, (_, i) => { const r = i % 2 ? 9 : 21, a = -Math.PI / 2 + i * Math.PI / 5; return `${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`; }).join(' L');
    return g(`<circle r="26" fill="#ffe58a" opacity=".35" class="glowy"/><path d="M${pts} Z" fill="#ffd34d" stroke="${LINE}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M-5 -6 L-2 -11" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>`);
  }

  // ───────── 장식 그림 (가운데 0,0 · 지름 ~16) ─────────
  function orn(k, c) {
    const col = COL[c] || COL.red;
    switch (k) {
      case 'ball': return `<path d="M0 -12 L0 -9" stroke="${LINE}" stroke-width="1.2"/>
        <rect x="-3" y="-10.5" width="6" height="4" rx="1" fill="#e6c35a" stroke="${LINE}" stroke-width="1.4"/>
        <circle r="7.5" fill="${col}" stroke="${LINE}" stroke-width="1.8"/>
        <path d="M-7 1 Q0 4 7 1" stroke="${shade(col, -0.18)}" stroke-width="1.8" fill="none" opacity=".7"/>
        <ellipse cx="-2.8" cy="-2.6" rx="2" ry="2.8" fill="#fff" opacity=".6" transform="rotate(25 -2.8 -2.6)"/>`;
      case 'cane': return `<path d="M2 10 L2 -3 Q2 -9 -3.5 -9 Q-8 -9 -8 -4.5" stroke="${LINE}" stroke-width="6.4" fill="none" stroke-linecap="round"/>
        <path d="M2 10 L2 -3 Q2 -9 -3.5 -9 Q-8 -9 -8 -4.5" stroke="#fff" stroke-width="3.8" fill="none" stroke-linecap="round"/>
        <path d="M2 10 L2 -3 Q2 -9 -3.5 -9 Q-8 -9 -8 -4.5" stroke="#e8474f" stroke-width="3.8" fill="none" stroke-dasharray="2.6 2.6"/>`;
      case 'bell': return `<path d="M-1.5 -11 Q0 -13 1.5 -11" stroke="${LINE}" stroke-width="1.4" fill="none"/>
        <circle cy="7" r="2.4" fill="#d9a534" stroke="${LINE}" stroke-width="1.4"/>
        <path d="M-8 6 Q-8.5 -1 -6 -5 Q-3.5 -9.5 0 -9.5 Q3.5 -9.5 6 -5 Q8.5 -1 8 6 Q0 8.5 -8 6 Z" fill="#f2c14e" stroke="${LINE}" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M-7.5 3 Q0 5 7.5 3" stroke="#d9a534" stroke-width="1.6" fill="none"/>
        <path d="M-3.5 -5 Q-4.5 -1 -4.5 2" stroke="#fff" stroke-width="1.6" fill="none" opacity=".7" stroke-linecap="round"/>
        <path d="M0 -10 C-4 -15 -9 -12 -6 -9 Z M0 -10 C4 -15 9 -12 6 -9 Z" fill="#e8474f" stroke="${LINE}" stroke-width="1.2"/>`;
      case 'bow': return `<path d="M0 0 C-5 -8 -12 -6 -11 -1 C-10 3 -4 2 0 0 Z M0 0 C5 -8 12 -6 11 -1 C10 3 4 2 0 0 Z" fill="#e8474f" stroke="${LINE}" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="M-1.5 1.5 L-6 10 L-3 9 L-1.5 11.5 Z M1.5 1.5 L6 10 L3 9 L1.5 11.5 Z" fill="#d23b44" stroke="${LINE}" stroke-width="1.4" stroke-linejoin="round"/>
        <circle r="2.8" fill="#ff6b73" stroke="${LINE}" stroke-width="1.5"/>`;
      case 'ginger': return `<path d="M0 -11 a4.5 4.5 0 1 1 -0.01 0 Z M-3 -3.5 L-9 -3 Q-11 -1 -9 0.5 L-4 0.5 L-5.5 8 Q-5 10.5 -2.5 9.5 L0 4.5 L2.5 9.5 Q5 10.5 5.5 8 L4 0.5 L9 0.5 Q11 -1 9 -3 L3 -3.5 Z"
          fill="#c9834e" stroke="${LINE}" stroke-width="1.6" stroke-linejoin="round"/>
        <circle cx="-1.6" cy="-7.5" r=".9" fill="${LINE}"/><circle cx="1.6" cy="-7.5" r=".9" fill="${LINE}"/>
        <path d="M-1.6 -5.4 Q0 -4.3 1.6 -5.4" stroke="${LINE}" stroke-width=".9" fill="none"/>
        <path d="M-8 -1.3 L-6 -1.3 M6 -1.3 L8 -1.3" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/>
        <circle cy="-.5" r="1" fill="#e8474f"/><circle cy="2.5" r="1" fill="#3f9c6d"/>`;
      case 'snow': return `<g stroke="#8fc4f5" stroke-width="4" stroke-linecap="round">${[0, 60, 120].map((a) => `<path d="M0 -9 L0 9" transform="rotate(${a})"/>`).join('')}</g>
        <g stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none">${[0, 60, 120, 180, 240, 300].map((a) => `<g transform="rotate(${a})"><path d="M0 0 L0 -8.5"/><path d="M0 -5.5 L-2.6 -7.6 M0 -5.5 L2.6 -7.6"/></g>`).join('')}</g>`;
      case 'star': {
        const pts = Array.from({ length: 10 }, (_, i) => { const r = i % 2 ? 4 : 9.5, a = -Math.PI / 2 + i * Math.PI / 5; return `${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`; }).join(' L');
        return `<path d="M${pts} Z" fill="#ffd34d" stroke="${LINE}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="-2" cy="-2.5" r="1.2" fill="#fff" opacity=".8"/>`;
      }
      case 'sock': return `<path d="M-4 -8 L4 -8 L4 2 Q4 4 6 5 L8 6 Q10 9 7 10 L-1 10 Q-5 10 -5 6 L-4 -8 Z" fill="#e8474f" stroke="${LINE}" stroke-width="1.6" stroke-linejoin="round"/>
        <rect x="-5.5" y="-11" width="11" height="5" rx="2.5" fill="#fffaf2" stroke="${LINE}" stroke-width="1.6"/>
        <path d="M-2 0 L2 0 M-2 4 L2 4" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".8"/>`;
      case 'light': return `<rect x="-2.5" y="-9" width="5" height="4" rx="1" fill="#4d5a52" stroke="${LINE}" stroke-width="1.1"/>
        <circle cy="0" r="9" fill="${col}" opacity=".28" class="halo"/>
        <path d="M0 -5.5 C5 -4 5 4 0 7 C-5 4 -5 -4 0 -5.5 Z" fill="${col}" stroke="${LINE}" stroke-width="1.4" class="bulb"/>
        <ellipse cx="-1.3" cy="-1" rx="1" ry="2" fill="#fff" opacity=".7"/>`;
      case 'wish': return `<path d="M0 -14 L0 -8" stroke="#e8474f" stroke-width="1.3"/>
        <g transform="rotate(-6)"><path d="M-8 -8 L4 -8 L9 -3 L9 8 L-8 8 Z" fill="${col}" stroke="${LINE}" stroke-width="1.6" stroke-linejoin="round"/>
        <circle cx="4.5" cy="-3.5" r="1.3" fill="#fff" stroke="${LINE}" stroke-width="1"/>
        <path d="M-5 -1 L3 -1 M-5 2.5 L5 2.5 M-5 6 L2 6" stroke="#c9a98f" stroke-width="1.2" stroke-linecap="round"/></g>`;
      case 'gift': return `<rect x="-11" y="-7" width="22" height="17" rx="2.5" fill="${col}" stroke="${LINE}" stroke-width="2"/>
        <rect x="-12.5" y="-11" width="25" height="6" rx="2" fill="${shade(col, 0.15)}" stroke="${LINE}" stroke-width="2"/>
        <rect x="-2.5" y="-11" width="5" height="21" fill="#fffaf2" stroke="${LINE}" stroke-width="1.4"/>
        <path d="M0 -11 C-4 -18 -11 -16 -7 -11 Z M0 -11 C4 -18 11 -16 7 -11 Z" fill="#fffaf2" stroke="${LINE}" stroke-width="1.6"/>`;
    }
    return '';
  }
  // 줄 장식: 점들을 부드럽게 이어요
  function smooth(pts) {
    if (pts.length < 2) return '';
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
      d += ` Q${pts[i][0]} ${pts[i][1]} ${mx} ${my}`;
    }
    const l = pts[pts.length - 1];
    return d + ` L${l[0]} ${l[1]}`;
  }
  function along(pts, step) {
    // 줄을 따라 일정 간격의 점
    const out = []; let carry = step / 2;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      const len = Math.hypot(x1 - x0, y1 - y0);
      let t = carry;
      while (t <= len) { out.push([x0 + (x1 - x0) * t / len, y0 + (y1 - y0) * t / len]); t += step; }
      carry = t - len;
    }
    return out;
  }
  function garland(o, mine) {
    const d = smooth(o.pts);
    const hit = `<path d="${d}" stroke="transparent" stroke-width="12" fill="none" class="ghit"/>`;
    let g = '';
    if (o.c === 'tinsel') g = `<path d="${d}" stroke="${LINE}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".55"/>
      <path d="${d}" stroke="#f2c14e" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="${d}" stroke="#fff2b0" stroke-width="2" fill="none" stroke-dasharray="1.5 4" stroke-linecap="round"/>`;
    else if (o.c === 'ribbon') g = `<path d="${d}" stroke="${LINE}" stroke-width="7.4" fill="none" stroke-linecap="round"/>
      <path d="${d}" stroke="#e8474f" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="${d}" stroke="#fff" stroke-width="5" fill="none" stroke-dasharray="3 7" opacity=".85"/>`;
    else if (o.c === 'beads') {
      const dots = along(o.pts, 6);
      g = `<path d="${d}" stroke="#c9a98f" stroke-width="1" fill="none"/>` + dots.map(([x, y], i) =>
        `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="${['#fffaf2', '#e8474f', '#f2c14e'][i % 3]}" stroke="${LINE}" stroke-width="1"/>`).join('');
    } else { // lights
      const cs = ['#e8474f', '#f2c14e', '#5b9cf0', '#ff9db5', '#7fd9c0'];
      g = `<path d="${d}" stroke="#2c4a3a" stroke-width="1.6" fill="none"/>` + along(o.pts, 13).map(([x, y], i) =>
        `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" class="tw tw${i % 3}"><circle r="6" fill="${cs[i % 5]}" opacity=".25" class="halo"/>
          <path d="M0 -1 C3 0 3 5 0 7 C-3 5 -3 0 0 -1 Z" fill="${cs[i % 5]}" stroke="${LINE}" stroke-width="1" class="bulb"/></g>`).join('');
    }
    return `<g class="tg garland ${mine ? 'mine' : ''}" data-id="${o.id}">${g}${hit}</g>`;
  }
  function ornament(o, mine) {
    const tw = o.k === 'light' ? ` tw tw${o.id % 3}` : '';
    const s = o.k === 'gift' ? 1.15 : 1;
    return `<g class="tg orn ${mine ? 'mine' : ''}${tw}" data-id="${o.id}" transform="translate(${o.x} ${o.y}) rotate(${o.r || 0}) scale(${s})">${orn(o.k, o.c)}<circle r="11" fill="transparent"/></g>`;
  }
  function svg(tree, opts = {}) {
    const items = (tree && tree.items) || [];
    const me = opts.uid;
    const gar = items.filter((o) => o.k === 'garland').map((o) => garland(o, o.uid === me)).join('');
    const orns = items.filter((o) => o.k !== 'garland' && o.k !== 'gift').map((o) => ornament(o, o.uid === me)).join('');
    const gifts = items.filter((o) => o.k === 'gift').sort((a, b) => a.y - b.y).map((o) => ornament(o, o.uid === me)).join('');
    return `<svg class="tree-svg ${opts.lights ? 'lit' : ''}" viewBox="0 0 240 300" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="treeGlow"><stop offset="0" stop-color="#fff3b0" stop-opacity=".55"/><stop offset="1" stop-color="#fff3b0" stop-opacity="0"/></radialGradient></defs>
      ${treeBase(opts.lights)}
      <g class="tgar">${gar}</g>
      <g class="torn">${orns}</g>
      ${topper(tree ? tree.top : 'star')}
      <g class="tgift">${gifts}</g>
      ${opts.preview || ''}
    </svg>`;
  }

  window.Tree = { svg, orn, topper, onTree, onGround };

  // ───────── 꾸미기 창 ─────────
  const PALETTE = {
    orn: [
      ['ball', 'red', '빨강'], ['ball', 'gold', '금색'], ['ball', 'blue', '파랑'], ['ball', 'pink', '분홍'], ['ball', 'white', '하양'], ['ball', 'purple', '보라'], ['ball', 'mint', '민트'],
      ['cane', '', '지팡이'], ['bell', '', '종'], ['bow', '', '리본'], ['ginger', '', '진저'], ['snow', '', '눈꽃'], ['star', '', '별'], ['sock', '', '양말'],
      ['light', 'red', '전구'], ['light', 'gold', '전구'], ['light', 'blue', '전구'], ['light', 'pink', '전구'], ['light', 'mint', '전구'],
    ],
    garland: [['tinsel', '반짝이 줄'], ['beads', '구슬 줄'], ['lights', '전구 줄'], ['ribbon', '리본 줄']],
    top: [['star', '별'], ['bow', '리본'], ['snow', '눈꽃'], ['moon', '달']],
    gift: [['gift', 'red'], ['gift', 'blue'], ['gift', 'pink'], ['gift', 'mint'], ['gift', 'gold']],
    wish: [['wish', 'cream'], ['wish', 'pink'], ['wish', 'mint'], ['wish', 'sky']],
  };
  const icon = (inner, vb = '-13 -15 26 28') => `<span class="ic"><svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${inner}</svg></span>`;
  const gIcon = (c) => icon(garland({ id: 0, c, pts: [[-11, -4], [-3, 4], [5, 4], [12, -4]] }).replace(/class="ghit"[^>]*/, ''), '-14 -10 28 20');

  window.TreeUI = function (api) {
    const $ = (s) => document.querySelector(s);
    let tree = { items: [], top: 'star' }, open = false, tab = 'orn', sel = { k: 'ball', c: 'red' }, lights = false;
    let drawing = null, drag = null, popId = null, wishText = '';
    const view = () => $('#treeView');

    const mine = () => tree.items.filter((o) => o.uid === api.myUid());
    function renderView() {
      if (!open) return;
      const pv = drawing && drawing.pts.length > 1 ? garland({ id: -1, c: drawing.c, pts: drawing.pts }) : '';
      view().innerHTML = Tree.svg(tree, { uid: api.myUid(), lights, preview: pv });
      view().classList.toggle('night', lights);
      if (drag) { const g = view().querySelector(`.tg[data-id="${drag.id}"]`); if (g) g.classList.add('dragging'); }
    }
    function renderPanel() {
      const my = mine(), nOrn = my.filter((o) => o.k !== 'garland').length, nG = my.filter((o) => o.k === 'garland').length;
      document.querySelectorAll('#treeTabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
      let body = '';
      if (tab === 'orn') body = `<p class="chint">장식을 고르고 <b>트리를 톡</b> 누르면 달려요. 내 장식은 끌어서 옮길 수 있어요</p>
        <div class="cbtns tree-pal">${PALETTE.orn.map(([k, c, n]) => `<button class="cbtn sm ${sel.k === k && sel.c === c ? 'on' : ''}" data-k="${k}" data-c="${c}">${icon(orn(k, c))}<small>${n}</small></button>`).join('')}</div>`;
      else if (tab === 'garland') body = `<p class="chint">줄을 고르고 트리 위를 <b>쭉 그어서</b> 걸어요 (${nG}/4)</p>
        <div class="cbtns">${PALETTE.garland.map(([c, n]) => `<button class="cbtn ${sel.k === 'garland' && sel.c === c ? 'on' : ''}" data-k="garland" data-c="${c}">${gIcon(c)}<small>${n}</small></button>`).join('')}</div>`;
      else if (tab === 'top') body = `<p class="chint">트리 꼭대기 장식을 바꿔요 (모두 같이 써요)</p>
        <div class="cbtns">${PALETTE.top.map(([v, n]) => `<button class="cbtn ${tree.top === v ? 'on' : ''}" data-top="${v}">${icon(topper(v).replace('translate(120 30)', 'translate(0 0)'), '-28 -28 56 56')}<small>${n}</small></button>`).join('')}</div>`;
      else if (tab === 'gift') body = `<p class="chint">선물 상자를 고르고 <b>트리 아래 바닥</b>을 톡 눌러 놓아요</p>
        <div class="cbtns tree-pal">${PALETTE.gift.map(([k, c]) => `<button class="cbtn sm ${sel.k === k && sel.c === c ? 'on' : ''}" data-k="${k}" data-c="${c}">${icon(orn(k, c), '-15 -19 30 31')}</button>`).join('')}</div>`;
      else if (tab === 'wish') body = `<p class="chint">🎅 산타 할아버지께 바라는 선물을 적어서 트리에 걸어요</p>
        <textarea id="wishInput" class="wish-input" maxlength="40" placeholder="예) 귀여운 털장갑 받고 싶어요!">${esc(wishText)}</textarea>
        <div class="cbtns tree-pal">${PALETTE.wish.map(([k, c]) => `<button class="cbtn sm ${sel.k === k && sel.c === c ? 'on' : ''}" data-k="${k}" data-c="${c}">${icon(orn(k, c), '-11 -15 22 25')}</button>`).join('')}</div>
        <p class="chint small">카드 색을 고르고 트리를 톡 누르면 걸려요</p>`;
      $('#treePanel').innerHTML = `${body}
        <div class="tree-foot">
          <span class="tcount">내 장식 ${nOrn}/24</span>
          <button class="btn ghost small" data-act="undo" ${my.length ? '' : 'disabled'}>↩ 방금 거 떼기</button>
          <button class="btn ghost small ${lights ? 'on' : ''}" data-act="lights">${lights ? '🌙 불 끄기' : '✨ 불 켜기'}</button>
        </div>`;
      const wi = $('#wishInput');
      if (wi) wi.addEventListener('input', () => { wishText = wi.value; });
    }
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    function render() { if (!open) return; renderView(); renderPanel(); }

    function pt(e) {
      const s = view().querySelector('svg'); if (!s) return null;
      const p = s.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
      return p.matrixTransform(s.getScreenCTM().inverse());
    }
    function showPop(o, e) {
      const pop = $('#treePop');
      const wrap = view().getBoundingClientRect();
      const mineO = o.uid === api.myUid();
      const names = { ball: '방울', cane: '지팡이 사탕', bell: '종', bow: '리본', ginger: '진저브레드', snow: '눈꽃', star: '별', sock: '양말', light: '전구', wish: '소원 카드', gift: '선물 상자', garland: '줄 장식' };
      pop.innerHTML = o.k === 'wish'
        ? `<div class="wish-card"><small>${esc(o.nick)} 님의 소원</small><p>${esc(o.txt)}</p></div>${mineO ? '<button class="btn ghost small" data-act="del">떼기</button>' : ''}`
        : `<small>${esc(o.nick)} 님이 단 ${names[o.k] || '장식'}</small>${mineO ? '<button class="btn ghost small" data-act="del">떼기</button>' : ''}`;
      pop.style.left = Math.min(wrap.width - 150, Math.max(4, e.clientX - wrap.left - 70)) + 'px';
      pop.style.top = Math.max(4, e.clientY - wrap.top - (o.k === 'wish' ? 110 : 60)) + 'px';
      pop.hidden = false; popId = o.id;
    }
    const hidePop = () => { $('#treePop').hidden = true; popId = null; };

    view().addEventListener('pointerdown', (e) => {
      if (!open) return;
      const p = pt(e); if (!p) return;
      const g = e.target.closest('.tg');
      if (g) {
        const o = tree.items.find((x) => x.id === Number(g.dataset.id));
        if (!o) return;
        e.preventDefault();
        if (o.uid === api.myUid() && o.k !== 'garland') {
          drag = { id: o.id, o, sx: p.x, sy: p.y, ox: o.x, oy: o.y, moved: false, ev: e };
          try { view().setPointerCapture(e.pointerId); } catch (_) {}
        } else showPop(o, e);
        return;
      }
      hidePop();
      if (sel.k === 'garland') {
        if (!Tree.onTree(p.x, p.y) && p.y > 262) return;
        drawing = { c: sel.c, pts: [[Math.round(p.x), Math.round(p.y)]] };
        try { view().setPointerCapture(e.pointerId); } catch (_) {}
        e.preventDefault();
        return;
      }
      // 장식 달기
      const ground = sel.k === 'gift';
      if (ground ? !Tree.onGround(p.x, p.y) : !Tree.onTree(p.x, p.y)) {
        api.toast(ground ? '선물은 트리 아래 바닥에 놓아요 🎁' : '트리 위를 눌러 주세요 🎄');
        return;
      }
      const o = { k: sel.k, c: sel.c, x: Math.round(p.x), y: Math.round(p.y), r: sel.k === 'ball' || sel.k === 'light' ? 0 : Math.round(Math.random() * 20 - 10) };
      if (sel.k === 'wish') {
        const t = (wishText || '').trim();
        if (!t) { api.toast('먼저 소원을 적어 주세요 ✍️'); const wi = $('#wishInput'); if (wi) wi.focus(); return; }
        o.txt = t; wishText = '';
      }
      api.send({ t: 'tree', act: 'add', o });
      api.Sound.Sfx.plop();
    });
    view().addEventListener('pointermove', (e) => {
      if (drag) {
        const p = pt(e); if (!p) return;
        const nx = drag.ox + p.x - drag.sx, ny = drag.oy + p.y - drag.sy;
        if (Math.hypot(p.x - drag.sx, p.y - drag.sy) > 3) drag.moved = true;
        drag.o.x = Math.round(nx); drag.o.y = Math.round(ny);
        const g = view().querySelector(`.tg[data-id="${drag.id}"]`);
        if (g) { g.setAttribute('transform', `translate(${drag.o.x} ${drag.o.y}) rotate(${drag.o.r || 0}) scale(${drag.o.k === 'gift' ? 1.15 : 1})`); g.classList.add('dragging'); }
      } else if (drawing) {
        const p = pt(e); if (!p) return;
        const l = drawing.pts[drawing.pts.length - 1];
        if (Math.hypot(p.x - l[0], p.y - l[1]) >= 9 && drawing.pts.length < 24) {
          drawing.pts.push([Math.round(Math.max(0, Math.min(240, p.x))), Math.round(Math.max(0, Math.min(300, p.y)))]);
          renderView();
        }
      }
    });
    function endPointer() {
      if (drag) {
        const d = drag; drag = null;
        if (!d.moved) { d.o.x = d.ox; d.o.y = d.oy; showPop(d.o, d.ev); renderView(); return; }
        const ok = d.o.k === 'gift' ? Tree.onGround(d.o.x, d.o.y) : Tree.onTree(d.o.x, d.o.y);
        if (!ok) { d.o.x = d.ox; d.o.y = d.oy; renderView(); api.toast(d.o.k === 'gift' ? '선물은 바닥에 놓아요' : '트리 위에만 달 수 있어요'); return; }
        api.send({ t: 'tree', act: 'move', id: d.id, x: d.o.x, y: d.o.y });
        api.Sound.Sfx.pop();
      } else if (drawing) {
        const dr = drawing; drawing = null;
        if (dr.pts.length >= 3) { api.send({ t: 'tree', act: 'add', o: { k: 'garland', c: dr.c, pts: dr.pts } }); api.Sound.Sfx.sparkle(); }
        else renderView();
      }
    }
    view().addEventListener('pointerup', endPointer);
    view().addEventListener('pointercancel', endPointer);

    $('#treePanel').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b || b.disabled) return;
      if (b.dataset.k) { sel = { k: b.dataset.k, c: b.dataset.c }; api.Sound.Sfx.pop(); renderPanel(); }
      else if (b.dataset.top) api.send({ t: 'tree', act: 'top', v: b.dataset.top });
      else if (b.dataset.act === 'lights') { lights = !lights; if (lights) api.Sound.Sfx.sparkle(); render(); }
      else if (b.dataset.act === 'undo') {
        const my = mine();
        const last = my.reduce((a, o) => (!a || o.id > a.id ? o : a), null);
        if (last) api.send({ t: 'tree', act: 'del', id: last.id });
      }
    });
    $('#treePop').addEventListener('click', (e) => {
      if (e.target.closest('[data-act=del]') && popId != null) { api.send({ t: 'tree', act: 'del', id: popId }); api.Sound.Sfx.pop(); hidePop(); }
    });
    document.querySelectorAll('#treeTabs button').forEach((b) => b.addEventListener('click', () => {
      tab = b.dataset.tab; hidePop();
      const first = { orn: { k: 'ball', c: 'red' }, garland: { k: 'garland', c: 'tinsel' }, gift: { k: 'gift', c: 'red' }, wish: { k: 'wish', c: 'cream' } }[tab];
      if (first && !(tab === 'orn' ? !['garland', 'gift', 'wish'].includes(sel.k) : sel.k === first.k)) sel = first;
      render();
    }));
    document.querySelectorAll('[data-close-tree]').forEach((b) => b.addEventListener('click', () => api.close()));

    return {
      setTree(t) { tree = t || tree; if (!drag && !drawing) render(); },
      setOpen(v) { open = v; if (!v) { hidePop(); drag = null; drawing = null; } render(); },
    };
  };
})();
