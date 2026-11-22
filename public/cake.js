// 🎂 다 같이 케이크 만들기 — 화면 그리기와 조작
(function () {
  const LINE = '#5b4036';
  const INGR = {
    flour: { name: '밀가루', need: true },
    sugar: { name: '설탕', need: true },
    salt: { name: '소금', need: true },
    egg: { name: '계란', need: true },
    milk: { name: '우유', need: true },
    butter: { name: '버터', need: true },
    cocoa: { name: '코코아', color: '#7a4b31' },
    matcha: { name: '말차', color: '#8fbf5a' },
    berry: { name: '딸기', color: '#ff9db5' },
    redvelvet: { name: '레드벨벳', color: '#c8323f' },
    pumpkin: { name: '단호박', color: '#ffb03b' },
    blueberry: { name: '블루베리', color: '#8c7ae6' },
    banana: { name: '바나나', color: '#ffe066' },
    sesame: { name: '흑임자', color: '#5f5a58' },
    butterfly: { name: '버터플라이', color: '#5b8def' },
  };
  const FLAVORS = ['cocoa', 'matcha', 'berry', 'redvelvet', 'pumpkin', 'blueberry', 'banana', 'sesame', 'butterfly'];
  const FRUITS = {
    strawberry: { name: '딸기', color: '#ff86a6' },
    blueberry: { name: '블루베리', color: '#8b7cf2' },
    mango: { name: '망고', color: '#ffc23d' },
    kiwi: { name: '키위', color: '#93d35a' },
    tangerine: { name: '귤', color: '#ff9f43' },
    choco: { name: '초콜릿', color: '#6b3f2a' },
  };
  const TOPS = [
    ['rosette', '생크림'], ['strawberry', '딸기'], ['cherry', '체리'], ['blueberry', '블루베리'], ['macaron', '마카롱'],
    ['mint', '민트'], ['chocoheart', '초코하트'], ['sprinkle', '스프링클'], ['holly', '호랑가시'], ['star', '별'], ['candle', '초'],
  ];
  const STEPS = [
    ['ingredients', '재료'], ['mixing', '섞기'], ['baking', '굽기'], ['cream', '크림'], ['spread', '바르기'],
    ['decorate', '토핑'], ['done', '촛불'], ['eating', '먹기'],
  ];
  const SPREAD_N = 14;
  const CREAM_BASE = '#fffaf2';
  const SHEET_BASE = '#f6dca5';

  // ───────── 색 ─────────
  const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const rgb2hex = (c) => '#' + c.map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('');
  function mix(base, colors, w) {
    let acc = hex2rgb(base).map((x) => x * w), tw = w;
    for (const col of colors) { const c = hex2rgb(col); acc = acc.map((x, i) => x + c[i]); tw += 1; }
    return rgb2hex(acc.map((x) => x / tw));
  }
  const shade = (hex, amt) => rgb2hex(hex2rgb(hex).map((x) => x + amt));
  function sheetColor(c) {
    const cols = [];
    for (const k of FLAVORS) for (let i = 0; i < (c.ingr[k] || 0); i++) cols.push(INGR[k].color);
    return mix(SHEET_BASE, cols, 1.6);
  }
  const creamColor = (c) => mix(CREAM_BASE, c.cream.map((f) => FRUITS[f].color), 2.4);

  // ───────── 재료 그림 ─────────
  function ingrIcon(k) {
    switch (k) {
      case 'flour': return `<path d="M-12 14 L-14 -6 Q-14 -12 -8 -12 L8 -12 Q14 -12 14 -6 L12 14 Z" fill="#f3e6cc" stroke="${LINE}" stroke-width="2"/>
        <path d="M-10 -12 Q0 -20 10 -12" fill="#fff" stroke="${LINE}" stroke-width="2"/><text y="7" font-size="11" text-anchor="middle" font-family="Jua" fill="${LINE}">밀</text>`;
      case 'sugar': return `<rect x="-13" y="-1" width="12" height="12" rx="2" fill="#fff" stroke="${LINE}" stroke-width="2"/>
        <rect x="1" y="-1" width="12" height="12" rx="2" fill="#fff" stroke="${LINE}" stroke-width="2"/>
        <rect x="-6" y="-13" width="12" height="12" rx="2" fill="#fff" stroke="${LINE}" stroke-width="2"/>
        <circle cx="-2" cy="-9" r="1.2" fill="#9fd3ff"/><circle cx="7" cy="4" r="1.2" fill="#9fd3ff"/>`;
      case 'salt': return `<path d="M-9 14 L-10 -4 Q-10 -8 -6 -8 L6 -8 Q10 -8 10 -4 L9 14 Z" fill="#fff" stroke="${LINE}" stroke-width="2"/>
        <path d="M-8 -8 Q-8 -16 0 -16 Q8 -16 8 -8 Z" fill="#c9d6e2" stroke="${LINE}" stroke-width="2"/>
        <circle cx="-3" cy="-12" r="1" fill="${LINE}"/><circle cx="3" cy="-12" r="1" fill="${LINE}"/><circle cx="0" cy="-14" r="1" fill="${LINE}"/>
        <text y="9" font-size="9" text-anchor="middle" font-family="Jua" fill="${LINE}">S</text>`;
      case 'egg': return `<path d="M0 -15 C10 -15 13 2 12 6 C11 13 6 15 0 15 C-6 15 -11 13 -12 6 C-13 2 -10 -15 0 -15 Z" fill="#fff8ec" stroke="${LINE}" stroke-width="2"/>
        <ellipse cx="-4" cy="-6" rx="2.5" ry="4" fill="#fff" opacity=".8"/>`;
      case 'milk': return `<path d="M-9 -6 L0 -15 L9 -6 L9 15 L-9 15 Z" fill="#fff" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M-9 -6 L9 -6" stroke="${LINE}" stroke-width="2"/><rect x="-9" y="1" width="18" height="7" fill="#7cc0ff"/>`;
      case 'butter': return `<ellipse cx="0" cy="9" rx="15" ry="5" fill="#eaf4ff" stroke="${LINE}" stroke-width="2"/>
        <path d="M-10 6 L-10 -4 L4 -9 L12 -4 L12 6 L-2 10 Z" fill="#ffe28a" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M-10 -4 L-2 0 L12 -4 M-2 0 L-2 10" fill="none" stroke="${LINE}" stroke-width="1.6"/>`;
      default: {
        const col = INGR[k].color;
        return `<path d="M-14 0 Q-14 14 0 14 Q14 14 14 0 Z" fill="#fff" stroke="${LINE}" stroke-width="2"/>
          <path d="M-11 0 Q-6 -10 0 -10 Q6 -10 11 0 Z" fill="${col}" stroke="${LINE}" stroke-width="1.6"/>
          <ellipse cx="0" cy="0" rx="14" ry="3.5" fill="none" stroke="${LINE}" stroke-width="2"/>`;
      }
    }
  }
  // 그릇 안 재료 덩어리 (섞기 전)
  const SLOTS = { flour: [118, 108], sugar: [168, 104], salt: [196, 116], egg: [148, 120], milk: [96, 120], butter: [186, 124],
    cocoa: [130, 100], matcha: [172, 118], berry: [110, 124], redvelvet: [140, 106], pumpkin: [200, 108], blueberry: [124, 116],
    banana: [160, 126], sesame: [90, 110], butterfly: [182, 100] };
  function blob(k, n) {
    if (!n) return '';
    const [x, y] = SLOTS[k];
    switch (k) {
      case 'flour': return `<path d="M${x - 18} ${y + 4} Q${x - 14} ${y - 10} ${x} ${y - 10} Q${x + 14} ${y - 10} ${x + 18} ${y + 4} Z" fill="#fffdf8" stroke="#e6dccb" stroke-width="1.5"/>`;
      case 'sugar': return [0, 1, 2].slice(0, n + 1).map((i) => `<rect x="${x - 8 + i * 6}" y="${y - 4 - (i % 2) * 4}" width="6" height="6" rx="1" fill="#fff" stroke="#cfd8e3"/>`).join('');
      case 'salt': return [0, 1, 2, 3, 4].map((i) => `<circle cx="${x - 6 + i * 3}" cy="${y + (i % 2) * 2}" r="1.3" fill="#c9d6e2"/>`).join('');
      case 'egg': return [...Array(n)].map((_, i) => `<ellipse cx="${x + i * 10}" cy="${y + i * 2}" rx="11" ry="5" fill="#fffef6" stroke="#eee3c8"/><circle cx="${x + i * 10}" cy="${y + i * 2}" r="4" fill="#ffc23d"/>`).join('');
      case 'milk': return `<ellipse cx="${x}" cy="${y}" rx="${12 + n * 3}" ry="${4 + n}" fill="#f7fbff" stroke="#dfeaf7"/>`;
      case 'butter': return `<path d="M${x - 6} ${y + 3} L${x - 6} ${y - 3} L${x + 3} ${y - 6} L${x + 8} ${y - 3} L${x + 8} ${y + 3} L${x - 1} ${y + 6} Z" fill="#ffe28a" stroke="#e8c45a"/>`;
      default: return `<path d="M${x - 12} ${y + 3} Q${x} ${y - 9 - n * 2} ${x + 12} ${y + 3} Z" fill="${INGR[k].color}"/>`;
    }
  }
  function bowl(inner, batter, batterOpacity, swirl) {
    return `<ellipse cx="150" cy="200" rx="118" ry="16" fill="#000" opacity=".08"/>
      <path d="M36 110 Q36 204 150 204 Q264 204 264 110 Z" fill="#e8f1ff" stroke="${LINE}" stroke-width="2.6"/>
      <ellipse cx="150" cy="110" rx="114" ry="32" fill="#f5f9ff" stroke="${LINE}" stroke-width="2.6"/>
      <ellipse cx="150" cy="114" rx="100" ry="24" fill="#f0e9dc"/>
      ${inner}
      <ellipse cx="150" cy="114" rx="100" ry="24" fill="${batter}" opacity="${batterOpacity}"/>
      ${swirl ? `<g fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity="${(0.25 + batterOpacity * 0.5).toFixed(2)}" class="swirl">
        <path d="M110 114 q20 -12 40 0 t40 0"/><path d="M125 122 q15 -8 30 0 t30 0"/></g>` : ''}`;
  }

  // ───────── 토핑 그림 (케이크 그림체에 맞춘 손그림) ─────────
  function topping(k, x, y, s, cream, lit) {
    const g = (inner) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s})">${inner}</g>`;
    switch (k) {
      case 'rosette': {
        // 크림 줄기가 비스듬히 감아 올라간 동글동글한 생크림 (끝은 옆으로 살짝 말림)
        const sh = shade(cream, -22), ln = shade(cream, -32), hi = '#ffffff';
        const body = 'M-13.2 -0.4 C-14.6 -7 -11 -13.6 -4.6 -16.4 C1.6 -19 9.4 -15.6 12.4 -9.6 C14.6 -5.2 13.4 -0.6 9.6 1.4 C4.6 3.6 -4.4 3.6 -9.4 2.4 C-11.4 1.9 -12.8 1 -13.2 -0.4 Z';
        const band = (d, w) => `<path d="${d}" fill="none" stroke="${sh}" stroke-width="${w}" stroke-linecap="round"/>
          <path d="${d}" transform="translate(0.3 -1.4)" fill="none" stroke="${hi}" stroke-width="${w * 0.5}" stroke-linecap="round" opacity=".9"/>`;
        return g(`<defs><clipPath id="rosClip"><path d="${body}"/></clipPath></defs>
          <ellipse cx="0" cy="1.6" rx="13.5" ry="3.4" fill="#000" opacity=".08"/>
          <path d="${body}" fill="${cream}"/>
          <g clip-path="url(#rosClip)">
            ${band('M-14 -3.6 Q-2 3.4 14 -5', 2)}
            ${band('M-13.6 -9.6 Q-1 -3.6 13.6 -11.6', 1.9)}
            ${band('M-9.6 -14.6 Q0 -10 9 -16.6', 1.7)}
          </g>
          <path d="${body}" fill="none" stroke="${ln}" stroke-width=".8" stroke-linejoin="round"/>
          <path d="M-3.6 -16.6 C-5.6 -19.4 -5 -22.6 -1.4 -24.4 C-2.2 -21.8 -0.8 -19.6 1.8 -18.2 C0 -16.8 -2 -16.4 -3.6 -16.6 Z"
            fill="${cream}" stroke="${ln}" stroke-width=".8" stroke-linejoin="round"/>
          <path d="M-3.2 -18.4 C-3.6 -20.2 -2.8 -22 -1.6 -23" fill="none" stroke="${hi}" stroke-width="1" stroke-linecap="round"/>
          <ellipse cx="-7.5" cy="-11.5" rx="2.4" ry="1.1" fill="${hi}" opacity=".85" transform="rotate(-25 -7.5 -11.5)"/>`);
      }
      case 'strawberry': return g(`<path d="M0 3 C-9 -2 -9 -12 0 -11 C9 -12 9 -2 0 3 Z" fill="#ff5470" stroke="${LINE}" stroke-width="1.5"/>
        <path d="M-5 -11 L0 -14 L5 -11 L2 -10 L0 -12 L-2 -10 Z" fill="#4fb07f" stroke="${LINE}" stroke-width="1.2" stroke-linejoin="round"/>
        <g fill="#ffe28a"><circle cx="-3" cy="-6" r=".9"/><circle cx="2" cy="-7" r=".9"/><circle cx="-1" cy="-2" r=".9"/><circle cx="4" cy="-3" r=".9"/></g>
        <ellipse cx="-3" cy="-8" rx="1.5" ry="2.5" fill="#fff" opacity=".5"/>`);
      case 'cherry': return g(`<path d="M0 -6 Q2 -16 8 -18" fill="none" stroke="#4f9c73" stroke-width="1.8" stroke-linecap="round"/>
        <circle cx="0" cy="-3" r="5.5" fill="#d92b45" stroke="${LINE}" stroke-width="1.5"/><circle cx="-2" cy="-5" r="1.5" fill="#fff" opacity=".7"/>`);
      case 'blueberry': return g(`<circle cx="0" cy="-3" r="4.5" fill="#5463d6" stroke="${LINE}" stroke-width="1.4"/>
        <path d="M-1.5 -7 L0 -5.5 L1.5 -7" fill="none" stroke="#2c3594" stroke-width="1.2"/><circle cx="-1.6" cy="-4.5" r="1" fill="#fff" opacity=".5"/>`);
      case 'macaron': return g(`<ellipse cx="0" cy="-2" rx="8" ry="3.5" fill="#ffb3c8" stroke="${LINE}" stroke-width="1.4"/>
        <rect x="-7" y="-7" width="14" height="4" fill="${CREAM_BASE}" stroke="${LINE}" stroke-width="1.2"/>
        <ellipse cx="0" cy="-8" rx="8" ry="3.5" fill="#ffc8d7" stroke="${LINE}" stroke-width="1.4"/>`);
      case 'mint': return g(`<path d="M0 0 C-9 -3 -10 -11 -4 -13 C-2 -8 -1 -4 0 0 Z" fill="#5cc28a" stroke="${LINE}" stroke-width="1.3"/>
        <path d="M0 0 C9 -3 10 -11 4 -13 C2 -8 1 -4 0 0 Z" fill="#7dd6a2" stroke="${LINE}" stroke-width="1.3"/>`);
      case 'chocoheart': return g(`<path d="M0 0 C-12 -8 -8 -18 0 -12 C8 -18 12 -8 0 0 Z" fill="#6b3f2a" stroke="${LINE}" stroke-width="1.4"/>
        <path d="M-4 -12 C-5 -10 -5 -9 -4 -8" stroke="#a87455" stroke-width="1.2" fill="none" stroke-linecap="round"/>`);
      case 'sprinkle': return g(['#e8474f', '#ffc94a', '#3f9c6d', '#8b7cf2', '#6fb6ff', '#ff86a6'].map((c, i) =>
        `<rect x="${-8 + (i % 3) * 6}" y="${-6 + Math.floor(i / 3) * 4}" width="5" height="1.8" rx=".9" fill="${c}" transform="rotate(${(i * 47) % 180} ${-5.5 + (i % 3) * 6} ${-5 + Math.floor(i / 3) * 4})"/>`).join(''));
      case 'holly': return g(`<path d="M0 -4 C4 -10 12 -10 15 -6 C11 -4 12 -2 15 -1 C10 2 4 1 0 -4 Z" fill="#3f9c6d" stroke="${LINE}" stroke-width="1.2"/>
        <path d="M0 -4 C-4 -10 -12 -10 -15 -6 C-11 -4 -12 -2 -15 -1 C-10 2 -4 1 0 -4 Z" fill="#4fb07f" stroke="${LINE}" stroke-width="1.2"/>
        <circle cx="-2.5" cy="-5" r="2.6" fill="#e8474f" stroke="${LINE}" stroke-width="1"/><circle cx="2.5" cy="-5" r="2.6" fill="#e8474f" stroke="${LINE}" stroke-width="1"/><circle cx="0" cy="-8.5" r="2.6" fill="#e8474f" stroke="${LINE}" stroke-width="1"/>`);
      case 'star': return g(`<path d="M0 -16 L2.8 -9 L10 -8.6 L4.4 -4 L6.3 3 L0 -1 L-6.3 3 L-4.4 -4 L-10 -8.6 L-2.8 -9 Z" fill="#ffd34d" stroke="${LINE}" stroke-width="1.4" stroke-linejoin="round"/>`);
      case 'candle': return g(`<rect x="-3.5" y="-24" width="7" height="24" rx="2" fill="#fff" stroke="${LINE}" stroke-width="1.4"/>
        <path d="M-3.5 -17 L3.5 -20 M-3.5 -9 L3.5 -12" stroke="#e8474f" stroke-width="2"/>
        ${lit ? `<path class="flame" d="M0 -37 C5 -30 4 -25 0 -25 C-4 -25 -5 -30 0 -37 Z" fill="#ffb33c"/><circle cx="0" cy="-28" r="2" fill="#fff6b0"/>`
               : `<path class="smoke" d="M0 -26 q3 -5 0 -9 q-3 -4 0 -8" fill="none" stroke="#bbb" stroke-width="1.6" stroke-linecap="round"/>`}`);
    }
    return '';
  }

  // ───────── 케이크 ─────────
  function rimItems() {
    const out = [];
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; out.push({ k: 'rosette', u: Math.cos(a) * 0.9, v: Math.sin(a) * 0.9 }); }
    return out;
  }
  function sideCake(c, { withCream = true, plate = true, s = 1 } = {}) {
    const cx = 150, top = 92, rx = 108, ry = 38, h = 82;
    const sheet = sheetColor(c), cream = creamColor(c);
    let out = plate ? `<ellipse cx="${cx}" cy="${top + h + 14}" rx="${rx + 26}" ry="${ry - 6}" fill="#eaf4ff" stroke="${LINE}" stroke-width="2.5"/>` : '';
    out += `<path d="M${cx - rx} ${top} L${cx - rx} ${top + h} A${rx} ${ry} 0 0 0 ${cx + rx} ${top + h} L${cx + rx} ${top} Z" fill="${sheet}" stroke="${LINE}" stroke-width="2.6"/>`;
    if (withCream) {
      // 옆면은 시트가 보이고, 가운데 크림층 + 위 크림이 흘러내린 모양
      const mid = top + h * 0.5;
      out += `<path d="M${cx - rx} ${mid} A${rx} ${ry} 0 0 0 ${cx + rx} ${mid} L${cx + rx} ${mid + 9} A${rx} ${ry} 0 0 1 ${cx - rx} ${mid + 9} Z" fill="${cream}"/>`;
      out += `<path d="M${cx - rx} ${top + h - 4} A${rx} ${ry} 0 0 0 ${cx + rx} ${top + h - 4}" fill="none" stroke="${cream}" stroke-width="6" stroke-dasharray="1 9" stroke-linecap="round"/>`;
      let drip = `M${cx - rx} ${top}`;
      const n = 11;
      for (let i = 0; i <= n; i++) {
        const ang = Math.PI - (i / n) * Math.PI;
        const x = cx + Math.cos(ang) * rx, y = top + Math.sin(ang) * ry;
        const d = [10, 18, 8, 15, 11, 20, 9, 16, 12, 18, 9, 13][i];
        drip += ` Q${(x - 4).toFixed(1)} ${(y + d + 4).toFixed(1)} ${x.toFixed(1)} ${(y + d * 0.4).toFixed(1)}`;
      }
      drip += ` L${cx + rx} ${top} Z`;
      out += `<path d="${drip}" fill="${cream}" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>`;
      out += `<ellipse cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}" fill="${cream}" stroke="${LINE}" stroke-width="2.6"/>`;
      out += `<path d="M${cx - 60} ${top - 4} Q${cx - 20} ${top - 18} ${cx + 30} ${top - 10}" fill="none" stroke="#fff" stroke-width="4" opacity=".5" stroke-linecap="round"/>`;
    } else {
      out += `<ellipse cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}" fill="${shade(sheet, -26)}" stroke="${LINE}" stroke-width="2.6"/>`;
      out += `<ellipse cx="${cx}" cy="${top}" rx="${rx - 10}" ry="${ry - 6}" fill="${shade(sheet, -10)}"/>`;
    }
    const items = [...(c.rim && withCream ? rimItems() : []), ...c.toppings].sort((a, b) => a.v - b.v);
    const lit = !c.candlesOut;
    for (const t of items) out += topping(t.k, cx + t.u * (rx - 12), top + t.v * (ry - 6) + 4, 1.25 * s, cream, lit);
    return out;
  }
  function topCake(c, { plate = true } = {}) {
    const cx = 150, cy = 118, r = 96;
    const sheet = sheetColor(c), cream = creamColor(c);
    let out = plate ? `<circle cx="${cx}" cy="${cy}" r="${r + 22}" fill="#eaf4ff" stroke="${LINE}" stroke-width="2.5"/>` : '';
    for (let i = 0; i < 8; i++) {
      const a0 = (i / 8) * Math.PI * 2, a1 = ((i + 1) / 8) * Math.PI * 2;
      const p0 = [cx + Math.cos(a0) * r, cy + Math.sin(a0) * r], p1 = [cx + Math.cos(a1) * r, cy + Math.sin(a1) * r];
      const d = `M${cx} ${cy} L${p0[0].toFixed(1)} ${p0[1].toFixed(1)} A${r} ${r} 0 0 1 ${p1[0].toFixed(1)} ${p1[1].toFixed(1)} Z`;
      if (c.slices[i]) {
        const am = (a0 + a1) / 2;
        out += [0.4, 0.6, 0.75].map((k, j) => `<circle cx="${cx + Math.cos(am + (j - 1) * 0.15) * r * k}" cy="${cy + Math.sin(am + (j - 1) * 0.15) * r * k}" r="${2 + j}" fill="${sheet}" opacity=".7"/>`).join('');
      } else {
        out += `<path class="slice" data-i="${i}" d="${d}" fill="${cream}" stroke="${sheet}" stroke-width="6" stroke-linejoin="round"/>`;
        out += `<path d="${d}" fill="none" stroke="${LINE}" stroke-width="1.8" pointer-events="none"/>`;
      }
    }
    const items = [...(c.rim ? rimItems() : []), ...c.toppings];
    for (const t of items) {
      let ang = Math.atan2(t.v, t.u); if (ang < 0) ang += Math.PI * 2;
      if (c.slices[Math.min(7, Math.floor(ang / (Math.PI / 4)))]) continue;
      out += `<g pointer-events="none">${topping(t.k, cx + t.u * (r - 12), cy + t.v * (r - 12) + 5, 0.95, cream, false)}</g>`;
    }
    return out;
  }
  // 위에서 본 케이크 (크림 바르기)
  function spreadView(c, pending) {
    const cx = 150, cy = 118, r = 96, cell = (r * 2) / SPREAD_N;
    const sheet = sheetColor(c), cream = creamColor(c);
    let out = `<circle cx="${cx}" cy="${cy}" r="${r + 22}" fill="#eaf4ff" stroke="${LINE}" stroke-width="2.5"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${shade(sheet, -14)}"/>
      <circle cx="${cx}" cy="${cy}" r="${r - 8}" fill="${shade(sheet, -4)}"/>
      <defs><clipPath id="cakeClip"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath></defs><g clip-path="url(#cakeClip)">`;
    if (c.spreadPct >= 88) {
      out += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${cream}"/>
        <g fill="none" stroke="${shade(cream, -16)}" stroke-width="3" stroke-linecap="round">
          <path d="M${cx} ${cy - 70} A70 70 0 1 1 ${cx - 1} ${cy - 70}"/><path d="M${cx} ${cy - 44} A44 44 0 1 1 ${cx - 1} ${cy - 44}"/>
          <path d="M${cx} ${cy - 18} A18 18 0 1 1 ${cx - 1} ${cy - 18}"/></g>`;
    } else {
      for (let i = 0; i < SPREAD_N * SPREAD_N; i++) {
        if (c.spread[i] !== '1' && !pending.has(i)) continue;
        const x = cx - r + ((i % SPREAD_N) + 0.5) * cell, y = cy - r + (Math.floor(i / SPREAD_N) + 0.5) * cell;
        out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(cell * 0.95).toFixed(1)}" fill="${cream}"/>`;
      }
    }
    out += `</g><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${LINE}" stroke-width="2.6"/>`;
    return out;
  }
  function oven(id) {
    return `<rect x="50" y="40" width="200" height="160" rx="22" fill="#e8474f" stroke="${LINE}" stroke-width="3"/>
      <rect x="72" y="72" width="156" height="104" rx="12" fill="#3a2a26" stroke="${LINE}" stroke-width="2.5"/>
      <rect x="72" y="72" width="156" height="104" rx="12" fill="#ffb347" class="oven-glow"/>
      <path d="M110 150 L110 128 A40 14 0 0 1 190 128 L190 150 A40 14 0 0 1 110 150 Z" fill="${SHEET_BASE}" stroke="${LINE}" stroke-width="2" class="rise"/>
      <circle cx="90" cy="56" r="7" fill="#fff"/><circle cx="114" cy="56" r="7" fill="#fff"/>
      <rect x="140" y="51" width="88" height="10" rx="5" fill="#fff" opacity=".7"/>
      <rect x="140" y="51" width="88" height="10" rx="5" fill="#ffd34d" class="oven-bar" data-k="${id}"/>`;
  }
  const svgWrap = (inner, cls = '') => `<svg class="cake-svg ${cls}" viewBox="0 0 300 240" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  const iconSvg = (inner, vb = '-18 -20 36 38') => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

  // ───────── 방 안 티테이블 ─────────
  function giftBox(steam) {
    return `<g>
      <rect x="93" y="62" width="54" height="38" rx="4" fill="#fffaf2" stroke="${LINE}" stroke-width="2.2"/>
      <rect x="89" y="54" width="62" height="12" rx="3" fill="#fff" stroke="${LINE}" stroke-width="2.2"/>
      <rect x="116" y="54" width="8" height="46" fill="#e8474f"/>
      <path d="M120 54 C110 40, 100 46, 108 52 Z M120 54 C130 40, 140 46, 132 52 Z" fill="#e8474f" stroke="${LINE}" stroke-width="1.8" stroke-linejoin="round"/>
      <circle cx="120" cy="54" r="3.5" fill="#c23440" stroke="${LINE}" stroke-width="1.5"/>
      <g fill="#ffc94a" class="twinkle-s"><path d="M152 46 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z"/><path d="M84 60 l1.4 3.5 3.5 1.4 -3.5 1.4 -1.4 3.5 -1.4 -3.5 -3.5 -1.4 3.5 -1.4 Z"/></g>
      ${steam ? `<g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" class="steam">
        <path d="M104 46 q-5 -7 0 -14 q5 -7 0 -14"/><path d="M120 40 q-5 -7 0 -14 q5 -7 0 -14"/><path d="M136 46 q-5 -7 0 -14 q5 -7 0 -14"/></g>` : ''}
    </g>`;
  }
  function tableArt(c) {
    let content, sign;
    const st = c.stage;
    if (st === 'lobby') { content = giftBox(false); sign = c.host ? '같이 만들자!' : '케이크 ♡'; }
    else if (st === 'ingredients' || st === 'mixing') { content = giftBox(false); sign = st === 'mixing' ? '섞는 중…' : '재료 넣는 중'; }
    else if (st === 'baking') { content = giftBox(true); sign = '굽는 중…'; }
    else if (st === 'cream' || st === 'spread') { content = `<g transform="translate(70 34) scale(.335)">${sideCake(c, { withCream: false, plate: false })}</g>`; sign = '크림 바르는 중'; }
    else if (st === 'decorate' || st === 'done') { content = `<g transform="translate(70 34) scale(.335)">${sideCake(c, { plate: false })}</g>`; sign = st === 'done' ? '완성! ✨' : '꾸미는 중'; }
    else if (st === 'eating') {
      const sheet = sheetColor(c), cream = creamColor(c);
      const left = c.slices.map((x, i) => (x ? null : i)).filter((i) => i !== null);
      const pos = left.map((i) => { const a = (i / 8) * Math.PI * 2; return { x: 120 + Math.cos(a) * 26, y: 95 + Math.sin(a) * 5 }; }).sort((p, q) => p.y - q.y);
      content = pos.map(({ x, y }) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
          <path d="M-8 -2 L8 -2 L8 6 L-8 6 Z" fill="${sheet}" stroke="${LINE}" stroke-width="1.3"/>
          <path d="M-8 1 L8 1" stroke="${cream}" stroke-width="2"/>
          <path d="M-8 -2 L0 -9 L8 -2 Z" fill="${cream}" stroke="${LINE}" stroke-width="1.3" stroke-linejoin="round"/>
          <circle cx="0" cy="-5" r="1.8" fill="#e8474f"/></g>`).join('');
      sign = `${left.length}/8 조각`;
    } else { content = [0, 1, 2, 3].map((i) => `<circle cx="${104 + i * 10}" cy="${97 + (i % 2) * 2}" r="1.8" fill="${sheetColor(c)}"/>`).join(''); sign = '냠냠 끝!'; }
    let lace = '';
    for (let i = 0; i <= 16; i++) {
      const a = (i / 16) * Math.PI;
      lace += `<circle cx="${(120 + Math.cos(a) * 90).toFixed(1)}" cy="${(126 + Math.sin(a) * 24).toFixed(1)}" r="5.5" fill="${i % 2 ? '#fff' : '#ffe3e6'}" stroke="${LINE}" stroke-width="1.2"/>`;
    }
    return `<svg viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg" class="table-art">
      <ellipse cx="120" cy="172" rx="96" ry="9" fill="#000" opacity=".12"/>
      <rect x="66" y="134" width="11" height="36" rx="3" fill="#8c5232" stroke="${LINE}" stroke-width="2"/>
      <rect x="163" y="134" width="11" height="36" rx="3" fill="#8c5232" stroke="${LINE}" stroke-width="2"/>
      <path d="M20 126 A100 26 0 0 0 220 126 L220 134 A100 26 0 0 1 20 134 Z" fill="#a8673f" stroke="${LINE}" stroke-width="2.2"/>
      <ellipse cx="120" cy="126" rx="100" ry="26" fill="#c98a5e" stroke="${LINE}" stroke-width="2.4"/>
      ${lace}
      <ellipse cx="120" cy="123" rx="88" ry="21" fill="#fffaf2" stroke="${LINE}" stroke-width="2"/>
      <ellipse cx="120" cy="123" rx="80" ry="17" fill="none" stroke="#e8474f" stroke-width="3"/>
      <ellipse cx="120" cy="123" rx="72" ry="14" fill="none" stroke="#3f9c6d" stroke-width="1.4" stroke-dasharray="3 4"/>
      ${topping('holly', 176, 126, 0.9, '#fff', false)}
      <ellipse cx="120" cy="124" rx="22" ry="6" fill="#fff" stroke="${LINE}" stroke-width="2"/>
      <path d="M114 124 L116 101 L124 101 L126 124 Z" fill="#fff" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>
      <ellipse cx="120" cy="101" rx="48" ry="10" fill="#fff" stroke="${LINE}" stroke-width="2.2"/>
      <ellipse cx="120" cy="99.5" rx="40" ry="7" fill="#f4f8ff"/>
      ${content}
      <g transform="translate(42 118) rotate(-7)">
        <path d="M0 0 L58 0 L54 22 L4 22 Z" fill="#fffaf2" stroke="${LINE}" stroke-width="1.8" stroke-linejoin="round"/>
        <rect x="3" y="3" width="52" height="16" rx="3" fill="none" stroke="#e8474f" stroke-width="1.2" stroke-dasharray="3 2"/>
        <text x="29" y="15.5" text-anchor="middle" font-size="9.5" font-family="Jua, sans-serif" fill="${LINE}">${sign}</text>
      </g>
    </svg>`;
  }

  // ───────── 공개 API ─────────
  window.CakeUI = function (api) {
    const $ = (s) => document.querySelector(s);
    let cake = null, selTop = 'rosette', open = false;
    const pending = new Set(); // 내가 방금 바른 크림 (서버 반영 전)
    let mixAcc = 0, lastAng = null, dragging = false, sendTimer = null;

    const isMember = () => cake && cake.members.some((m) => m.uid === api.myUid());
    const isHost = () => cake && cake.host === api.myUid();

    function renderSteps() {
      if (cake.stage === 'lobby') { $('#cakeSteps').innerHTML = '<span class="cstep now"><b>♡</b>모이는 중</span>'; return; }
      const cur = cake.stage === 'finished' ? STEPS.length : STEPS.findIndex(([k]) => k === cake.stage);
      $('#cakeSteps').innerHTML = STEPS.map(([, name], i) =>
        `<span class="cstep ${i < cur ? 'done' : i === cur ? 'now' : ''}"><b>${i < cur ? '✓' : i + 1}</b>${name}</span>`).join('');
    }

    function view() {
      const c = cake;
      const blobs = () => Object.keys(INGR).map((k) => blob(k, c.ingr[k])).join('');
      switch (c.stage) {
        case 'lobby': return svgWrap(`<g transform="translate(0 10) scale(1.25)">${giftBox(false)}</g>
            <text x="150" y="215" text-anchor="middle" font-size="15" font-family="Jua" fill="${LINE}">무슨 케이크가 나올까? 🎄</text>`);
        case 'ingredients': return svgWrap(bowl(blobs(), sheetColor(c), 0, false));
        case 'mixing': return svgWrap(bowl(`<g opacity="${(1 - c.mix).toFixed(2)}">${blobs()}</g>`, sheetColor(c), c.mix.toFixed(2), true), 'mixable');
        case 'baking': return svgWrap(oven(c.id));
        case 'cream': return svgWrap(`<g transform="translate(-60 30) scale(.72)">${sideCake(c, { withCream: false })}</g>
            <g transform="translate(150 40) scale(.5)">${bowl('', creamColor(c), 1, true)}</g>
            <text x="225" y="160" text-anchor="middle" font-size="14" font-family="Jua" fill="${LINE}">크림</text>`);
        case 'spread': return svgWrap(spreadView(c, pending), 'spreadable');
        case 'decorate': case 'done': return svgWrap(sideCake(c), c.stage === 'decorate' && isMember() ? 'placeable' : '');
        case 'eating': return svgWrap(topCake(c), 'eatable');
        case 'finished': return svgWrap(`<ellipse cx="150" cy="140" rx="120" ry="40" fill="#eaf4ff" stroke="${LINE}" stroke-width="2.5"/>
            ${[0, 1, 2, 3, 4].map((i) => `<circle cx="${110 + i * 20}" cy="${135 + (i % 2) * 8}" r="3" fill="${sheetColor(c)}"/>`).join('')}`);
      }
      return '';
    }

    const memberChips = () => `<div class="cmembers">${cake.members.map((m) =>
      `<span class="${m.uid === cake.host ? 'host' : ''}">${m.uid === cake.host ? '👑 ' : ''}${api.esc(m.nick)}</span>`).join('')}</div>`;
    const joinBar = () => (!isMember() && !['eating', 'finished', 'lobby'].includes(cake.stage)
      ? `<div class="cjoin"><span>친구들이 만드는 중이에요</span><button class="btn primary small" data-act="join">🙋 참여하기</button></div>` : '');

    function panel() {
      const c = cake, mem = isMember();
      const host = isHost() || (mem && !c.host);
      const next = (label, ok = true) => host
        ? `<button class="btn primary cnext" data-act="next" ${ok ? '' : 'disabled'}>${label}</button>`
        : `<button class="btn primary cnext" disabled>👑 방장이 다음 단계로 넘겨요</button>`;
      switch (c.stage) {
        case 'lobby':
          if (!c.host) return `<p class="chint big">다 같이 크리스마스 케이크를<br>만들어 볼까요? 🎄</p>
            <button class="btn primary cnext" data-act="host">🎂 케이크 만들자!</button>
            <p class="chint small">먼저 누른 사람이 방장이 돼서 시작해요</p>`;
          return `<p class="chint">${isHost() ? '친구들이 모이면 <b>시작하기</b>를 눌러요' : '방장이 시작하면 같이 만들어요'}</p>
            ${memberChips()}
            ${isHost() ? `<button class="btn primary cnext" data-act="start">▶ 시작하기 (${c.members.length}명)</button>`
              : mem ? `<p class="chint big">시작을 기다리는 중… ⏳</p><button class="btn ghost small" data-act="leave">나가기</button>`
                : `<button class="btn primary cnext" data-act="join">🙋 참여하기</button>`}`;
        case 'ingredients': {
          const missing = Object.entries(INGR).filter(([k, v]) => v.need && !c.ingr[k]).map(([, v]) => v.name);
          const btn = (k, v, cls) => `<button class="cbtn ${cls} ${c.ingr[k] ? 'on' : ''}" data-act="ingr" data-v="${k}" ${mem ? '' : 'disabled'}>
                <span class="ic">${iconSvg(ingrIcon(k))}</span><small>${v.name}${c.ingr[k] ? ` ×${c.ingr[k]}` : ''}</small></button>`;
          return `${joinBar()}<p class="chint"><b>기본 재료</b>를 다 넣고, <b>색 재료</b>로 시트 색을 섞어요</p>
            <div class="cbtns ingr">${Object.entries(INGR).filter(([, v]) => v.need).map(([k, v]) => btn(k, v, '')).join('')}</div>
            <p class="clabel-sm">🎨 색 재료 · 섞을수록 색이 섞여요</p>
            <div class="cbtns flav">${FLAVORS.map((k) => btn(k, INGR[k], 'sm opt')).join('')}</div>
            <p class="chint small">${missing.length ? `아직 필요해요: ${missing.join(', ')}` : '기본 재료 준비 완료! 🎉'}${c.ingr.salt >= 3 ? ' · 소금이 너무 많아요… 🥵' : ''}${c.ingr.sugar >= 3 ? ' · 엄청 달겠다 🤤' : ''}</p>
            ${next('🥄 거품기로 섞기 ▶', !missing.length)}`;
        }
        case 'mixing':
          return `${joinBar()}<p class="chint">그릇 위에서 <b>빙글빙글 돌려서</b> 섞어요! 같이 돌리면 더 빨라요</p>
            <div class="cprog"><i style="width:${Math.round(c.mix * 100)}%"></i><span>${Math.round(c.mix * 100)}%</span></div>
            ${next('🔥 오븐에 굽기', c.mix >= 1)}`;
        case 'baking': return `<p class="chint big">오븐에서 굽는 중이에요… 🔥</p>`;
        case 'cream':
          return `${joinBar()}<p class="chint">크림에 과일을 넣으면 <b>크림 색</b>이 바뀌어요 (안 넣으면 하얀 생크림)</p>
            <div class="cbtns">${Object.entries(FRUITS).map(([k, f]) =>
              `<button class="cbtn" data-act="cream" data-v="${k}" ${mem ? '' : 'disabled'}><span class="dot" style="background:${f.color}"></span><small>${f.name}</small></button>`).join('')}</div>
            <div class="crow"><button class="btn ghost small" data-act="uncream" ${c.cream.length && mem ? '' : 'disabled'}>↩ 하나 빼기</button>${next('🧈 크림 바르기 ▶')}</div>`;
        case 'spread': {
          const pct = Math.min(100, Math.round(c.spreadPct / 0.88));
          return `${joinBar()}<p class="chint">케이크 위를 <b>문질러서</b> 크림을 발라요. 가운데까지 꼼꼼히!</p>
            <div class="cprog"><i style="width:${pct}%"></i><span>${pct >= 100 ? '완성!' : `${pct}%`}</span></div>
            ${next('🍓 토핑 올리기 ▶', c.spreadPct >= 88)}`;
        }
        case 'decorate':
          return `${joinBar()}<p class="chint">토핑을 고르고 <b>케이크 위를 톡</b> (${c.toppings.length}/50)</p>
            <div class="cbtns tops">${TOPS.map(([k, name]) =>
              `<button class="cbtn sm ${selTop === k ? 'on' : ''}" data-act="seltop" data-v="${k}" title="${name}">
                <span class="ic">${iconSvg(topping(k, 0, 6, 1.35, creamColor(c), true), '-17 -34 34 42')}</span><small>${name}</small></button>`).join('')}</div>
            <div class="crow">
              <button class="btn ghost small" data-act="rim" ${mem ? '' : 'disabled'}>${c.rim ? '테두리 빼기' : '🧁 테두리 생크림'}</button>
              <button class="btn ghost small" data-act="undo" ${mem ? '' : 'disabled'}>↩ 빼기</button>
            </div>${next('✨ 완성!')}`;
        case 'done': {
          const hasCandle = c.toppings.some((t) => t.k === 'candle');
          if (hasCandle && !c.candlesOut) {
            const need = Math.max(1, Math.ceil(api.playerCount() / 2));
            return `<p class="chint big">메리 크리스마스! 🎄<br>다 같이 촛불을 불어요</p>
              <button class="btn primary cblow" data-act="blow">🌬️ 후~ 불기 (${c.blows.length}/${need}명)</button>`;
          }
          return `<p class="chint big">${hasCandle ? '촛불을 껐어요! 🎉' : '완성! 너무 예쁘다 ✨'}</p>
            ${next('🔪 잘라서 나눠 먹기')}`;
        }
        case 'eating': {
          const left = c.slices.filter((x) => !x).length;
          return `<p class="chint big">조각을 <b>톡</b> 눌러서 먹어요 🍰<br>${left}조각 남았어요</p>
            <div class="eaters">${c.slices.map((n) => (n ? `<span>😋 ${api.esc(n)}</span>` : '')).join('')}</div>`;
        }
        case 'finished':
          return `<p class="chint big">다 먹었어요! 맛있었다~ 😋</p><button class="btn primary" data-act="reset">🎂 새 케이크 만들기</button>`;
      }
      return '';
    }

    function render() {
      if (!cake) return;
      const art = document.querySelector('.cake-table .art');
      if (art) art.innerHTML = tableArt(cake);
      if (!open) return;
      renderSteps();
      $('#cakeView').innerHTML = view();
      $('#cakePanel').innerHTML = panel() + (isMember() && !['lobby', 'finished'].includes(cake.stage) ? '<button class="btn ghost small quit-btn" data-act="quit">🏳️ 나는 그만할래요</button>' : '');
      $('#cakeLog').innerHTML = cake.log.slice(-4).map((l) => `<li>${api.esc(l)}</li>`).join('');
      $('#cakeRestart').hidden = cake.stage === 'lobby' || !isMember();
    }
    function renderViewOnly() { if (open && cake) $('#cakeView').innerHTML = view(); }

    // ───────── 조작 ─────────
    $('#cakePanel').addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (!b || b.disabled) return;
      const a = b.dataset.act;
      if (a === 'seltop') { selTop = b.dataset.v; render(); return; }
      if (a === 'quit') { if (b.dataset.armed !== '1') { b.dataset.armed = '1'; b.textContent = '한 번 더 누르면 그만둬요'; return; } }
      if (a === 'ingr' || a === 'cream') api.Sound.Sfx.plop();
      api.send({ t: 'cake', a, v: b.dataset.v });
    });
    function svgPoint(evt) {
      const svg = $('#cakeView svg');
      if (!svg) return null;
      const pt = svg.createSVGPoint(); pt.x = evt.clientX; pt.y = evt.clientY;
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    }
    const tool = $('#cakeTool');
    const view$ = $('#cakeView');
    function showTool(e, kind) {
      const r = view$.getBoundingClientRect();
      tool.className = 'cake-tool ' + kind + (dragging ? ' moving' : '');
      tool.style.left = e.clientX - r.left + 'px';
      tool.style.top = e.clientY - r.top + 'px';
    }
    function flush() {
      sendTimer = null;
      if (mixAcc > 0) { api.send({ t: 'cake', a: 'mix', d: mixAcc }); mixAcc = 0; }
      if (pending.size) api.send({ t: 'cake', a: 'spread', c: [...pending] });
    }
    function schedule() { if (!sendTimer) sendTimer = setTimeout(flush, 180); }
    function paintAt(p) {
      const cx = 150, cy = 118, r = 96, cell = (r * 2) / SPREAD_N;
      const gx = (p.x - (cx - r)) / cell, gy = (p.y - (cy - r)) / cell;
      let added = false;
      for (let y = Math.floor(gy - 1.4); y <= gy + 1.4; y++) for (let x = Math.floor(gx - 1.4); x <= gx + 1.4; x++) {
        if (x < 0 || y < 0 || x >= SPREAD_N || y >= SPREAD_N) continue;
        if ((x + 0.5 - gx) ** 2 + (y + 0.5 - gy) ** 2 > 1.9) continue;
        const i = y * SPREAD_N + x;
        if (cake.spread[i] !== '1' && !pending.has(i)) { pending.add(i); added = true; }
      }
      if (added) { renderViewOnly(); schedule(); }
    }
    view$.addEventListener('pointerdown', (e) => {
      if (!cake || !isMember() || !['mixing', 'spread'].includes(cake.stage)) return;
      dragging = true; lastAng = null;
      try { view$.setPointerCapture(e.pointerId); } catch (_) {}
      e.preventDefault();
      showTool(e, cake.stage === 'mixing' ? 'whisk' : 'spatula');
      if (cake.stage === 'spread') { const p = svgPoint(e); if (p) paintAt(p); }
    });
    view$.addEventListener('pointermove', (e) => {
      if (!cake) return;
      if (cake.stage === 'mixing' && isMember()) showTool(e, 'whisk');
      else if (cake.stage === 'spread' && isMember()) showTool(e, 'spatula');
      else { tool.className = 'cake-tool'; return; }
      if (!dragging) return;
      const p = svgPoint(e);
      if (!p) return;
      if (cake.stage === 'mixing') {
        const ang = Math.atan2((p.y - 114) * 3, p.x - 150); // 그릇이 납작해서 세로를 늘려 계산
        if (lastAng !== null) {
          let d = ang - lastAng;
          if (d > Math.PI) d -= Math.PI * 2;
          if (d < -Math.PI) d += Math.PI * 2;
          if (Math.abs(d) < 1.2) { mixAcc += Math.abs(d); schedule(); }
        }
        lastAng = ang;
      } else paintAt(p);
    });
    const stop = () => { dragging = false; tool.classList.remove('moving'); };
    view$.addEventListener('pointerup', stop);
    view$.addEventListener('pointercancel', stop);
    view$.addEventListener('pointerleave', () => { if (!dragging) tool.className = 'cake-tool'; });
    view$.addEventListener('click', (e) => {
      if (!cake) return;
      if (cake.stage === 'decorate' && isMember()) {
        const p = svgPoint(e); if (!p) return;
        const u = (p.x - 150) / 96, v = (p.y - 4 - 92) / 32;
        if (u * u + v * v > 1) return;
        api.send({ t: 'cake', a: 'topping', k: selTop, u, v });
        api.Sound.Sfx.pop();
      } else if (cake.stage === 'eating') {
        const s = e.target.closest('.slice');
        if (s) api.send({ t: 'cake', a: 'eat', i: Number(s.dataset.i) });
      }
    });
    $('#cakeRestart').addEventListener('click', () => {
      const b = $('#cakeRestart');
      if (b.dataset.armed) { delete b.dataset.armed; b.textContent = '처음부터'; api.send({ t: 'cake', a: 'reset', force: true }); return; }
      b.dataset.armed = '1'; b.textContent = '정말 처음부터?';
      setTimeout(() => { delete b.dataset.armed; b.textContent = '처음부터'; }, 2500);
    });
    document.querySelectorAll('[data-close-cake]').forEach((b) => b.addEventListener('click', () => api.close()));

    let lastStage = null, lastMix = 0;
    return {
      update(c) {
        const prev = lastStage;
        for (const i of [...pending]) if (c.spread[i] === '1') pending.delete(i);
        if (c.stage !== 'spread') pending.clear();
        cake = c; lastStage = c.stage;
        if (prev === 'baking' && c.stage === 'cream') api.Sound.Sfx.ding();
        if (c.stage === 'mixing' && c.mix >= 1 && lastMix < 1) api.Sound.Sfx.ding();
        lastMix = c.mix;
        render();
      },
      setOpen(v) { open = v; render(); },
    };
  };
})();
