// 🎁 선물 랜덤 교환: 그림 그리기 → 포장 → 교환 상자에 넣으면 다른 사람 선물이 나와요
(function () {
  const LINE = '#5b4036';
  const WRAP = {
    red: ['#e8474f', '#fff', 'stripe'], green: ['#3f9c6d', '#fffaf2', 'dot'], blue: ['#5b8def', '#fff', 'snow'],
    pink: ['#ff9db5', '#fff', 'dot'], gold: ['#f2c14e', '#fff6d0', 'stripe'],
  };
  const RIB = { gold: '#ffd34d', red: '#e8474f', white: '#fffaf2', green: '#3f9c6d' };
  let pid = 0;
  function pattern(id, w) {
    const [bg, fg, kind] = WRAP[w] || WRAP.red;
    let inner = '';
    if (kind === 'stripe') inner = `<path d="M-2 10 L10 -2 M-2 22 L22 -2 M10 22 L22 10" stroke="${fg}" stroke-width="3" opacity=".7"/>`;
    else if (kind === 'dot') inner = `<circle cx="5" cy="5" r="2" fill="${fg}" opacity=".85"/><circle cx="15" cy="15" r="2" fill="${fg}" opacity=".85"/>`;
    else inner = `<g stroke="${fg}" stroke-width="1.4" stroke-linecap="round" opacity=".85"><path d="M10 5 L10 15 M5.7 7.5 L14.3 12.5 M5.7 12.5 L14.3 7.5"/></g>`;
    return `<pattern id="${id}" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="${bg}"/>${inner}</pattern>`;
  }
  // 포장된 선물 상자 (viewBox -50 -50 100 100). lid: 0(닫힘)~1(열림)
  function box(w, r, lid = 0, shake = false) {
    const id = 'gp' + (++pid), rc = RIB[r] || RIB.gold;
    const ly = -lid * 34, la = lid * -24;
    return `<svg viewBox="-50 -56 100 106" xmlns="http://www.w3.org/2000/svg" class="${shake ? 'gshake' : ''}">
      <defs>${pattern(id, w)}</defs>
      <ellipse cx="0" cy="42" rx="38" ry="5" fill="#000" opacity=".1"/>
      <rect x="-32" y="-8" width="64" height="48" rx="5" fill="url(#${id})" stroke="${LINE}" stroke-width="3"/>
      <rect x="-32" y="-8" width="64" height="9" fill="#000" opacity=".1"/>
      <rect x="-6" y="-8" width="12" height="48" fill="${rc}" stroke="${LINE}" stroke-width="2.4"/>
      <g transform="translate(0 ${ly}) rotate(${la} -36 -8)">
        <rect x="-36" y="-22" width="72" height="16" rx="4" fill="url(#${id})" stroke="${LINE}" stroke-width="3"/>
        <rect x="-6" y="-22" width="12" height="16" fill="${rc}" stroke="${LINE}" stroke-width="2.4"/>
        <path d="M0 -22 C-8 -40 -28 -36 -20 -24 C-16 -19 -6 -21 0 -22 Z M0 -22 C8 -40 28 -36 20 -24 C16 -19 6 -21 0 -22 Z" fill="${rc}" stroke="${LINE}" stroke-width="2.6" stroke-linejoin="round"/>
        <circle cx="0" cy="-23" r="5" fill="${rc}" stroke="${LINE}" stroke-width="2.6"/>
      </g>
    </svg>`;
  }
  // 방 안의 선물 교환 상자
  function roomArt(n) {
    const id = 'gpr';
    return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>${pattern(id, 'red')}</defs>
      <ellipse cx="60" cy="112" rx="52" ry="7" fill="#000" opacity=".13"/>
      <rect x="14" y="44" width="92" height="66" rx="7" fill="url(#${id})" stroke="${LINE}" stroke-width="3.4"/>
      <rect x="52" y="44" width="16" height="66" fill="#ffd34d" stroke="${LINE}" stroke-width="2.6"/>
      <rect x="8" y="30" width="104" height="20" rx="6" fill="#e8474f" stroke="${LINE}" stroke-width="3.4"/>
      <rect x="30" y="35" width="60" height="9" rx="4.5" fill="#5b2a22"/>
      <path d="M60 30 C50 10 26 14 36 28 Z M60 30 C70 10 94 14 84 28 Z" fill="#ffd34d" stroke="${LINE}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="60" cy="29" r="6" fill="#ffd34d" stroke="${LINE}" stroke-width="3"/>
      <g transform="translate(60 80) rotate(-4)"><rect x="-30" y="-11" width="60" height="22" rx="5" fill="#fffaf2" stroke="${LINE}" stroke-width="2"/>
        <text y="5" text-anchor="middle" font-size="13" font-family="Jua, sans-serif" fill="${LINE}">선물 교환</text></g>
      ${n ? `<g transform="translate(104 34)"><circle r="12" fill="#3f9c6d" stroke="#fff" stroke-width="3"/><text y="5" text-anchor="middle" font-size="13" font-family="Jua, sans-serif" fill="#fff">${n > 99 ? '99+' : n}</text></g>` : ''}
    </svg>`;
  }
  window.Gift = { box, roomArt };

  const COLORS = ['#5b4036', '#e8474f', '#ff9a3c', '#ffd34d', '#3f9c6d', '#5b9cf0', '#8b7cf2', '#ff9db5', '#ffffff'];
  const SIZES = [4, 9, 18];

  window.GiftUI = function (api) {
    const $ = (s) => document.querySelector(s);
    let open = false, tab = 'make', step = 'draw', state = { waiting: false, box: [] };
    let color = COLORS[0], size = 1, eraser = false, strokes = [], cur = null;
    let wrap = 'red', rib = 'gold', anon = false, sending = false, result = null;
    let canvas = null, ctx = null;

    function redraw() {
      if (!ctx) return;
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (const s of strokes.concat(cur ? [cur] : [])) {
        ctx.strokeStyle = s.c; ctx.lineWidth = s.w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        const p = s.p;
        ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]);
        if (p.length === 1) ctx.lineTo(p[0][0] + 0.1, p[0][1]);
        for (let i = 1; i < p.length - 1; i++) ctx.quadraticCurveTo(p[i][0], p[i][1], (p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2);
        if (p.length > 1) ctx.lineTo(p[p.length - 1][0], p[p.length - 1][1]);
        ctx.stroke();
      }
    }
    function cpos(e) {
      const r = canvas.getBoundingClientRect();
      return [(e.clientX - r.left) * canvas.width / r.width, (e.clientY - r.top) * canvas.height / r.height];
    }
    function bindCanvas() {
      canvas = $('#giftCanvas'); if (!canvas) { ctx = null; return; }
      ctx = canvas.getContext('2d');
      redraw();
      canvas.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
        cur = { c: eraser ? '#ffffff' : color, w: SIZES[size] * (eraser ? 2 : 1), p: [cpos(e)] };
        redraw();
      });
      canvas.addEventListener('pointermove', (e) => {
        if (!cur) return;
        const p = cpos(e), l = cur.p[cur.p.length - 1];
        if (Math.hypot(p[0] - l[0], p[1] - l[1]) < 2) return;
        cur.p.push(p); redraw();
      });
      const end = () => { if (!cur) return; strokes.push(cur); cur = null; if (strokes.length > 400) strokes.shift(); redraw(); updateBtns(); };
      canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
    }
    function updateBtns() {
      const u = $('#giftPanel [data-act=undo]'); if (u) u.disabled = !strokes.length;
      const n = $('#giftPanel [data-act=wrap]'); if (n) n.disabled = strokes.reduce((a, s) => a + s.p.length, 0) < 8;
    }
    function exportImg() {
      const out = document.createElement('canvas'); out.width = 360; out.height = 360;
      out.getContext('2d').drawImage(canvas, 0, 0, 360, 360);
      let d = out.toDataURL('image/webp', 0.85);
      if (!d.startsWith('data:image/webp') || d.length > 400000) d = out.toDataURL('image/jpeg', 0.82);
      return d;
    }
    const unopened = () => state.box.filter((g) => !g.opened).length;
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

    function render() {
      if (!open) return;
      const n = unopened();
      document.querySelectorAll('#giftTabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
      $('#giftTabs [data-tab=box]').innerHTML = `📦 받은 선물함${n ? ` <b class="gbadge">${n}</b>` : ''}`;
      const view = $('#giftView'), panel = $('#giftPanel');
      if (tab === 'box') {
        view.innerHTML = state.box.length
          ? `<div class="gshelf">${state.box.map((g) => `<button class="gitem ${g.opened ? 'opened' : ''}" data-id="${g.id}">${box(g.wrap, g.rib, g.opened ? 0.25 : 0, !g.opened)}<small>${g.opened ? esc(g.from || '익명의 친구') : '새 선물!'}</small></button>`).join('')}</div>`
          : `<div class="gempty">${box('green', 'gold')}<p>아직 받은 선물이 없어요.<br>그림 선물을 교환 상자에 넣으면<br>다른 친구의 선물이 나와요!</p></div>`;
        panel.innerHTML = `<p class="chint">선물을 누르면 열어 볼 수 있어요 🎁</p>
          <p class="chint small">${state.waiting ? '⏳ 내 선물이 교환을 기다리는 중이에요. 다른 친구가 선물을 넣으면 바로 받아요!' : '받은 선물은 내 계정에 5개까지 보관돼요. 넘치면 열어 본 오래된 선물부터 빠져요'}</p>`;
        canvas = null; ctx = null;
        return;
      }
      // 선물 만들기
      if (state.waiting && !result) {
        view.innerHTML = `<div class="gempty">${box(wrap, rib, 0, true)}<p>교환 상자 안에서<br>내 선물이 기다리고 있어요 ⏳</p></div>`;
        panel.innerHTML = `<p class="chint big">다른 친구가 선물을 넣으면<br>그 선물이 나에게 와요!</p>
          <p class="chint small">한 번에 하나씩 교환할 수 있어요. 선물이 오면 알려줄게요 🔔</p>`;
        return;
      }
      if (result) {
        view.innerHTML = `<div class="gempty">${box(result.wrap || 'gold', result.rib || 'red', 0, true)}<p>${result.got ? '짜잔! 교환 상자에서<br>선물이 나왔어요 🎉' : '선물을 넣었어요!'}</p></div>`;
        panel.innerHTML = result.got
          ? `<p class="chint big">누군가의 선물이 도착했어요!</p><button class="btn primary cnext" data-act="gobox">📦 받은 선물함에서 열어 보기</button>`
          : `<p class="chint big">아직 교환할 선물이 없어요</p><p class="chint">다른 친구가 선물을 넣으면 바로 받아요. 알려줄게요 🔔</p>
             <button class="btn ghost" data-act="ok">확인</button>`;
        return;
      }
      if (step === 'draw') {
        if (!$('#giftCanvas')) view.innerHTML = `<canvas id="giftCanvas" class="gcanvas" width="600" height="600"></canvas>`;
        panel.innerHTML = `<p class="chint">친구에게 줄 <b>그림 선물</b>을 그려요. 누가 받을지는 랜덤이에요!</p>
          <div class="gcolors">${COLORS.map((c) => `<button class="gcol ${!eraser && c === color ? 'on' : ''}" data-col="${c}" style="background:${c}"></button>`).join('')}</div>
          <div class="crow gtools">
            ${SIZES.map((s, i) => `<button class="gsize ${!eraser && i === size ? 'on' : ''}" data-size="${i}"><i style="width:${4 + i * 5}px;height:${4 + i * 5}px"></i></button>`).join('')}
            <button class="btn ghost small ${eraser ? 'on' : ''}" data-act="eraser">지우개</button>
            <button class="btn ghost small" data-act="undo">↩</button>
            <button class="btn ghost small" data-act="clear">다 지우기</button>
          </div>
          <button class="btn primary cnext" data-act="wrap">🎀 다 그렸어요! 포장하기</button>`;
        if (!ctx || canvas !== $('#giftCanvas')) bindCanvas();
        updateBtns();
        return;
      }
      // 포장
      if (!canvas) { step = 'draw'; return render(); }
      const preview = canvas ? canvas.toDataURL('image/png') : '';
      view.innerHTML = `<div class="gwrapview"><img class="gthumb" src="${preview}" alt="">${box(wrap, rib)}</div>`;
      panel.innerHTML = `<p class="chint">포장지와 리본을 골라요</p>
        <div class="gopts">${Object.keys(WRAP).map((w) => `<button class="gopt ${w === wrap ? 'on' : ''}" data-wrap="${w}">${box(w, rib)}</button>`).join('')}</div>
        <div class="gopts rib">${Object.keys(RIB).map((r) => `<button class="gopt ${r === rib ? 'on' : ''}" data-rib="${r}"><i style="background:${RIB[r]}"></i></button>`).join('')}</div>
        <label class="ganon"><input type="checkbox" id="giftAnon" ${anon ? 'checked' : ''}> 이름 숨기기 (익명으로 보내기)</label>
        <div class="crow"><button class="btn ghost" data-act="back">◀ 다시 그리기</button>
          <button class="btn primary cnext" data-act="send" ${sending ? 'disabled' : ''}>🎁 교환 상자에 넣기</button></div>`;
      $('#giftAnon').addEventListener('change', (e) => { anon = e.target.checked; });
    }

    $('#giftPanel').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      if (b.dataset.col) { color = b.dataset.col; eraser = false; api.Sound.Sfx.pop(); render(); }
      else if (b.dataset.size) { size = Number(b.dataset.size); eraser = false; render(); }
      else if (b.dataset.wrap) { wrap = b.dataset.wrap; api.Sound.Sfx.pop(); render(); }
      else if (b.dataset.rib) { rib = b.dataset.rib; api.Sound.Sfx.pop(); render(); }
      else switch (b.dataset.act) {
        case 'eraser': eraser = !eraser; render(); break;
        case 'undo': strokes.pop(); redraw(); updateBtns(); break;
        case 'clear': if (strokes.length && confirmClear()) { strokes = []; redraw(); updateBtns(); } break;
        case 'wrap': step = 'wrap'; api.Sound.Sfx.plop(); render(); break;
        case 'back': step = 'draw'; $('#giftView').innerHTML = ''; ctx = null; render(); break;
        case 'send':
          if (sending) return;
          sending = true; render();
          api.send({ t: 'gift', act: 'send', img: exportImg(), wrap, rib, anon });
          setTimeout(() => { if (sending) { sending = false; render(); } }, 8000);
          break;
        case 'gobox': result = null; tab = 'box'; render(); break;
        case 'ok': result = null; render(); break;
      }
    });
    let clearArmed = 0;
    function confirmClear() { // 실수로 다 지우지 않게 두 번 눌러야 지워져요
      const now = Date.now();
      if (now - clearArmed < 1500) { clearArmed = 0; return true; }
      clearArmed = now; api.toast('한 번 더 누르면 다 지워져요'); return false;
    }
    $('#giftView').addEventListener('click', (e) => {
      const b = e.target.closest('.gitem'); if (!b) return;
      const g = state.box.find((x) => x.id === b.dataset.id); if (!g) return;
      api.send({ t: 'gift', act: g.opened ? 'view' : 'open', id: g.id });
    });
    document.querySelectorAll('#giftTabs button').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; if (tab === 'make') { $('#giftView').innerHTML = ''; ctx = null; } render(); }));
    document.querySelectorAll('[data-close-gift]').forEach((b) => b.addEventListener('click', () => api.close()));

    // 선물 열기 (풀린 리본 → 뚜껑 뿅 → 그림 카드)
    function showOpen(m) {
      const ov = $('#giftOpen');
      const from = m.from ? `${esc(m.from)} 님이 보낸 선물` : '익명의 친구가 보낸 선물';
      ov.innerHTML = `<div class="gopen-card">
          <div class="gopen-box">${box(m.wrap, m.rib, 0, true)}</div>
          <div class="gopen-pic" hidden>${m.img ? `<img src="${m.img}" alt="그림 선물">` : '<p>그림을 불러오지 못했어요 😢</p>'}</div>
          <p class="gopen-from" hidden>${from}</p>
          <div class="crow gopen-btns" hidden>
            ${m.img ? `<a class="btn ghost small" download="크리스마스-선물.png" href="${m.img}">💾 저장</a>` : ''}
            <button class="btn ghost small" data-gact="toss">버리기</button>
            <button class="btn primary small" data-gact="close">고마워요! 💝</button>
          </div></div>`;
      ov.hidden = false; ov.dataset.id = m.id;
      const reveal = () => {
        ov.querySelector('.gopen-box').innerHTML = box(m.wrap, m.rib, 1);
        api.Sound.Sfx.tada(); api.confetti && api.confetti(ov.querySelector('.gopen-card'));
        setTimeout(() => {
          ov.querySelector('.gopen-box').hidden = true;
          ['.gopen-pic', '.gopen-from', '.gopen-btns'].forEach((s) => { ov.querySelector(s).hidden = false; });
        }, 550);
      };
      if (m.first) { api.Sound.Sfx.pop(); setTimeout(reveal, 900); } else reveal();
    }
    $('#giftOpen').addEventListener('click', (e) => {
      const b = e.target.closest('[data-gact]'); const ov = $('#giftOpen');
      if (!b) { if (e.target === ov) ov.hidden = true; return; }
      if (b.dataset.gact === 'toss') { api.send({ t: 'gift', act: 'toss', id: ov.dataset.id }); }
      ov.hidden = true;
    });

    return {
      setOpen(v) { open = v; if (!v) { $('#giftView').innerHTML = ''; ctx = null; result = null; } render(); },
      setState(st) { state = st || state; render(); },
      sent(got) {
        sending = false; result = got ? { got, wrap: 'gold', rib: 'red' } : { got, wrap, rib }; strokes = []; step = 'draw';
        api.Sound.Sfx[got ? 'tada' : 'ding'](); render();
      },
      opened: showOpen,
      unopened,
      showBox() { tab = 'box'; render(); },
      arrived() { if (result && !result.got) result = { got: true, wrap: 'gold', rib: 'red' }; render(); },
    };
  };
})();
