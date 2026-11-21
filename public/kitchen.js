// ☕ 주방: 핫초코 만들기 · 마시멜로 굽기 + 음식 그림 (인벤토리에서도 같이 써요)
(function () {
  const LINE = '#5b4036';
  const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const rgb2hex = (c) => '#' + c.map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('');
  const lerp = (a, b, t) => rgb2hex(hex2rgb(a).map((x, i) => x + (hex2rgb(b)[i] - x) * t));
  const cocoaColor = (d) => ['#f4ead8', '#b98a63', '#8a5a3b', '#5e3a26'][Math.max(0, Math.min(3, d))];
  // 마시멜로 굽기 정도 (0 → 1.2): 하양 → 노릇 → 갈색 → 까맣게
  function mallowColor(h) {
    if (h < 0.4) return lerp('#fffaf2', '#f6d99b', h / 0.4);
    if (h < 0.7) return lerp('#f6d99b', '#c98a4b', (h - 0.4) / 0.3);
    if (h < 0.95) return lerp('#c98a4b', '#6b4430', (h - 0.7) / 0.25);
    return lerp('#6b4430', '#2e2320', Math.min(1, (h - 0.95) / 0.25));
  }
  const QUALITY_HEAT = { raw: 0.1, golden: 0.5, brown: 0.8, burnt: 1.15 };
  const qualityOf = (h) => (h < 0.35 ? 'raw' : h < 0.62 ? 'golden' : h < 0.88 ? 'brown' : 'burnt');

  function itemName(it) {
    if (!it) return '';
    if (it.k === 'cocoa') return it.t === 'mallow' ? '마시멜로 핫초코' : it.t === 'cream' ? '휘핑크림 핫초코' : '핫초코';
    return { raw: '말랑 마시멜로', golden: '노릇노릇 마시멜로', brown: '바삭 마시멜로', burnt: '까맣게 탄 마시멜로' }[it.q] || '마시멜로';
  }

  // ───────── 그림 ─────────
  function mug(liquid, fill, topping, steam) {
    // viewBox 0 0 100 100 기준 머그컵
    const top = 30 + (1 - fill) * 50;
    let t = '';
    if (topping === 'mallow') {
      t = [[38, 30], [52, 27], [62, 32], [46, 34]].map(([x, y]) =>
        `<rect x="${x - 6}" y="${y - 5}" width="12" height="10" rx="3" fill="#fffaf2" stroke="${LINE}" stroke-width="2"/>`).join('');
    } else if (topping === 'cream') {
      t = `<path d="M28 34 C24 22 40 16 50 18 C62 14 78 22 72 34 Z" fill="#fffaf2" stroke="${LINE}" stroke-width="2"/>
        <path d="M40 22 C46 12 58 14 58 22" fill="#fffaf2" stroke="${LINE}" stroke-width="2"/>
        <g fill="#e8474f"><circle cx="44" cy="24" r="1.6"/><circle cx="56" cy="28" r="1.6"/><circle cx="62" cy="24" r="1.6"/></g>`;
    }
    return `<g>
      ${steam ? `<g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" class="steam" opacity=".9">
        <path d="M40 18 q-5 -6 0 -12 q5 -6 0 -12"/><path d="M58 18 q-5 -6 0 -12 q5 -6 0 -12"/></g>` : ''}
      <path d="M76 44 C92 44 92 70 76 70" fill="none" stroke="${LINE}" stroke-width="7" stroke-linecap="round"/>
      <path d="M76 44 C88 44 88 70 76 70" fill="none" stroke="#e8474f" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M22 30 L26 86 Q50 94 74 86 L78 30 Z" fill="#e8474f" stroke="${LINE}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M24 54 L76 54 M25 66 L75 66" stroke="#fff" stroke-width="4" opacity=".85"/>
      <clipPath id="mugIn"><path d="M25 30 L28 84 Q50 91 72 84 L75 30 Z"/></clipPath>
      ${fill > 0 ? `<rect x="20" y="${top}" width="60" height="70" fill="${liquid}" clip-path="url(#mugIn)"/>
        <ellipse cx="50" cy="${top}" rx="${25 - (top - 30) * 0.06}" ry="4" fill="${lerp(liquid, '#ffffff', 0.15)}"/>` : ''}
      <ellipse cx="50" cy="30" rx="28" ry="6" fill="none" stroke="${LINE}" stroke-width="2.6"/>
      ${t}
    </g>`;
  }
  function stick(color, x = 50, y = 30, s = 1) {
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <path d="M0 6 L34 70" stroke="#b97a4f" stroke-width="4" stroke-linecap="round"/>
      <path d="M0 6 L34 70" stroke="${LINE}" stroke-width="1.2" stroke-linecap="round" opacity=".4"/>
      <g transform="rotate(28)"><rect x="-11" y="-14" width="22" height="24" rx="8" fill="${color}" stroke="${LINE}" stroke-width="2.4"/>
        <ellipse cx="0" cy="-12" rx="10" ry="3.5" fill="${lerp(color, '#ffffff', 0.25)}"/>
        <ellipse cx="-5" cy="-3" rx="2.5" ry="5" fill="#fff" opacity=".35"/></g>
    </g>`;
  }
  function itemIcon(it) {
    if (!it) return '';
    if (it.k === 'cocoa') return `<svg viewBox="10 4 84 94" xmlns="http://www.w3.org/2000/svg">${mug(cocoaColor(it.d), 0.85, it.t, true)}</svg>`;
    return `<svg viewBox="20 0 70 100" xmlns="http://www.w3.org/2000/svg">${stick(mallowColor(QUALITY_HEAT[it.q] || 0.1), 44, 22, 1.05)}</svg>`;
  }

  // ───────── 주방 창 ─────────
  window.Kitchen = { itemIcon, itemName };
  window.KitchenUI = function (api) {
    const $ = (s) => document.querySelector(s);
    let tab = 'cocoa', open = false;
    // 핫초코 상태
    let cs = null;
    const newCocoa = () => ({ step: 'pour', fill: 0, d: 0, stir: 0, top: null, done: false, spilled: false });
    // 마시멜로 상태
    let ms = null;
    const newMallow = () => ({ heat: 0, holding: false, done: false });
    let raf = null, last = 0, pouring = false, roasting = false;

    function steps(list, cur) {
      return `<div class="cake-steps">${list.map(([k, n], i) => {
        const ci = list.findIndex(([kk]) => kk === cur);
        return `<span class="cstep ${i < ci ? 'done' : i === ci ? 'now' : ''}"><b>${i < ci ? '✓' : i + 1}</b>${n}</span>`;
      }).join('')}</div>`;
    }

    function cocoaView() {
      const liquid = cs.step === 'pour' ? '#f7f2ea' : lerp(cocoaColor(cs.d), cocoaColor(0), cs.step === 'stir' ? 0.45 * (1 - cs.stir) : 0);
      const zone = `<g opacity=".7"><rect x="82" y="${30 + (1 - 0.9) * 50}" width="6" height="${0.25 * 50}" rx="3" fill="#3f9c6d"/>
        <text x="92" y="${30 + (1 - 0.78) * 50 + 3}" font-size="7" font-family="Jua" fill="#3f9c6d">여기까지</text></g>`;
      return `<svg class="cake-svg ${cs.step === 'stir' ? 'mixable' : ''}" viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="90" rx="34" ry="5" fill="#000" opacity=".08"/>
        ${cs.step === 'pour' ? `<g transform="translate(58 -2) rotate(${pouring ? 28 : 8})"><path d="M0 0 L10 -9 L20 0 L20 26 L0 26 Z" fill="#fff" stroke="${LINE}" stroke-width="2"/>
          <rect x="0" y="9" width="20" height="7" fill="#7cc0ff"/></g>
          ${pouring ? `<path d="M60 22 Q56 ${40} 52 ${30 + (1 - cs.fill) * 50}" stroke="#f7f2ea" stroke-width="4" fill="none" stroke-linecap="round"/>` : ''}` : ''}
        ${mug(liquid, cs.fill, cs.top, cs.step === 'top' || cs.done)}
        ${cs.step === 'pour' ? zone : ''}
        ${cs.step === 'stir' ? `<g class="swirl" opacity="${0.3 + cs.stir * 0.4}"><path d="M40 ${32 + (1 - cs.fill) * 50} q10 -5 20 0" stroke="#fff" stroke-width="2" fill="none"/></g>` : ''}
      </svg>`;
    }
    function cocoaPanel() {
      if (cs.done) return `<p class="chint big">${itemName(cs.item)} 완성! ☕<br>🎒 인벤토리에 넣었어요</p>
        <button class="btn primary cnext" data-k="again">하나 더 만들기</button>`;
      switch (cs.step) {
        case 'pour': return `<p class="chint">버튼을 <b>꾹 누르고 있으면</b> 우유가 부어져요. 초록 선까지만!</p>
          <div class="cprog"><i style="width:${Math.min(100, cs.fill * 100)}%"></i><span>${Math.round(cs.fill * 100)}%</span></div>
          <button class="btn primary cnext hold" data-k="pour">🥛 꾹 눌러서 붓기</button>
          ${cs.spilled ? '<p class="chint small">앗, 넘쳤어요! 다시 부어요 💦</p>' : ''}`;
        case 'cocoa': return `<p class="chint">코코아 가루를 넣어요. 많이 넣을수록 진해져요 (${cs.d}/3)</p>
          <div class="crow"><button class="btn ghost" data-k="spoon" ${cs.d >= 3 ? 'disabled' : ''}>🥄 코코아 한 스푼</button></div>
          <button class="btn primary cnext" data-k="tostir" ${cs.d ? '' : 'disabled'}>저어 섞기 ▶</button>`;
        case 'stir': return `<p class="chint">컵 위에서 <b>빙글빙글</b> 돌려서 저어요</p>
          <div class="cprog"><i style="width:${Math.round(cs.stir * 100)}%"></i><span>${Math.round(cs.stir * 100)}%</span></div>`;
        case 'top': return `<p class="chint">위에 무엇을 올릴까요?</p>
          <div class="cbtns">
            <button class="cbtn ${cs.top === 'mallow' ? 'on' : ''}" data-k="top" data-v="mallow"><span class="ic">${itemIcon({ k: 'cocoa', t: 'mallow', d: cs.d })}</span><small>마시멜로</small></button>
            <button class="cbtn ${cs.top === 'cream' ? 'on' : ''}" data-k="top" data-v="cream"><span class="ic">${itemIcon({ k: 'cocoa', t: 'cream', d: cs.d })}</span><small>휘핑크림</small></button>
            <button class="cbtn ${cs.top === null ? 'on' : ''}" data-k="top" data-v=""><span class="ic">${itemIcon({ k: 'cocoa', t: 'plain', d: cs.d })}</span><small>그냥</small></button>
          </div>
          <button class="btn primary cnext" data-k="finish">☕ 완성! 담기</button>`;
      }
      return '';
    }
    function mallowView() {
      const flame = 0.8 + (roasting ? 0.25 : 0);
      return `<svg class="cake-svg" viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="76" width="100" height="20" rx="6" fill="#8c5232" stroke="${LINE}" stroke-width="2"/>
        <g transform="translate(60 78) scale(${flame})">
          <path class="flame" d="M-22 0 C-26 -18 -12 -22 -10 -34 C-2 -22 4 -26 2 -40 C14 -28 24 -18 22 0 Z" fill="#ff8a3d"/>
          <path class="flame" d="M-12 0 C-14 -12 -4 -14 -2 -24 C4 -16 12 -12 12 0 Z" fill="#ffd34d"/>
        </g>
        <rect x="26" y="74" width="68" height="8" rx="4" fill="#6b4430"/>
        <g class="${roasting ? 'roast' : ''}">${stick(mallowColor(ms.heat), roasting ? 56 : 46, roasting ? 34 : 18, 1)}</g>
      </svg>`;
    }
    function mallowPanel() {
      if (ms.done) return `<p class="chint big">${itemName(ms.item)} 완성! 🔥<br>🎒 인벤토리에 넣었어요</p>
        <button class="btn primary cnext" data-k="again">하나 더 굽기</button>`;
      const q = qualityOf(ms.heat);
      const label = { raw: '아직 말랑해요', golden: '노릇노릇! 지금이 딱 좋아요 ✨', brown: '바삭바삭해요', burnt: '앗… 탔어요 🔥' }[q];
      return `<p class="chint"><b>꾹 누르고 있으면</b> 불에 구워져요. 노릇노릇할 때 떼요!</p>
        <div class="heatbar"><i style="left:${Math.min(100, (ms.heat / 1.2) * 100)}%"></i>
          <span class="z raw">말랑</span><span class="z golden">노릇</span><span class="z brown">바삭</span><span class="z burnt">탐</span></div>
        <p class="chint small">${label}</p>
        <button class="btn primary cnext hold" data-k="roast">🔥 꾹 눌러서 굽기</button>
        <button class="btn ghost" data-k="take" ${ms.heat > 0.05 ? '' : 'disabled'}>🍡 다 구웠어요! 담기</button>`;
    }

    function render() {
      if (!open) return;
      if (!cs) cs = newCocoa();
      if (!ms) ms = newMallow();
      document.querySelectorAll('#kitchenTabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
      if (tab === 'cocoa') {
        $('#kitchenSteps').innerHTML = steps([['pour', '우유'], ['cocoa', '코코아'], ['stir', '젓기'], ['top', '토핑']], cs.done ? 'zz' : cs.step);
        $('#kitchenView').innerHTML = cocoaView();
        $('#kitchenPanel').innerHTML = cocoaPanel();
      } else {
        $('#kitchenSteps').innerHTML = '';
        $('#kitchenView').innerHTML = mallowView();
        $('#kitchenPanel').innerHTML = mallowPanel();
      }
    }
    function renderLight() { // 길게 누르는 동안 버튼은 그대로 두고 그림·게이지만 갱신
      if (!open) return;
      $('#kitchenView').innerHTML = tab === 'cocoa' ? cocoaView() : mallowView();
      const prog = $('#kitchenPanel .cprog');
      if (prog && tab === 'cocoa' && cs.step === 'pour') { prog.querySelector('i').style.width = Math.min(100, cs.fill * 100) + '%'; prog.querySelector('span').textContent = Math.round(cs.fill * 100) + '%'; }
      const hb = $('#kitchenPanel .heatbar i');
      if (hb) hb.style.left = Math.min(100, (ms.heat / 1.2) * 100) + '%';
      const lab = $('#kitchenPanel .chint.small');
      const tk = $('#kitchenPanel [data-k=take]');
      if (tk) tk.disabled = !(ms.heat > 0.05);
      if (lab && tab === 'mallow') lab.textContent = { raw: '아직 말랑해요', golden: '노릇노릇! 지금이 딱 좋아요 ✨', brown: '바삭바삭해요', burnt: '앗… 탔어요 🔥' }[qualityOf(ms.heat)];
    }

    function loop(t) {
      const dt = Math.min(0.05, (t - last) / 1000); last = t;
      let changed = false;
      if (pouring && cs.step === 'pour') {
        cs.fill += dt * 0.32; changed = true;
        if (cs.fill > 1.02) { pouring = false; cs.fill = 0; cs.spilled = true; api.Sound.Sfx.splat(); render(); }
      }
      if (roasting) { ms.heat = Math.min(1.25, ms.heat + dt * 0.22); changed = true; }
      if (changed) renderLight();
      if (pouring || roasting) raf = requestAnimationFrame(loop); else raf = null;
    }
    function startHold(kind) {
      if (kind === 'pour') { pouring = true; cs.spilled = false; }
      if (kind === 'roast') roasting = true;
      last = performance.now();
      if (!raf) raf = requestAnimationFrame(loop);
      renderLight();
    }
    function endHold() {
      if (pouring) {
        pouring = false;
        if (cs.fill >= 0.65 && cs.fill <= 0.9) { cs.step = 'cocoa'; api.Sound.Sfx.ding(); render(); return; }
      }
      if (roasting) roasting = false;
      renderLight();
    }
    const panel = $('#kitchenPanel');
    panel.addEventListener('pointerdown', (e) => {
      const b = e.target.closest('.hold');
      if (!b) return;
      e.preventDefault();
      try { b.setPointerCapture(e.pointerId); } catch (_) {}
      startHold(b.dataset.k);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => panel.addEventListener(ev, (e) => { if (e.target.closest('.hold')) endHold(); }));
    window.addEventListener('pointerup', endHold);
    panel.addEventListener('click', (e) => {
      const b = e.target.closest('[data-k]');
      if (!b || b.disabled || b.classList.contains('hold')) return;
      const k = b.dataset.k;
      if (k === 'spoon') { cs.d = Math.min(3, cs.d + 1); api.Sound.Sfx.plop(); }
      else if (k === 'tostir') { cs.step = 'stir'; cs.stir = 0; }
      else if (k === 'top') { cs.top = b.dataset.v || null; api.Sound.Sfx.pop(); }
      else if (k === 'finish') {
        cs.item = { k: 'cocoa', t: cs.top || 'plain', d: cs.d };
        api.craft(cs.item, (ok) => { if (ok) { cs.done = true; render(); } });
      } else if (k === 'take') {
        ms.item = { k: 'mallow', q: qualityOf(ms.heat) };
        api.craft(ms.item, (ok) => { if (ok) { ms.done = true; render(); } });
      } else if (k === 'again') { if (tab === 'cocoa') cs = newCocoa(); else ms = newMallow(); }
      render();
    });
    document.querySelectorAll('#kitchenTabs button').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; render(); }));

    // 젓기: 컵 위에서 빙글빙글
    const view = $('#kitchenView');
    let lastAng = null, dragging = false;
    function pt(e) {
      const svg = view.querySelector('svg'); if (!svg) return null;
      const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
      return p.matrixTransform(svg.getScreenCTM().inverse());
    }
    view.addEventListener('pointerdown', (e) => {
      if (tab !== 'cocoa' || cs.step !== 'stir') return;
      dragging = true; lastAng = null; e.preventDefault();
      try { view.setPointerCapture(e.pointerId); } catch (_) {}
    });
    view.addEventListener('pointermove', (e) => {
      if (!dragging || cs.step !== 'stir') return;
      const p = pt(e); if (!p) return;
      const ang = Math.atan2(p.y - 58, p.x - 50);
      if (lastAng !== null) {
        let d = ang - lastAng;
        if (d > Math.PI) d -= Math.PI * 2;
        if (d < -Math.PI) d += Math.PI * 2;
        if (Math.abs(d) < 1.2) cs.stir = Math.min(1, cs.stir + Math.abs(d) / (Math.PI * 2 * 3));
      }
      lastAng = ang;
      if (cs.stir >= 1) { dragging = false; cs.step = 'top'; api.Sound.Sfx.ding(); render(); return; }
      renderLight();
      const prog = $('#kitchenPanel .cprog');
      if (prog) { prog.querySelector('i').style.width = Math.round(cs.stir * 100) + '%'; prog.querySelector('span').textContent = Math.round(cs.stir * 100) + '%'; }
    });
    ['pointerup', 'pointercancel'].forEach((ev) => view.addEventListener(ev, () => { dragging = false; }));
    document.querySelectorAll('[data-close-kitchen]').forEach((b) => b.addEventListener('click', () => api.close()));

    return {
      setOpen(v, which) { open = v; if (which) tab = which; if (!v) { pouring = false; roasting = false; } render(); },
    };
  };

  // 방 안 주방 카운터 그림
  window.Kitchen.counterArt = function () {
    return `<svg viewBox="0 0 180 140" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="90" cy="134" rx="84" ry="6" fill="#000" opacity=".12"/>
      <rect x="8" y="58" width="164" height="74" rx="6" fill="#fff4e2" stroke="${LINE}" stroke-width="2.4"/>
      <rect x="16" y="68" width="70" height="56" rx="5" fill="#ffe7cc" stroke="${LINE}" stroke-width="2"/>
      <rect x="94" y="68" width="70" height="56" rx="5" fill="#ffe7cc" stroke="${LINE}" stroke-width="2"/>
      <circle cx="78" cy="96" r="3" fill="${LINE}"/><circle cx="102" cy="96" r="3" fill="${LINE}"/>
      <path d="M8 68 L172 68" stroke="${LINE}" stroke-width="2" opacity=".2"/>
      <rect x="2" y="48" width="176" height="14" rx="4" fill="#c98a5e" stroke="${LINE}" stroke-width="2.4"/>
      <rect x="2" y="48" width="176" height="5" rx="2.5" fill="#dba27a"/>
      <!-- 가스레인지 + 냄비 -->
      <rect x="18" y="40" width="54" height="10" rx="3" fill="#d8d8de" stroke="${LINE}" stroke-width="2"/>
      <path d="M24 40 L24 22 Q45 16 66 22 L66 40 Z" fill="#e8474f" stroke="${LINE}" stroke-width="2.2"/>
      <ellipse cx="45" cy="22" rx="21" ry="5" fill="#8a5a3b" stroke="${LINE}" stroke-width="2"/>
      <path d="M66 26 L80 22" stroke="${LINE}" stroke-width="3.5" stroke-linecap="round"/>
      <g fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" class="steam">
        <path d="M38 16 q-4 -5 0 -10 q4 -5 0 -10"/><path d="M52 16 q-4 -5 0 -10 q4 -5 0 -10"/></g>
      <!-- 머그컵 + 마시멜로 병 -->
      <g transform="translate(92 14) scale(.34)">${mug('#8a5a3b', 0.8, 'mallow', false)}</g>
      <g transform="translate(124 6)"><rect x="0" y="8" width="34" height="34" rx="8" fill="#eaf4ff" stroke="${LINE}" stroke-width="2" opacity=".95"/>
        <rect x="4" y="2" width="26" height="8" rx="3" fill="#e8474f" stroke="${LINE}" stroke-width="2"/>
        ${[[9, 30], [21, 32], [15, 22], [26, 22], [9, 18]].map(([x, y]) => `<rect x="${x - 4}" y="${y - 3}" width="8" height="7" rx="2" fill="#fffaf2" stroke="${LINE}" stroke-width="1.2"/>`).join('')}</g>
      <g transform="translate(58 98) rotate(-5)">
        <path d="M0 0 L62 0 L58 20 L4 20 Z" fill="#fffaf2" stroke="${LINE}" stroke-width="1.8" stroke-linejoin="round"/>
        <rect x="3" y="3" width="56" height="14" rx="3" fill="none" stroke="#3f9c6d" stroke-width="1.2" stroke-dasharray="3 2"/>
        <text x="31" y="14" text-anchor="middle" font-size="10" font-family="Jua, sans-serif" fill="${LINE}">주방 ☕</text>
      </g>
    </svg>`;
  };
})();
