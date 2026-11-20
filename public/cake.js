// 🎂 다 같이 케이크 만들기 — 화면 그리기와 조작
(function () {
  const BASES = {
    vanilla: { name: '바닐라', color: '#f6dca5', emoji: '🍦' },
    choco: { name: '초코', color: '#8f5d3d', emoji: '🍫' },
    milk: { name: '우유', color: '#fff4e2', emoji: '🥛' },
  };
  const FRUITS = {
    strawberry: { name: '딸기', emoji: '🍓', color: '#ff86a6' },
    blueberry: { name: '블루베리', emoji: '🫐', color: '#8b7cf2' },
    mango: { name: '망고', emoji: '🥭', color: '#ffc23d' },
    kiwi: { name: '키위', emoji: '🥝', color: '#93d35a' },
    tangerine: { name: '귤', emoji: '🍊', color: '#ff9f43' },
    choco: { name: '초콜릿', emoji: '🍫', color: '#6b3f2a' },
  };
  const TOPPINGS = {
    strawberry: '🍓', cherry: '🍒', blueberry: '🫐', tangerine: '🍊', kiwi: '🥝', star: '⭐',
    snow: '❄️', chocolate: '🍫', cookie: '🍪', tree: '🎄', santa: '🎅', candle: null,
  };
  const STEPS = [
    ['base', '반죽'], ['batter', '과일 반죽'], ['baking', '굽기'], ['cream', '크림'],
    ['decorate', '토핑'], ['done', '촛불'], ['eating', '먹기'],
  ];
  const CREAM_BASE = '#fffaf2';

  // ───────── 색 섞기 ─────────
  const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const rgb2hex = (c) => '#' + c.map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('');
  function mix(base, fruits, baseWeight) {
    let acc = hex2rgb(base).map((x) => x * baseWeight), w = baseWeight;
    for (const f of fruits) { const c = hex2rgb(FRUITS[f].color); acc = acc.map((x, i) => x + c[i]); w += 1; }
    return rgb2hex(acc.map((x) => x / w));
  }
  function shade(hex, amt) { return rgb2hex(hex2rgb(hex).map((x) => x + amt)); }
  const sheetColor = (c) => mix(BASES[c.base || 'vanilla'].color, c.batter, 2.2);
  const creamColor = (c) => mix(CREAM_BASE, c.cream, 2.4);

  // ───────── 그림 ─────────
  const LINE = '#5b4036';
  function candle(x, y, s, lit) {
    const h = 26 * s, w = 7 * s;
    return `<g>
      <rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" rx="${2 * s}" fill="#fff" stroke="${LINE}" stroke-width="${1.4 * s}"/>
      <path d="M${x - w / 2} ${y - h * 0.7} L${x + w / 2} ${y - h * 0.85} M${x - w / 2} ${y - h * 0.35} L${x + w / 2} ${y - h * 0.5}" stroke="#e8474f" stroke-width="${2 * s}"/>
      ${lit
        ? `<path class="flame" d="M${x} ${y - h - 13 * s} C${x + 5 * s} ${y - h - 6 * s}, ${x + 4 * s} ${y - h - 1 * s}, ${x} ${y - h - 1 * s} C${x - 4 * s} ${y - h - 1 * s}, ${x - 5 * s} ${y - h - 6 * s}, ${x} ${y - h - 13 * s} Z" fill="#ffb33c"/>
           <circle cx="${x}" cy="${y - h - 4 * s}" r="${2 * s}" fill="#fff6b0"/>`
        : `<path class="smoke" d="M${x} ${y - h - 2 * s} q${3 * s} ${-5 * s} 0 ${-9 * s} q${-3 * s} ${-4 * s} 0 ${-8 * s}" fill="none" stroke="#bbb" stroke-width="${1.6 * s}" stroke-linecap="round"/>`}
    </g>`;
  }
  function toppingNode(t, x, y, s, lit) {
    if (t.k === 'candle') return candle(x, y + 4 * s, s, lit);
    return `<text x="${x}" y="${y + 7 * s}" font-size="${22 * s}" text-anchor="middle">${TOPPINGS[t.k] || ''}</text>`;
  }

  // 옆에서 본 케이크 (만들기·완성)
  function sideCake(c, { withCream = true, s = 1, plate = true } = {}) {
    const cx = 150, top = 92, rx = 108, ry = 38, h = 82;
    const sheet = sheetColor(c), cream = creamColor(c);
    const sheetDark = shade(sheet, -28);
    let out = plate ? `<ellipse cx="${cx}" cy="${top + h + 14}" rx="${rx + 26}" ry="${ry - 6}" fill="#eaf4ff" stroke="${LINE}" stroke-width="2.5"/>` : '';
    out += `<path d="M${cx - rx} ${top} L${cx - rx} ${top + h} A${rx} ${ry} 0 0 0 ${cx + rx} ${top + h} L${cx + rx} ${top} Z" fill="${sheet}" stroke="${LINE}" stroke-width="2.6"/>`;
    if (withCream) {
      // 가운데 크림층 + 위 크림 + 흘러내린 크림
      const mid = top + h * 0.5;
      out += `<path d="M${cx - rx} ${mid} A${rx} ${ry} 0 0 0 ${cx + rx} ${mid} L${cx + rx} ${mid + 9} A${rx} ${ry} 0 0 1 ${cx - rx} ${mid + 9} Z" fill="${cream}"/>`;
      let drip = `M${cx - rx} ${top}`;
      const n = 9;
      for (let i = 0; i <= n; i++) {
        const ang = Math.PI - (i / n) * Math.PI;
        const x = cx + Math.cos(ang) * rx, y = top + Math.sin(ang) * ry;
        const d = i % 2 ? 16 : 9;
        drip += ` L${x.toFixed(1)} ${(y + d).toFixed(1)}`;
      }
      drip += ` L${cx + rx} ${top} Z`;
      out += `<path d="${drip}" fill="${cream}" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>`;
      out += `<ellipse cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}" fill="${cream}" stroke="${LINE}" stroke-width="2.6"/>`;
      out += `<ellipse cx="${cx - 30}" cy="${top - 12}" rx="30" ry="7" fill="#fff" opacity=".5"/>`;
    } else {
      out += `<ellipse cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}" fill="${sheetDark}" stroke="${LINE}" stroke-width="2.6"/>`;
      out += `<ellipse cx="${cx}" cy="${top}" rx="${rx - 10}" ry="${ry - 6}" fill="${shade(sheet, -12)}"/>`;
    }
    const lit = !c.candlesOut;
    const tops = [...c.toppings].sort((a, b) => a.v - b.v);
    for (const t of tops) out += toppingNode(t, cx + t.u * (rx - 12), top + t.v * (ry - 6), s, lit);
    return out;
  }

  // 위에서 본 케이크 (먹기)
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
        out += `<g class="crumbs">${[0.4, 0.6, 0.75].map((k, j) =>
          `<circle cx="${cx + Math.cos(am + (j - 1) * 0.15) * r * k}" cy="${cy + Math.sin(am + (j - 1) * 0.15) * r * k}" r="${2 + j}" fill="${sheet}" opacity=".7"/>`).join('')}</g>`;
      } else {
        out += `<path class="slice" data-i="${i}" d="${d}" fill="${cream}" stroke="${sheet}" stroke-width="7" stroke-linejoin="round"/>`;
        out += `<path d="${d}" fill="none" stroke="${LINE}" stroke-width="1.8" pointer-events="none"/>`;
      }
    }
    for (const t of c.toppings) {
      let ang = Math.atan2(t.v, t.u); if (ang < 0) ang += Math.PI * 2;
      const idx = Math.min(7, Math.floor(ang / (Math.PI / 4)));
      if (c.slices[idx]) continue;
      const x = cx + t.u * (r - 14), y = cy + t.v * (r - 14);
      out += t.k === 'candle'
        ? `<circle cx="${x}" cy="${y}" r="4" fill="#fff" stroke="${LINE}" stroke-width="1.4" pointer-events="none"/>`
        : `<text x="${x}" y="${y + 7}" font-size="20" text-anchor="middle" pointer-events="none">${TOPPINGS[t.k]}</text>`;
    }
    return out;
  }

  // 반죽 그릇
  function bowl(color, fruits, label) {
    let out = `<ellipse cx="150" cy="190" rx="118" ry="18" fill="#000" opacity=".08"/>
      <path d="M40 110 Q40 200 150 200 Q260 200 260 110 Z" fill="#e8f1ff" stroke="${LINE}" stroke-width="2.6"/>
      <ellipse cx="150" cy="110" rx="110" ry="30" fill="#f5f9ff" stroke="${LINE}" stroke-width="2.6"/>
      <ellipse cx="150" cy="114" rx="96" ry="22" fill="${color}"/>
      <path d="M110 112 q20 -10 40 0 t40 0" fill="none" stroke="#fff" stroke-width="3" opacity=".5" stroke-linecap="round"/>`;
    fruits.slice(-10).forEach((f, i) => {
      const x = 80 + ((i * 37) % 140), y = 106 + ((i * 13) % 14);
      out += `<text x="${x}" y="${y + 6}" font-size="18" text-anchor="middle" class="bob-in">${FRUITS[f].emoji}</text>`;
    });
    if (label) out += `<text x="150" y="232" text-anchor="middle" font-size="15" font-family="Jua" fill="${LINE}">${label}</text>`;
    return out;
  }
  function oven(progressKey) {
    return `<rect x="50" y="40" width="200" height="160" rx="22" fill="#e8474f" stroke="${LINE}" stroke-width="3"/>
      <rect x="72" y="72" width="156" height="104" rx="12" fill="#3a2a26" stroke="${LINE}" stroke-width="2.5"/>
      <rect x="72" y="72" width="156" height="104" rx="12" fill="#ffb347" class="oven-glow"/>
      <path d="M110 150 L110 128 A40 14 0 0 1 190 128 L190 150 A40 14 0 0 1 110 150 Z" fill="#f6dca5" stroke="${LINE}" stroke-width="2" class="rise"/>
      <circle cx="90" cy="56" r="7" fill="#fff"/><circle cx="114" cy="56" r="7" fill="#fff"/>
      <rect x="140" y="51" width="88" height="10" rx="5" fill="#fff" opacity=".7"/>
      <rect x="140" y="51" width="88" height="10" rx="5" fill="#ffd34d" class="oven-bar" data-k="${progressKey}"/>`;
  }
  // ───────── 방 안 티테이블 (식탁보 + 케이크 스탠드 + 이름표) ─────────
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
    // 테이블 위 내용물 (스탠드 접시 윗면 y=100, 가운데 x=120)
    let content = '', sign = '케이크 ♡';
    const st = c.stage;
    if (st === 'base' || st === 'batter') { content = giftBox(false); sign = c.base || c.batter.length ? '반죽 중…' : '케이크 ♡'; }
    else if (st === 'baking') { content = giftBox(true); sign = '굽는 중…'; }
    else if (st === 'cream') { content = `<g transform="translate(70 34) scale(.335)">${sideCake(c, { withCream: false, plate: false })}</g>`; sign = '크림 중…'; }
    else if (st === 'decorate' || st === 'done') { content = `<g transform="translate(70 34) scale(.335)">${sideCake(c, { plate: false, s: 1.6 })}</g>`; sign = st === 'done' ? '완성! ✨' : '꾸미는 중'; }
    else if (st === 'eating') {
      const sheet = sheetColor(c), cream = creamColor(c);
      const left = c.slices.map((x, i) => (x ? null : i)).filter((i) => i !== null);
      // 스탠드 위에 남은 조각들을 동그랗게 (뒤쪽부터 그려요)
      const pos = left.map((i) => { const a = (i / 8) * Math.PI * 2; return { x: 120 + Math.cos(a) * 26, y: 95 + Math.sin(a) * 5 }; }).sort((p, q) => p.y - q.y);
      content = pos.map(({ x, y }) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
          <path d="M-8 -2 L8 -2 L8 6 L-8 6 Z" fill="${sheet}" stroke="${LINE}" stroke-width="1.3"/>
          <path d="M-8 1 L8 1" stroke="${cream}" stroke-width="2"/>
          <path d="M-8 -2 L0 -9 L8 -2 Z" fill="${cream}" stroke="${LINE}" stroke-width="1.3" stroke-linejoin="round"/>
          <circle cx="0" cy="-5" r="1.8" fill="#e8474f"/></g>`).join('');
      sign = `${left.length}/8 조각`;
    }
    else if (st === 'finished') { content = [0, 1, 2, 3].map((i) => `<circle cx="${104 + i * 10}" cy="${97 + (i % 2) * 2}" r="1.8" fill="${sheetColor(c)}"/>`).join(''); sign = '냠냠 끝!'; }
    // 식탁보 레이스
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
      <g transform="translate(176 120)">
        <path d="M0 0 C4 -6 12 -6 16 -2 C12 0 13 2 16 3 C11 6 4 5 0 0 Z" fill="#3f9c6d" stroke="${LINE}" stroke-width="1.3"/>
        <path d="M0 0 C-4 -6 -12 -6 -16 -2 C-12 0 -13 2 -16 3 C-11 6 -4 5 0 0 Z" fill="#4fb07f" stroke="${LINE}" stroke-width="1.3"/>
        <circle cx="-2" cy="-1" r="2.6" fill="#ffd34d" stroke="${LINE}" stroke-width="1"/><circle cx="2.5" cy="0" r="2.6" fill="#e8474f" stroke="${LINE}" stroke-width="1"/>
      </g>
      <ellipse cx="120" cy="124" rx="22" ry="6" fill="#fff" stroke="${LINE}" stroke-width="2"/>
      <path d="M114 124 L116 101 L124 101 L126 124 Z" fill="#fff" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>
      <ellipse cx="120" cy="101" rx="48" ry="10" fill="#fff" stroke="${LINE}" stroke-width="2.2"/>
      <ellipse cx="120" cy="99.5" rx="40" ry="7" fill="#f4f8ff"/>
      ${content}
      <g transform="translate(42 118) rotate(-7)">
        <path d="M0 0 L58 0 L54 22 L4 22 Z" fill="#fffaf2" stroke="${LINE}" stroke-width="1.8" stroke-linejoin="round"/>
        <rect x="3" y="3" width="52" height="16" rx="3" fill="none" stroke="#e8474f" stroke-width="1.2" stroke-dasharray="3 2"/>
        <text x="29" y="15.5" text-anchor="middle" font-size="10" font-family="Jua, sans-serif" fill="${LINE}">${sign}</text>
      </g>
    </svg>`;
  }

  function svgWrap(inner, cls = '') {
    return `<svg class="cake-svg ${cls}" viewBox="0 0 300 240" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  }

  // ───────── 공개 API ─────────
  window.CakeUI = function (api) {
    const $ = (s) => document.querySelector(s);
    let cake = null, selTop = 'strawberry', open = false;

    function stageIndex(st) { return STEPS.findIndex(([k]) => k === st); }

    function renderSteps() {
      const cur = cake.stage === 'finished' ? STEPS.length : stageIndex(cake.stage);
      $('#cakeSteps').innerHTML = STEPS.map(([k, name], i) =>
        `<span class="cstep ${i < cur ? 'done' : i === cur ? 'now' : ''}"><b>${i < cur ? '✓' : i + 1}</b>${name}</span>`).join('');
    }

    function view() {
      const c = cake;
      switch (c.stage) {
        case 'base': return svgWrap(bowl(c.base ? BASES[c.base].color : '#f3eee6', [], c.base ? `${BASES[c.base].name} 반죽` : '반죽을 골라요'));
        case 'batter': return svgWrap(bowl(sheetColor(c), c.batter, '반죽 색이 바뀌어요!'));
        case 'baking': return svgWrap(oven(c.id), 'baking');
        case 'cream': return svgWrap(`<g transform="translate(-60 30) scale(.72)">${sideCake(c, { withCream: false })}</g>
            <g transform="translate(150 40) scale(.5)">${bowl(creamColor(c), c.cream, '')}</g>
            <text x="225" y="160" text-anchor="middle" font-size="14" font-family="Jua" fill="${LINE}">크림</text>`);
        case 'decorate': case 'done': return svgWrap(sideCake(c), c.stage === 'decorate' ? 'placeable' : '');
        case 'eating': return svgWrap(topCake(c), 'eatable');
        case 'finished': return svgWrap(`<ellipse cx="150" cy="140" rx="120" ry="40" fill="#eaf4ff" stroke="${LINE}" stroke-width="2.5"/>
            ${[0, 1, 2, 3, 4].map((i) => `<circle cx="${110 + i * 20}" cy="${135 + (i % 2) * 8}" r="3" fill="${sheetColor(c)}"/>`).join('')}
            <text x="150" y="80" text-anchor="middle" font-size="40">😋</text>`);
      }
      return '';
    }

    function fruitButtons() {
      return `<div class="cbtns">${Object.entries(FRUITS).map(([k, f]) =>
        `<button class="cbtn" data-act="fruit" data-v="${k}"><span>${f.emoji}</span><small>${f.name}</small></button>`).join('')}</div>`;
    }

    function panel() {
      const c = cake;
      const next = (label, ok = true) => `<button class="btn primary cnext" data-act="next" ${ok ? '' : 'disabled'}>${label}</button>`;
      switch (c.stage) {
        case 'base':
          return `<p class="chint">어떤 반죽으로 만들까요? 누구나 고를 수 있어요</p>
            <div class="cbtns">${Object.entries(BASES).map(([k, b]) =>
              `<button class="cbtn ${c.base === k ? 'on' : ''}" data-act="base" data-v="${k}"><span>${b.emoji}</span><small>${b.name}</small></button>`).join('')}</div>
            ${next('과일 넣으러 가기 ▶', !!c.base)}`;
        case 'batter':
          return `<p class="chint">반죽에 과일을 넣으면 <b>시트 색</b>이 바뀌어요 (${c.batter.length}/12)</p>${fruitButtons()}
            <div class="crow"><button class="btn ghost small" data-act="unfruit" ${c.batter.length ? '' : 'disabled'}>↩ 하나 빼기</button>${next('🔥 오븐에 굽기')}</div>`;
        case 'baking':
          return `<p class="chint big">오븐에서 굽는 중이에요… 🔥<br>조금만 기다려요!</p>`;
        case 'cream':
          return `<p class="chint">크림에 과일을 넣으면 <b>크림 색</b>이 바뀌어요 (${c.cream.length}/12)</p>${fruitButtons()}
            <div class="crow"><button class="btn ghost small" data-act="unfruit" ${c.cream.length ? '' : 'disabled'}>↩ 하나 빼기</button>${next('크림 바르기 ▶')}</div>`;
        case 'decorate':
          return `<p class="chint">토핑을 고르고 <b>케이크 위를 톡</b> 누르세요 (${c.toppings.length}/40)</p>
            <div class="cbtns tops">${Object.entries(TOPPINGS).map(([k, e]) =>
              `<button class="cbtn sm ${selTop === k ? 'on' : ''}" data-act="seltop" data-v="${k}"><span>${e || '🕯️'}</span></button>`).join('')}</div>
            <div class="crow"><button class="btn ghost small" data-act="undo">↩ 내 토핑 빼기</button>${next('✨ 완성!')}</div>`;
        case 'done': {
          const hasCandle = c.toppings.some((t) => t.k === 'candle');
          if (hasCandle && !c.candlesOut) {
            const need = Math.max(1, Math.ceil(api.playerCount() / 2));
            return `<p class="chint big">메리 크리스마스! 🎄<br>다 같이 촛불을 불어요</p>
              <button class="btn primary cblow" data-act="blow">🌬️ 후~ 불기 (${c.blows.length}/${need}명)</button>`;
          }
          return `<p class="chint big">${hasCandle ? '촛불을 껐어요! 🎉' : '완성! 너무 예쁘다 ✨'}</p>${next('🔪 잘라서 나눠 먹기')}`;
        }
        case 'eating': {
          const left = c.slices.filter((x) => !x).length;
          return `<p class="chint big">조각을 <b>톡</b> 눌러서 먹어요 🍰<br>${left}조각 남았어요</p>
            <div class="eaters">${c.slices.map((n) => n ? `<span>😋 ${api.esc(n)}</span>` : '').join('')}</div>`;
        }
        case 'finished':
          return `<p class="chint big">다 먹었어요! 맛있었다~ 😋</p>
            <button class="btn primary" data-act="reset">🎂 새 케이크 만들기</button>`;
      }
      return '';
    }

    function render() {
      if (!cake) return;
      renderMini();
      if (!open) return;
      renderSteps();
      $('#cakeView').innerHTML = view();
      $('#cakePanel').innerHTML = panel();
      $('#cakeLog').innerHTML = cake.log.slice(-4).map((l) => `<li>${api.esc(l)}</li>`).join('');
      $('#cakeRestart').hidden = cake.stage === 'base' && !cake.base;
    }

    // 방 안 티테이블
    function renderMini() {
      const el = document.querySelector('.cake-table .art');
      if (el) el.innerHTML = tableArt(cake);
    }

    function act(e) {
      const b = e.target.closest('[data-act]');
      if (!b || b.disabled) return;
      const a = b.dataset.act;
      if (a === 'seltop') { selTop = b.dataset.v; render(); return; }
      if (a === 'fruit') api.Sound.Sfx.plop();
      api.send({ t: 'cake', a, v: b.dataset.v });
    }

    function svgPoint(svg, evt) {
      const pt = svg.createSVGPoint();
      pt.x = evt.clientX; pt.y = evt.clientY;
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    }
    function onViewClick(e) {
      const svg = e.target.closest('svg');
      if (!svg || !cake) return;
      if (cake.stage === 'decorate') {
        const p = svgPoint(svg, e);
        const u = (p.x - 150) / (108 - 12), v = (p.y - 92) / (38 - 6);
        if (u * u + v * v > 1) return;
        api.send({ t: 'cake', a: 'topping', k: selTop, u, v });
        api.Sound.Sfx.pop();
      } else if (cake.stage === 'eating') {
        const s = e.target.closest('.slice');
        if (s) api.send({ t: 'cake', a: 'eat', i: Number(s.dataset.i) });
      }
    }

    $('#cakePanel').addEventListener('click', act);
    $('#cakeView').addEventListener('click', onViewClick);
    $('#cakeRestart').addEventListener('click', () => {
      if (confirmRestart()) api.send({ t: 'cake', a: 'reset', force: true });
    });
    function confirmRestart() {
      const b = $('#cakeRestart');
      if (b.dataset.armed) { delete b.dataset.armed; b.textContent = '처음부터'; return true; }
      b.dataset.armed = '1'; b.textContent = '정말 처음부터?';
      setTimeout(() => { delete b.dataset.armed; b.textContent = '처음부터'; }, 2500);
      return false;
    }
    document.querySelectorAll('[data-close-cake]').forEach((b) => b.addEventListener('click', () => api.close()));

    let lastStage = null;
    return {
      update(c) {
        const prev = lastStage;
        cake = c; lastStage = c.stage;
        if (prev === 'baking' && c.stage === 'cream') api.Sound.Sfx.ding();
        if (prev === 'done' && c.stage === 'done' && c.candlesOut) {}
        render();
      },
      setOpen(v) { open = v; render(); },
      get stage() { return cake && cake.stage; },
      candlesJustOut(c) { return c.candlesOut; },
    };
  };
})();
