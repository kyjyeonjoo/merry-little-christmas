// 🪑 흔들의자 · 🧶 뜨개질
(function () {
  const L = '#5b4036';
  const YARN = [['#e8474f', '빨강'], ['#fff6e0', '크림'], ['#3f9c6d', '초록'], ['#3a4f86', '남색'], ['#ff9db5', '분홍'], ['#ffd34d', '노랑'], ['#8fc4f5', '하늘'], ['#a487e8', '보라']];
  // 흔들의자 (발 밑 가운데 0,0 · 오른쪽을 보고 있어요)
  function chairBack() {
    return `<svg viewBox="-60 -118 120 128" xmlns="http://www.w3.org/2000/svg"><g class="rock-g">
      <path d="M-34 -10 L-30 -108 Q-22 -116 -14 -108 L-18 -10" fill="#b97a4f" stroke="${L}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M-30 -96 L-16 -96 M-30 -78 L-16 -78 M-30 -60 L-17 -60 M-31 -42 L-17 -42" stroke="${L}" stroke-width="2"/>
      <path d="M-28 -104 Q-36 -82 -26 -60 Q-20 -46 -24 -30 L-18 -30 L-16 -104 Z" fill="#e8474f" opacity=".9"/>
      <path d="M-28 -98 L-18 -98 M-28 -86 L-18 -86 M-27 -74 L-18 -74 M-25 -62 L-18 -62" stroke="#fff6e0" stroke-width="2.4" opacity=".8"/>
      <rect x="-38" y="-38" width="74" height="12" rx="5" fill="#c98a5e" stroke="${L}" stroke-width="2.4"/>
      <path d="M-36 -40 Q-2 -48 34 -40" stroke="#fff6e0" stroke-width="7" fill="none" stroke-linecap="round" opacity=".95"/>
      <path d="M-36 -40 Q-2 -48 34 -40" stroke="#e8474f" stroke-width="7" fill="none" stroke-dasharray="5 6" opacity=".8"/>
    </g></svg>`;
  }
  function chairFront() {
    return `<svg viewBox="-60 -118 120 128" xmlns="http://www.w3.org/2000/svg"><g class="rock-g">
      <path d="M-48 2 Q0 14 48 -4" stroke="#8c5232" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M-48 2 Q0 14 48 -4" stroke="${L}" stroke-width="1.6" fill="none" opacity=".4"/>
      <path d="M-30 -30 L-30 6 M24 -30 L26 4" stroke="#8c5232" stroke-width="5" stroke-linecap="round"/>
      <rect x="-38" y="-30" width="74" height="6" rx="3" fill="#b97a4f" stroke="${L}" stroke-width="2"/>
      <path d="M28 -64 Q40 -66 40 -54 L36 -36" stroke="#b97a4f" stroke-width="5" fill="none" stroke-linecap="round"/>
    </g></svg>`;
  }
  function yarnBall(c = '#e8474f') {
    return `<svg viewBox="-24 -24 48 48" xmlns="http://www.w3.org/2000/svg"><circle r="12" fill="${c}" stroke="${L}" stroke-width="2"/>
      <path d="M-10 -4 Q0 -12 10 -6 M-11 3 Q0 -6 11 2 M-7 9 Q2 2 9 8" stroke="#fff" stroke-width="1.6" fill="none" opacity=".55"/>
      <path d="M-14 -16 L6 6 M14 -18 L-4 6" stroke="#c9ced8" stroke-width="2.6" stroke-linecap="round"/><circle cx="-14" cy="-16" r="2.4" fill="#ffd34d"/><circle cx="14" cy="-18" r="2.4" fill="#ffd34d"/>
      <path d="M10 8 Q18 14 22 22" stroke="${c}" stroke-width="2" fill="none"/></svg>`;
  }
  // 뜨는 중인 목도리/모자 미리보기 (rows: 0~1)
  function piece(part, c1, c2, prog) {
    if (part === 'hat') {
      const h = Math.max(0.05, prog);
      return `<svg viewBox="0 0 160 140" xmlns="http://www.w3.org/2000/svg">
        <clipPath id="kclip"><rect x="0" y="${130 - 110 * h}" width="160" height="${110 * h + 10}"/></clipPath>
        <g clip-path="url(#kclip)">
          <path d="M28 112 Q24 30 80 26 Q136 30 132 112 Z" fill="${c1}" stroke="${L}" stroke-width="3"/>
          <path d="M34 72 Q80 56 126 72" stroke="${c2}" stroke-width="9" fill="none"/>
          ${Array.from({ length: 9 }, (_, i) => `<path d="M${40 + i * 10} 40 v70" stroke="${L}" stroke-width="1" opacity=".18"/>`).join('')}
          <rect x="20" y="100" width="120" height="24" rx="11" fill="${c2}" stroke="${L}" stroke-width="3"/>
          ${Array.from({ length: 11 }, (_, i) => `<path d="M${30 + i * 10} 102 v20" stroke="${c1}" stroke-width="2.4" opacity=".55"/>`).join('')}
        </g>
        ${prog >= 1 ? `<circle cx="80" cy="20" r="14" fill="${c2}" stroke="${L}" stroke-width="3"/>` : ''}
        <path d="M30 ${130 - 110 * h} L130 ${130 - 110 * h}" stroke="#c9ced8" stroke-width="4" stroke-linecap="round" opacity="${prog >= 1 ? 0 : 1}"/>
      </svg>`;
    }
    const rows = Math.max(1, Math.round(prog * 12));
    return `<svg viewBox="0 0 160 140" xmlns="http://www.w3.org/2000/svg">
      ${Array.from({ length: rows }, (_, i) => `<g transform="translate(0 ${120 - i * 9})"><rect x="50" y="0" width="60" height="9" fill="${Math.floor(i / 2) % 2 ? c2 : c1}" stroke="${L}" stroke-width="1.2"/>
        ${Array.from({ length: 6 }, (_, j) => `<path d="M${54 + j * 10} 1 l3 7 l3 -7" stroke="${L}" stroke-width=".9" fill="none" opacity=".35"/>`).join('')}</g>`).join('')}
      ${prog >= 1 ? `<path d="M52 129 l-2 8 M62 129 l0 8 M72 129 l0 8 M82 129 l0 8 M92 129 l0 8 M102 129 l2 8" stroke="${c1}" stroke-width="3" stroke-linecap="round"/>` : ''}
      <path d="M40 ${118 - (rows - 1) * 9} L120 ${112 - (rows - 1) * 9}" stroke="#c9ced8" stroke-width="4" stroke-linecap="round"/>
      <path d="M44 ${126 - (rows - 1) * 9} L118 ${104 - (rows - 1) * 9}" stroke="#c9ced8" stroke-width="4" stroke-linecap="round"/>
    </svg>`;
  }
  window.KnitArt = { chairBack, chairFront, yarnBall, YARN };

  window.KnitUI = function (api) {
    const $ = (s) => document.querySelector(s);
    let open = false, tab = 'knit', part = 'scarf', c1 = YARN[0][0], c2 = YARN[1][0];
    let stage = 'pick', prog = 0, hits = 0, misses = 0, pos = 0, dir = 1, speed = 0.9, zone = [0.4, 0.6], raf = null, last = 0, knits = [];
    const NEED = 12;
    function newZone() { const w = Math.max(0.12, 0.22 - hits * 0.008); const c = 0.2 + Math.random() * 0.6; zone = [c - w / 2, c + w / 2]; }
    function loop(t) {
      const dt = Math.min(0.05, (t - last) / 1000); last = t;
      pos += dir * speed * dt;
      if (pos > 1) { pos = 1; dir = -1; } if (pos < 0) { pos = 0; dir = 1; }
      const m = $('#knitBar i'); if (m) m.style.left = (pos * 100) + '%';
      raf = requestAnimationFrame(loop);
    }
    function render() {
      if (!open) return;
      document.querySelectorAll('#knitTabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
      const view = $('#knitView'), panel = $('#knitPanel');
      if (tab === 'closet') {
        cancelAnimationFrame(raf); raf = null;
        const worn = api.worn();
        view.innerHTML = `<div class="kcloset-av">${api.myAvatar()}</div>`;
        panel.innerHTML = knits.length ? `<p class="chint">누르면 입거나 벗어요</p><div class="kcloset">${knits.map((k, i) => {
          const on = worn[k.part] && worn[k.part][0] === k.cols[0] && worn[k.part][1] === k.cols[1];
          return `<button class="cbtn sm ${on ? 'on' : ''}" data-wear="${i}"><span class="ic"><svg viewBox="0 0 160 140">${piece(k.part, k.cols[0], k.cols[1], 1).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg></span><small>${k.part === 'hat' ? '털모자' : '목도리'}${on ? ' · 입는 중' : ''}</small></button>`;
        }).join('')}</div><p class="chint small">최대 8개까지 보관돼요</p>` : '<p class="chint big">아직 뜬 옷이 없어요</p><p class="chint">흔들의자에 앉아서 떠 봐요 🧶</p>';
        return;
      }
      if (stage === 'pick') {
        cancelAnimationFrame(raf); raf = null;
        view.innerHTML = `<div class="kpreview">${piece(part, c1, c2, 1)}</div>`;
        const sw = (which, cur) => `<div class="kyarn">${YARN.map(([c, n]) => `<button class="kcol ${c === cur ? 'on' : ''}" data-${which}="${c}" style="background:${c}" title="${n}"></button>`).join('')}</div>`;
        panel.innerHTML = `${api.sitting() ? '' : '<p class="chint big">🪑 흔들의자에 앉아야 뜰 수 있어요</p>'}
          <div class="crow kparts"><button class="btn ghost small ${part === 'scarf' ? 'on' : ''}" data-part="scarf">🧣 목도리</button><button class="btn ghost small ${part === 'hat' ? 'on' : ''}" data-part="hat">🧶 털모자</button></div>
          <p class="clabel-sm">바탕 실</p>${sw('c1', c1)}<p class="clabel-sm">줄무늬 실</p>${sw('c2', c2)}
          <button class="btn primary cnext" data-act="start" ${api.sitting() ? '' : 'disabled'}>🧶 뜨기 시작!</button>`;
        return;
      }
      if (stage === 'knit') {
        view.innerHTML = `<div class="kpreview">${piece(part, c1, c2, prog)}</div>`;
        panel.innerHTML = `<p class="chint">바늘이 <b>초록 칸</b>에 왔을 때 눌러서 한 코씩 떠요!</p>
          <div class="kbar" id="knitBar"><b style="left:${zone[0] * 100}%;width:${(zone[1] - zone[0]) * 100}%"></b><i style="left:${pos * 100}%"></i></div>
          <div class="cprog"><i style="width:${prog * 100}%"></i><span>${hits} / ${NEED}코</span></div>
          <button class="btn primary cnext ktap" data-act="stitch">🧶 한 코 뜨기</button>
          <button class="btn ghost small quit-btn" data-act="stop">그만 뜰래요</button>`;
        if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
        return;
      }
      // 완성
      cancelAnimationFrame(raf); raf = null;
      view.innerHTML = `<div class="kpreview done">${piece(part, c1, c2, 1)}</div>`;
      panel.innerHTML = `<p class="chint big">짜잔! ${part === 'hat' ? '털모자' : '목도리'} 완성 🎉</p><p class="chint">바로 입었어요! 옷장에서 벗거나 바꿔 입을 수 있어요</p>
        <div class="crow"><button class="btn ghost" data-act="again">하나 더 뜨기</button><button class="btn primary" data-tab2="closet">👕 내 뜨개 옷장</button></div>`;
    }
    $('#knitPanel').addEventListener('pointerdown', (e) => {
      const b = e.target.closest('[data-act=stitch]'); if (!b) return;
      e.preventDefault();
      const ok = pos >= zone[0] && pos <= zone[1];
      if (ok) { hits++; prog = hits / NEED; speed = Math.min(1.8, speed + 0.06); api.Sound.Sfx.pop(); newZone(); }
      else { misses++; api.Sound.Sfx.tick(); b.classList.remove('miss'); void b.offsetWidth; b.classList.add('miss'); }
      if (hits >= NEED) { stage = 'done'; api.send({ t: 'knit', act: 'done', part, c1, c2 }); api.send({ t: 'knit', act: 'off' }); api.Sound.Sfx.tada(); }
      render();
    });
    $('#knitPanel').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      if (b.dataset.part) { part = b.dataset.part; render(); }
      else if (b.dataset.c1) { c1 = b.dataset.c1; render(); }
      else if (b.dataset.c2) { c2 = b.dataset.c2; render(); }
      else if (b.dataset.wear) { api.send({ t: 'knit', act: 'wear', i: Number(b.dataset.wear) }); api.Sound.Sfx.pop(); }
      else if (b.dataset.tab2) { tab = b.dataset.tab2; render(); }
      else if (b.dataset.act === 'start') { stage = 'knit'; hits = 0; misses = 0; prog = 0; speed = 0.9; pos = 0; newZone(); api.send({ t: 'knit', act: 'on' }); render(); }
      else if (b.dataset.act === 'stop') { stage = 'pick'; api.send({ t: 'knit', act: 'off' }); render(); }
      else if (b.dataset.act === 'again') { stage = 'pick'; render(); }
    });
    document.querySelectorAll('#knitTabs button').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; render(); }));
    document.querySelectorAll('[data-close-knit]').forEach((b) => b.addEventListener('click', () => api.close()));
    return {
      setOpen(v, t) {
        open = v; if (t) tab = t;
        if (!v) { cancelAnimationFrame(raf); raf = null; if (stage === 'knit') { stage = 'pick'; api.send({ t: 'knit', act: 'off' }); } }
        render();
      },
      setKnits(k) { knits = k || []; if (tab === 'closet') render(); },
      refresh() { if (open && tab === 'closet') render(); },
      onStand() { if (open && stage === 'knit') { stage = 'pick'; render(); } else if (open && stage === 'pick') render(); },
    };
  };
})();
