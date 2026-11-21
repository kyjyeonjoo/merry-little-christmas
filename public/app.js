// 🎄 크리스마스 놀이방 — 클라이언트
(() => {
  const $ = (s) => document.querySelector(s);
  const STAGE_W = 1000, STAGE_H = 620;
  const BOUNDS = { minX: 40, maxX: 960, minY: 340, maxY: 600 };
  const WALK_SPEED = 170; // px/s
  // 서버(server.js)의 SEATS와 같은 id/좌표
  const SEATS = {
    armL: { x: 236, y: 400, kind: 'arm', face: 1 },
    armR: { x: 800, y: 395, kind: 'arm', face: -1 },
    sofa1: { x: 360, y: 578, kind: 'sofa' },
    sofa2: { x: 500, y: 578, kind: 'sofa' },
    sofa3: { x: 640, y: 578, kind: 'sofa' },
    cush1: { x: 345, y: 500, kind: 'cush', face: 1 },
    cush2: { x: 655, y: 500, kind: 'cush', face: -1 },
    cush3: { x: 262, y: 512, kind: 'cush', face: 1 },
    poufL: { x: 105, y: 520, kind: 'pouf', face: 1 },
    poufR: { x: 895, y: 520, kind: 'pouf', face: -1 },
  };

  // ───────── 상태 ─────────
  let ws = null;
  let token = localStorage.getItem('xmas_token');
  let me = null;          // { id(playerId), user }
  let myUser = null;      // { id, nick, avatar }
  let justSignedUp = false;
  const players = new Map(); // id -> { data, el }

  // ───────── 눈 내리기 ─────────
  (function makeSnow() {
    const box = $('#snow');
    const flakes = ['❄', '❅', '•', '•', '•'];
    for (let i = 0; i < 40; i++) {
      const s = document.createElement('span');
      s.textContent = flakes[i % flakes.length];
      s.style.left = Math.random() * 100 + 'vw';
      s.style.fontSize = 8 + Math.random() * 14 + 'px';
      s.style.animationDuration = 8 + Math.random() * 12 + 's';
      s.style.animationDelay = -Math.random() * 20 + 's';
      s.style.opacity = 0.4 + Math.random() * 0.6;
      box.appendChild(s);
    }
  })();

  // ───────── 토스트 ─────────
  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
  }

  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ───────── 🎂 케이크 ─────────
  let cakeState = null;
  const cakeUI = CakeUI({
    send: (m) => send(m), toast, Sound, esc,
    playerCount: () => players.size,
    myUid: () => myUser && myUser.id,
    close: () => closeCake(),
  });
  function openCake() { if ($('#kitchenModal') && !$('#kitchenModal').hidden) closeKitchen(); if (typeof closeTree === 'function') closeTree(); $('#cakeModal').hidden = false; cakeUI.setOpen(true); }
  function closeCake() { $('#cakeModal').hidden = true; cakeUI.setOpen(false); }

  function confetti(box) {
    const colors = ['#e8474f', '#ffc94a', '#3f9c6d', '#8b7cf2', '#ff86a6', '#6fb6ff'];
    for (let i = 0; i < 40; i++) {
      const c = document.createElement('i');
      c.style.background = colors[i % colors.length];
      c.style.left = Math.random() * 100 + '%';
      box.appendChild(c);
      c.animate([
        { transform: `translate(0, -20px) rotate(0)`, opacity: 1 },
        { transform: `translate(${(Math.random() - 0.5) * 120}px, ${260 + Math.random() * 200}px) rotate(${Math.random() * 720}deg)`, opacity: 0 },
      ], { duration: 1400 + Math.random() * 900, easing: 'cubic-bezier(.2,.6,.4,1)', delay: Math.random() * 300 }).onfinish = () => c.remove();
    }
  }
  function onCake(c) {
    const prev = cakeState;
    cakeState = c;
    if (prev && !prev.candlesOut && c.candlesOut) {
      Sound.Sfx.tada();
      confetti($('#confetti'));
    }
    if (prev && prev.stage !== 'done' && c.stage === 'done') Sound.Sfx.tada();
    if (prev && prev.stage === 'lobby' && c.stage === 'ingredients' && c.members.some((x) => myUser && x.uid === myUser.id)) {
      if ($('#cakeModal').hidden) { openCake(); toast('🎂 케이크 만들기가 시작됐어요!'); }
    }
    cakeUI.update(c);
  }

  // ───────── 연결 ─────────
  function connect() {
    const url = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host;
    ws = new WebSocket(url);
    ws.onopen = () => {
      if (token) send({ t: 'auth', token });
      else showAuth();
    };
    ws.onmessage = (e) => {
      let msg; try { msg = JSON.parse(e.data); } catch (_) { return; }
      onMessage(msg);
    };
    ws.onclose = () => {
      if (me) toast('연결이 끊겼어요… 다시 연결하는 중 ❄️');
      setTimeout(connect, 1500);
    };
  }
  function send(obj) {
    if (ws && ws.readyState === 1) ws.send(JSON.stringify(obj));
  }

  function onMessage(m) {
    switch (m.t) {
      case 'authOk':
        token = m.token;
        localStorage.setItem('xmas_token', token);
        justSignedUp = !!m.isNew;
        break;
      case 'authErr':
        $('#authErr').textContent = m.msg;
        $('#authSubmit').disabled = false;
        break;
      case 'authFail':
        token = null;
        localStorage.removeItem('xmas_token');
        showAuth();
        break;
      case 'welcome':
        enterApp(m);
        break;
      case 'join': addPlayer(m.player); updateCount(); break;
      case 'leave': removePlayer(m.id); updateCount(); break;
      case 'move': {
        const p = players.get(m.id);
        if (p) { p.data.seat = null; p.data.facing = m.facing; moveEl(p, m.x, m.y, m.mode); }
        break;
      }
      case 'sit': {
        const p = players.get(m.id);
        if (!p) break;
        p.data.seat = m.seat;
        p.data.facing = SEATS[m.seat].face || m.facing;
        const dur = moveEl(p, m.x, m.y, 'walk');
        clearTimeout(p.sitTimer);
        p.sitTimer = setTimeout(() => {
          if (p.data.seat === m.seat) {
            p.el.classList.add('sitting');
            p.el.dataset.seat = SEATS[m.seat].kind;
            applyFacing(p);
          }
        }, dur * 1000);
        refreshSeats();
        break;
      }
      case 'stand': {
        const p = players.get(m.id);
        if (!p) break;
        p.data.seat = null;
        p.el.classList.remove('sitting');
        moveEl(p, m.x, m.y, 'step');
        refreshSeats();
        break;
      }
      case 'chat': showChat(m); break;
      case 'sys': addLog({ kind: 'sys', text: m.text }); break;
      case 'emote': showEmote(m.id, m.e); Sound.Sfx.pop(); break;
      case 'jump': doJump(m.id); break;
      case 'cake': onCake(m.cake); break;
      case 'cakeBlow': showEmote(m.id, '🌬️'); Sound.Sfx.blow(); break;
      case 'cakeEat': showEmote(m.id, m.taste === 'salty' ? '🥵' : m.taste === 'sweet' ? '🤤' : '😋'); Sound.Sfx.nyam(); break;
      case 'snow': doSnow(m.id); break;
      case 'fw': doFirework(m.id); break;
      case 'notice': showNotice(m); break;
      case 'inv': setInv(m.inv); if (m.added) { Sound.Sfx.ding(); pendingCraft && pendingCraft(true); pendingCraft = null; } break;
      case 'eatItem': onEatItem(m); break;
      case 'tree': onTree(m.tree); break;
      case 'hold': { const p = players.get(m.id); if (p) setHeld(p, m.item); break; }
      case 'heldSlot': heldSlot = m.slot; updateEatBtn(); break;
      case 'throw': doThrow(m.from, m.to); break;
      case 'pupdate': {
        const p = players.get(m.id);
        if (p) { p.data.nick = m.nick; p.data.avatar = m.avatar; renderPlayer(p); refreshSeats(); }
        break;
      }
      case 'profileOk':
        myUser = m.user;
        renderMe();
        closeModal();
        toast('저장했어요 ✨');
        break;
      case 'profileErr':
        $('#profileErr').textContent = m.msg;
        break;
      case 'toast': toast(m.msg); if (pendingCraft && /인벤토리/.test(m.msg)) { pendingCraft(false); pendingCraft = null; } break;
      case 'kicked':
        // 다른 기기에서 같은 계정으로 들어온 경우: 여기서는 로그아웃 상태로 돌아가요
        token = null;
        localStorage.removeItem('xmas_token');
        players.forEach((p) => p.el.remove());
        players.clear();
        showAuth();
        $('#authErr').textContent = m.reason;
        break;
    }
  }

  // ───────── 로그인 화면 ─────────
  let authMode = 'login';
  function showAuth() {
    me = null;
    $('#app').hidden = true;
    $('#authScreen').hidden = false;
    $('#authSubmit').disabled = false;
    const prev = $('#authPreview');
    prev.innerHTML = '';
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    const types = Avatar.TYPES.map((t) => t.id).sort(() => Math.random() - 0.5);
    for (let i = 0; i < 3; i++) {
      const d = document.createElement('div');
      d.className = 'mini bob';
      d.style.animationDelay = i * 0.25 + 's';
      const accs = Avatar.ACCS.map((a) => a.id).sort(() => Math.random() - 0.5).slice(0, 1 + Math.floor(Math.random() * 3));
      d.innerHTML = Avatar.svg({ type: types[i], color: pick(Avatar.COLORS), accs });
      prev.appendChild(d);
    }
  }
  document.querySelectorAll('.tab').forEach((b) =>
    b.addEventListener('click', () => {
      authMode = b.dataset.mode;
      document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('active', x === b));
      $('.pw2').hidden = authMode !== 'signup';
      $('#authPw').autocomplete = authMode === 'signup' ? 'new-password' : 'current-password';
      $('#authSubmit').textContent = authMode === 'signup' ? '계정 만들기 🎁' : '벽난로 곁으로 🔥';
      $('#authErr').textContent = '';
    })
  );
  $('#authForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const nick = $('#authNick').value.trim();
    const pw = $('#authPw').value;
    if (authMode === 'signup' && pw !== $('#authPw2').value) {
      $('#authErr').textContent = '비밀번호 확인이 달라요.';
      return;
    }
    $('#authErr').textContent = '';
    $('#authSubmit').disabled = true;
    send({ t: authMode, nick, pw });
  });

  // ───────── 메인 입장 ─────────
  function enterApp(m) {
    me = { id: m.me };
    myUser = m.user;
    $('#authScreen').hidden = true;
    $('#app').hidden = false;
    $('#authPw').value = ''; $('#authPw2').value = '';
    players.forEach((p) => p.el.remove());
    players.clear();
    buildSeats();
    m.players.forEach(addPlayer);
    $('#chatLog').innerHTML = '';
    m.history.forEach((h) => addLog(h));
    if (m.cake) onCake(m.cake);
    setInv(m.inv || []);
    onTree(m.tree || { items: [], top: 'star' });
    $('#kitchenCounter .art').innerHTML = Kitchen.counterArt();
    renderMe();
    updateCount();
    fitStage();
    if (window.innerWidth < 760 && !$('#chatPanel').classList.contains('collapsed')) $('#chatToggle').click();
    if (camMode && !justSignedUp) setTimeout(() => toast('👆 바닥을 톡 누르면 걸어가요 · 친구를 누르면 눈덩이!'), 600);
    if (justSignedUp) {
      justSignedUp = false;
      openModal(true);
    }
  }

  function renderMe() {
    $('#meNick').textContent = myUser.nick;
    $('#meAvatar').innerHTML = Avatar.svg(myUser.avatar);
  }
  function updateCount() {
    $('#onlineCount').textContent = `🔥 ${players.size}명`;
  }

  // ───────── 무대 크기 맞추기 (폰에서는 크게 보고, 화면보다 크면 내 캐릭터를 따라가요) ─────────
  let scale = 1, base = 1, camMode = false, camX = STAGE_W / 2, camY = STAGE_H / 2;
  let zoom = parseFloat(localStorage.getItem('xmas_zoom')) || 1;
  const ZMIN = 0.6, ZMAX = 2.2;
  const touch = window.matchMedia('(pointer: coarse)').matches;
  function fitStage() {
    const wrap = $('#stageWrap');
    const W = wrap.clientWidth, H = wrap.clientHeight;
    const fit = Math.min(W / STAGE_W, H / STAGE_H);
    camMode = W < 760 && H / STAGE_H > fit * 1.15;
    base = camMode ? Math.min(H / STAGE_H, 0.95) : fit;
    scale = base * zoom;
    document.body.classList.toggle('cam-mode', camMode);
    const mine = me && players.get(me.id);
    if (mine) { const c = curPos(mine); camX = c.x; camY = c.y - 50; }
    applyCam();
    $('#stageHint').textContent = touch
      ? '바닥을 톡 누르면 걸어가요 · 의자를 누르면 앉아요 · 친구를 누르면 눈덩이를 던져요'
      : '바닥을 누르면 걸어가요 · 의자를 누르면 앉아요 · 방향키/WASD로도 움직여요 · 스페이스바 점프 · 친구를 누르면 눈덩이를 던져요';
  }
  function axis(view, size, cam) {
    const full = size * scale;
    if (full <= view) return (view - full) / 2;
    return Math.min(0, Math.max(view - full, view / 2 - cam * scale));
  }
  function applyCam() {
    const wrap = $('#stageWrap');
    const tx = axis(wrap.clientWidth, STAGE_W, camX), ty = axis(wrap.clientHeight, STAGE_H, camY);
    $('#stage').style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  }
  (function camLoop() {
    const mine = me && players.get(me.id);
    if (mine) {
      const c = curPos(mine);
      const tx = c.x, ty = c.y - 50;
      if (Math.abs(tx - camX) > 0.5 || Math.abs(ty - camY) > 0.5) {
        camX += (tx - camX) * 0.12; camY += (ty - camY) * 0.12; applyCam();
      }
    }
    requestAnimationFrame(camLoop);
  })();
  function setZoom(z, announce) {
    zoom = Math.max(ZMIN, Math.min(ZMAX, z));
    localStorage.setItem('xmas_zoom', zoom.toFixed(2));
    scale = base * zoom;
    applyCam();
    if (announce) toast(`🔍 화면 크기 ${Math.round(zoom * 100)}%`);
  }
  $('#zoomIn').addEventListener('click', (e) => { e.stopPropagation(); setZoom(zoom * 1.2, true); });
  $('#zoomOut').addEventListener('click', (e) => { e.stopPropagation(); setZoom(zoom / 1.2, true); });
  // 두 손가락으로 벌리고 오므리기
  let pinch = null;
  $('#stageWrap').addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      const [a, b] = e.touches;
      pinch = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), z: zoom };
    }
  }, { passive: true });
  $('#stageWrap').addEventListener('touchmove', (e) => {
    if (pinch && e.touches.length === 2) {
      e.preventDefault();
      const [a, b] = e.touches;
      setZoom(pinch.z * Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) / pinch.d, false);
    }
  }, { passive: false });
  $('#stageWrap').addEventListener('touchend', (e) => {
    if (pinch && e.touches.length < 2) { pinch = null; toast(`🔍 화면 크기 ${Math.round(zoom * 100)}%`); }
  });
  window.addEventListener('resize', fitStage);

  // ───────── 좌석 ─────────
  const seatEls = {};
  function buildSeats() {
    const box = $('#entities');
    box.querySelectorAll('.seat').forEach((s) => s.remove());
    for (const [id, s] of Object.entries(SEATS)) {
      const el = document.createElement('div');
      el.className = `seat seat-${s.kind}`;
      el.dataset.seat = id;
      el.style.left = s.x + 'px';
      el.style.top = s.y + 'px';
      if (s.kind === 'arm') {
        el.innerHTML = `<div class="arm-back"></div><div class="arm-cushion"></div><div class="arm-side"></div>`;
        if (s.face === -1) el.classList.add('flip');
        el.style.zIndex = s.y - 2;
      } else if (s.kind === 'cush') {
        el.innerHTML = `<div class="cushion"></div>`;
        el.style.zIndex = 5;
      } else if (s.kind === 'pouf') {
        el.innerHTML = `<div class="pouf"></div>`;
        el.style.zIndex = s.y - 2;
      } else {
        el.innerHTML = `<div class="sofa-back"><span class="plate"></span></div>`;
        el.style.zIndex = s.y + 15;
      }
      el.title = '누르면 앉아요';
      seatEls[id] = el;
      box.appendChild(el);
    }
  }
  function refreshSeats() {
    const bySeat = {};
    players.forEach((p) => { if (p.data.seat) bySeat[p.data.seat] = p; });
    for (const [id, el] of Object.entries(seatEls)) {
      el.classList.toggle('taken', !!bySeat[id]);
      const plate = el.querySelector('.plate');
      if (plate) {
        // 소파에 앉은 사람 이름은 소파 등받이에 보여줘요
        const p = bySeat[id];
        plate.textContent = p ? p.data.nick : '';
        plate.classList.toggle('mine', !!(p && me && p.data.id === me.id));
      }
    }
  }

  // ───────── 캐릭터 ─────────
  function addPlayer(d) {
    if (players.has(d.id)) removePlayer(d.id);
    const el = document.createElement('div');
    el.className = 'player';
    el.dataset.id = d.id;
    if (d.id === me.id) el.classList.add('is-me');
    el.innerHTML = `<div class="bubble"></div><div class="emote"></div><div class="sprite"></div><div class="held"></div><div class="name"></div>`;
    const p = { data: d, el };
    players.set(d.id, p);
    renderPlayer(p);
    setHeld(p, d.held);
    el.style.left = d.x + 'px';
    el.style.top = d.y + 'px';
    el.style.zIndex = Math.round(d.y);
    if (d.seat) {
      el.classList.add('sitting');
      el.dataset.seat = SEATS[d.seat].kind;
      if (SEATS[d.seat].face) d.facing = SEATS[d.seat].face;
    }
    applyFacing(p);
    $('#entities').appendChild(el);
    refreshSeats();
  }
  function renderPlayer(p) {
    p.el.querySelector('.sprite').innerHTML = Avatar.svg(p.data.avatar);
    p.el.querySelector('.name').textContent = p.data.nick;
    applyFacing(p);
  }
  function applyFacing(p) {
    p.el.querySelector('.sprite').style.setProperty('--face', p.data.facing === -1 ? -1 : 1);
    const h = p.el.querySelector('.held');
    if (h) h.style.setProperty('--face', p.data.facing === -1 ? -1 : 1);
  }
  // 손에 든 음식 (모두에게 보여요)
  function setHeld(p, item) {
    p.data.held = item || null;
    const h = p.el.querySelector('.held');
    if (!h || h.classList.contains('eating')) return;
    h.innerHTML = item ? Kitchen.itemIcon(item) : '';
    h.classList.toggle('on', !!item);
    if (p.data.id === me.id) updateEatBtn();
  }
  function removePlayer(id) {
    const p = players.get(id);
    if (!p) return;
    p.el.remove();
    players.delete(id);
    refreshSeats();
  }
  function curPos(p) {
    const cs = getComputedStyle(p.el);
    return { x: parseFloat(cs.left), y: parseFloat(cs.top) };
  }
  // 위치를 바꾸고 걸리는 시간(초)을 돌려줘요
  function moveEl(p, x, y, mode) {
    const from = curPos(p);
    const dist = Math.hypot(x - from.x, y - from.y);
    const dur = mode === 'step' ? 0.1 : Math.max(0.15, dist / WALK_SPEED);
    if (Math.abs(x - from.x) > 1) p.data.facing = x < from.x ? -1 : 1;
    applyFacing(p);
    p.el.classList.remove('sitting');
    p.el.style.transition = `left ${dur}s linear, top ${dur}s linear`;
    p.el.style.left = x + 'px';
    p.el.style.top = y + 'px';
    p.el.style.zIndex = Math.round(Math.max(y, from.y));
    p.el.classList.add('walking');
    clearTimeout(p.walkTimer);
    p.walkTimer = setTimeout(() => {
      p.el.classList.remove('walking');
      p.el.style.zIndex = Math.round(y);
    }, dur * 1000);
    p.data.x = x; p.data.y = y;
    return dur;
  }

  // ───────── 클릭으로 이동 / 앉기 ─────────
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function stagePoint(e) {
    const r = $('#stage').getBoundingClientRect();
    return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale };
  }
  $('#stage').addEventListener('click', (e) => {
    if (!me) return;
    const mine = players.get(me.id);
    if (!mine) return;
    if (e.target.closest('.cake-table')) { openCake(); return; }
    if (e.target.closest('.kitchen')) { openKitchen(); return; }
    if (e.target.closest('.deco-tree')) { openTree(); return; }
    const seatEl = e.target.closest('.seat');
    if (seatEl) {
      const id = seatEl.dataset.seat;
      if (mine.data.seat === id) send({ t: 'stand' });
      else send({ t: 'sit', seat: id });
      return;
    }
    const other = e.target.closest('.player');
    if (other) {
      const id = Number(other.dataset.id);
      if (id && id !== me.id) send({ t: 'throw', to: id });
      return;
    }
    const pt = stagePoint(e);
    const x = clamp(pt.x, BOUNDS.minX, BOUNDS.maxX);
    const y = clamp(pt.y, BOUNDS.minY, BOUNDS.maxY);
    mine.data.seat = null;
    moveEl(mine, x, y, 'walk');
    refreshSeats();
    send({ t: 'move', x: Math.round(x), y: Math.round(y), mode: 'walk' });
    $('#stageHint').classList.add('hide');
  });

  // ───────── 방향키 / WASD ─────────
  const held = new Set();
  const KEYS = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0], W: [0, -1], S: [0, 1], A: [-1, 0], D: [1, 0] };
  let kbPos = null, lastSend = 0, lastFrame = 0;
  function typing() {
    const a = document.activeElement;
    return a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA');
  }
  window.addEventListener('keydown', (e) => {
    if (!me || typing() || !$('#profileModal').hidden || !$('#inviteModal').hidden) return;
    if (e.key === 'Enter') { $('#chatInput').focus(); e.preventDefault(); return; }
    if (!$('#cakeModal').hidden || !$('#kitchenModal').hidden || !$('#treeModal').hidden) return;
    if ((e.key === 'q' || e.key === 'Q' || e.key === 'ㅂ') && !e.repeat) { eatHeld(); return; }
    if (e.key === ' ' || e.code === 'Space') { e.preventDefault(); if (!e.repeat) send({ t: 'jump' }); return; }
    if ((e.key === 'e' || e.key === 'E' || e.key === 'ㄷ') && !e.repeat) { send({ t: 'snow' }); return; }
    if ((e.key === 'f' || e.key === 'F' || e.key === 'ㄹ') && !e.repeat) { send({ t: 'fw' }); return; }
    if (!KEYS[e.key]) return;
    e.preventDefault();
    if (held.size === 0) { lastFrame = performance.now(); requestAnimationFrame(kbLoop); }
    held.add(e.key);
  });
  window.addEventListener('keyup', (e) => held.delete(e.key));
  window.addEventListener('blur', () => held.clear());
  function kbLoop(now) {
    const mine = me && players.get(me.id);
    if (!mine || held.size === 0) { kbPos = null; if (mine) mine.el.classList.remove('walking'); return; }
    const dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    if (!kbPos) {
      kbPos = curPos(mine);
      if (mine.data.seat) { mine.data.seat = null; refreshSeats(); }
      mine.el.classList.remove('sitting');
    }
    let dx = 0, dy = 0;
    held.forEach((k) => { dx += KEYS[k][0]; dy += KEYS[k][1]; });
    const len = Math.hypot(dx, dy) || 1;
    kbPos.x = clamp(kbPos.x + (dx / len) * WALK_SPEED * 1.15 * dt, BOUNDS.minX, BOUNDS.maxX);
    kbPos.y = clamp(kbPos.y + (dy / len) * WALK_SPEED * 1.15 * dt, BOUNDS.minY, BOUNDS.maxY);
    if (dx) mine.data.facing = dx < 0 ? -1 : 1;
    applyFacing(mine);
    mine.el.style.transition = 'none';
    mine.el.style.left = kbPos.x + 'px';
    mine.el.style.top = kbPos.y + 'px';
    mine.el.style.zIndex = Math.round(kbPos.y);
    mine.el.classList.add('walking');
    mine.data.x = kbPos.x; mine.data.y = kbPos.y;
    if (now - lastSend > 90) {
      lastSend = now;
      send({ t: 'move', x: Math.round(kbPos.x), y: Math.round(kbPos.y), mode: 'step' });
    }
    $('#stageHint').classList.add('hide');
    requestAnimationFrame(kbLoop);
  }

  // ───────── 채팅 ─────────
  function showChat(m) {
    addLog(m);
    const p = players.get(m.id);
    if (!p) return;
    Sound.Sfx.chirp(p.data.avatar && p.data.avatar.type, m.text);
    const b = p.el.querySelector('.bubble');
    b.textContent = m.text;
    b.classList.remove('show');
    void b.offsetWidth;
    b.classList.add('show');
    clearTimeout(p.bubbleTimer);
    p.bubbleTimer = setTimeout(() => b.classList.remove('show'), 5000 + Math.min(m.text.length * 60, 4000));
  }
  function addLog(m) {
    const li = document.createElement('li');
    if (m.kind === 'sys') {
      li.className = 'sys';
      li.textContent = m.text;
    } else {
      li.innerHTML = `<span class="log-av"></span><div><b></b><p></p></div>`;
      li.querySelector('.log-av').innerHTML = Avatar.svg(m.avatar);
      li.querySelector('b').textContent = m.nick;
      li.querySelector('p').textContent = m.text;
      if (me && m.id === me.id) li.classList.add('mine');
    }
    document.querySelectorAll('.mini-chat').forEach((ul) => {
      const mini = document.createElement('li');
      if (m.kind === 'sys') { mini.className = 'sys'; mini.textContent = m.text; }
      else { mini.innerHTML = '<b></b> <span></span>'; mini.querySelector('b').textContent = m.nick; mini.querySelector('span').textContent = m.text; }
      ul.appendChild(mini);
      while (ul.children.length > 4) ul.firstChild.remove();
    });
    const log = $('#chatLog');
    const atBottom = log.scrollHeight - log.scrollTop - log.clientHeight < 40;
    log.appendChild(li);
    while (log.children.length > 120) log.firstChild.remove();
    if (atBottom || li.classList.contains('mine')) log.scrollTop = log.scrollHeight;
  }
  $('#chatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const inp = $('#chatInput');
    const text = inp.value.trim();
    if (!text) { inp.blur(); return; }
    send({ t: 'chat', text });
    inp.value = '';
  });
  $('#chatInput').addEventListener('keydown', (e) => {
    if (e.key === 'Escape') e.target.blur();
  });
  $('#chatToggle').addEventListener('click', () => {
    const c = $('#chatPanel').classList.toggle('collapsed');
    $('#chatToggle').textContent = c ? '+' : '–';
  });

  // ───────── 점프 · 눈 뿌리기 · 눈덩이 ─────────
  function doJump(id) {
    const p = players.get(id);
    if (!p) return;
    const sp = p.el.querySelector('.sprite');
    sp.classList.remove('jump');
    void sp.offsetWidth;
    sp.classList.add('jump');
    clearTimeout(p.jumpTimer);
    p.jumpTimer = setTimeout(() => { sp.classList.remove('jump'); Sound.Sfx.land(); }, 560);
    Sound.Sfx.jump();
  }
  function fxLayer() { return $('#fx'); }
  function posOf(p) { const c = curPos(p); return { x: c.x, y: c.y }; }
  function doSnow(id) {
    const p = players.get(id);
    if (!p) return;
    const { x, y } = posOf(p);
    const flakes = ['❄', '❅', '❆', '•', '✦'];
    for (let i = 0; i < 22; i++) {
      const f = document.createElement('span');
      f.className = 'flake';
      f.textContent = flakes[i % flakes.length];
      f.style.left = x + 'px';
      f.style.top = (y - 70) + 'px';
      f.style.fontSize = 10 + Math.random() * 14 + 'px';
      fxLayer().appendChild(f);
      const ang = Math.random() * Math.PI * 2, dist = 40 + Math.random() * 70;
      const dx = Math.cos(ang) * dist, up = -30 - Math.random() * 50, fall = 40 + Math.random() * 60;
      f.animate([
        { transform: 'translate(-50%,-50%) scale(.3)', opacity: 0 },
        { transform: `translate(calc(-50% + ${dx * 0.6}px), calc(-50% + ${up}px)) scale(1)`, opacity: 1, offset: 0.3 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${fall}px)) rotate(${Math.random() * 360}deg) scale(.8)`, opacity: 0 },
      ], { duration: 1300 + Math.random() * 600, easing: 'ease-out' }).onfinish = () => f.remove();
    }
    Sound.Sfx.sparkle();
  }
  function doThrow(fromId, toId) {
    const a = players.get(fromId), b = players.get(toId);
    if (!a || !b) return;
    a.data.facing = curPos(b).x < curPos(a).x ? -1 : 1;
    applyFacing(a);
    const s0 = posOf(a), s1 = posOf(b);
    const from = { x: s0.x + a.data.facing * 18, y: s0.y - 50 }, to = { x: s1.x, y: s1.y - 45 };
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const peak = Math.min(160, 40 + dist * 0.35);
    const ball = document.createElement('div');
    ball.className = 'snowball';
    fxLayer().appendChild(ball);
    const frames = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      const x = from.x + (to.x - from.x) * t;
      const y = from.y + (to.y - from.y) * t - peak * 4 * t * (1 - t);
      frames.push({ transform: `translate(${x}px, ${y}px) rotate(${t * 540}deg)` });
    }
    Sound.Sfx.whoosh();
    ball.animate(frames, { duration: 380 + dist * 0.6, easing: 'linear' }).onfinish = () => {
      ball.remove();
      const hit = curPos(b);
      splat(hit.x, hit.y - 45);
      b.el.classList.remove('hit');
      void b.el.offsetWidth;
      b.el.classList.add('hit');
      setTimeout(() => b.el.classList.remove('hit'), 600);
      Sound.Sfx.splat();
    };
  }
  function splat(x, y) {
    for (let i = 0; i < 10; i++) {
      const d = document.createElement('span');
      d.className = 'splat';
      d.style.left = x + 'px'; d.style.top = y + 'px';
      const s = 5 + Math.random() * 8;
      d.style.width = d.style.height = s + 'px';
      fxLayer().appendChild(d);
      const ang = Math.random() * Math.PI * 2, r = 18 + Math.random() * 26;
      d.animate([
        { transform: 'translate(-50%,-50%)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(ang) * r}px), calc(-50% + ${Math.sin(ang) * r + 16}px))`, opacity: 0 },
      ], { duration: 500 + Math.random() * 200, easing: 'ease-out' }).onfinish = () => d.remove();
    }
  }
  $('#jumpBtn').addEventListener('click', () => send({ t: 'jump' }));
  $('#snowBtn').addEventListener('click', () => send({ t: 'snow' }));

  // ───────── 소리 설정 창 ─────────
  function renderSoundUI() {
    $('#bgmBtn').classList.toggle('off', !Sound.bgmOn && !Sound.sfxOn);
    $('#bgmBtn').classList.toggle('playing', Sound.bgmOn);
    $('#bgmToggle').checked = Sound.bgmOn;
    $('#sfxToggle').checked = Sound.sfxOn;
    $('#bgmVol').value = Math.round(Sound.bgmVolume * 100);
    $('#sfxVol').value = Math.round(Sound.sfxVolume * 100);
    const t = Sound.track;
    $('#nowPlaying').textContent = Sound.bgmOn ? (t ? `♪ ${t.title} · ${t.artist} (${t.license})` : '♪ 불러오는 중…') : '꺼져 있어요';
  }
  Sound.onTrack = (t) => {
    if (!t) { toast('🎵 캐롤 음원을 아직 준비하는 중이에요. 잠시 뒤 다시 켜 주세요'); Sound.setBgm(false); renderSoundUI(); return; }
    renderSoundUI();
    if ($('#soundPanel').hidden) toast(`🎵 ${t.title} · ${t.artist} (${t.license})`);
  };
  $('#bgmBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    $('#soundPanel').hidden = !$('#soundPanel').hidden;
    renderSoundUI();
  });
  $('#soundPanel').addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', () => { $('#soundPanel').hidden = true; });
  $('#bgmToggle').addEventListener('change', (e) => { Sound.setBgm(e.target.checked); renderSoundUI(); });
  $('#sfxToggle').addEventListener('change', (e) => { Sound.setSfx(e.target.checked); renderSoundUI(); });
  $('#bgmVol').addEventListener('input', (e) => Sound.setBgmVolume(e.target.value / 100));
  $('#sfxVol').addEventListener('input', (e) => Sound.setSfxVolume(e.target.value / 100));
  $('#sfxVol').addEventListener('change', () => myUser && Sound.preview(myUser.avatar.type));
  $('#nextTrack').addEventListener('click', () => { if (Sound.bgmOn) Sound.nextTrack(); });
  renderSoundUI();

  // ───────── 🎆 폭죽 ─────────
  function doFirework(id) {
    const p = players.get(id);
    if (!p) return;
    doJump(id);
    const { x, y } = posOf(p);
    const top = y - 190 - Math.random() * 40;
    const rocket = document.createElement('div');
    rocket.className = 'rocket';
    fxLayer().appendChild(rocket);
    const colors = [['#ff5470', '#ffd34d'], ['#6fb6ff', '#ffffff'], ['#7dd6a2', '#ffc94a'], ['#c59bff', '#ff9db5']][Math.floor(Math.random() * 4)];
    rocket.animate([{ transform: `translate(${x}px, ${y - 60}px)`, opacity: 1 }, { transform: `translate(${x + (Math.random() - 0.5) * 30}px, ${top}px)`, opacity: 1 }],
      { duration: 520, easing: 'cubic-bezier(.2,.7,.4,1)' }).onfinish = () => {
      rocket.remove();
      Sound.Sfx.boom();
      for (let i = 0; i < 26; i++) {
        const s = document.createElement('span');
        s.className = 'spark';
        s.style.background = colors[i % 2];
        s.style.left = x + 'px'; s.style.top = top + 'px';
        fxLayer().appendChild(s);
        const a = (i / 26) * Math.PI * 2, r = 50 + Math.random() * 30;
        s.animate([
          { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
          { transform: `translate(calc(-50% + ${Math.cos(a) * r}px), calc(-50% + ${Math.sin(a) * r}px)) scale(.9)`, opacity: 1, offset: 0.55 },
          { transform: `translate(calc(-50% + ${Math.cos(a) * r * 1.15}px), calc(-50% + ${Math.sin(a) * r * 1.15 + 30}px)) scale(.3)`, opacity: 0 },
        ], { duration: 1100 + Math.random() * 300, easing: 'ease-out' }).onfinish = () => s.remove();
      }
    };
    Sound.Sfx.whoosh();
  }
  $('#fwBtn').addEventListener('click', () => send({ t: 'fw' }));

  // ───────── 📢 방 공지 ─────────
  let noticeTimer = null, noticeKind = null;
  function showNotice(m) {
    noticeKind = m.kind;
    $('#noticeText').textContent = m.text;
    $('#noticeGo').hidden = !['cake'].includes(m.kind);
    const n = $('#notice');
    n.hidden = false;
    n.classList.remove('show'); void n.offsetWidth; n.classList.add('show');
    Sound.Sfx.ding();
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => { n.hidden = true; }, 10000);
  }
  $('#noticeGo').addEventListener('click', () => { $('#notice').hidden = true; if (noticeKind === 'cake') openCake(); });
  $('#noticeX').addEventListener('click', () => { $('#notice').hidden = true; });

  // ───────── 🎒 인벤토리 ─────────
  let inv = [], pendingCraft = null, heldSlot = -1, eating = false;
  const INV_SIZE = 4;
  function setInv(list) {
    inv = list || [];
    if (heldSlot >= inv.length) heldSlot = -1;
    const box = $('#inv');
    box.innerHTML = '';
    for (let i = 0; i < INV_SIZE; i++) {
      const it = inv[i];
      const b = document.createElement('button');
      b.className = 'slot' + (it ? ' full' : '') + (i === heldSlot ? ' held' : '');
      b.dataset.i = i;
      b.innerHTML = it ? Kitchen.itemIcon(it) : '';
      b.title = it ? Kitchen.itemName(it) : '빈 칸';
      box.appendChild(b);
    }
    $('#invMenu').hidden = true;
    updateEatBtn();
  }
  function updateEatBtn() {
    const myP = players.get(me && me.id);
    const it = myP && myP.data.held;
    const b = $('#eatBtn');
    b.hidden = !it || eating;
    if (it) { b.querySelector('.ic').innerHTML = Kitchen.itemIcon(it); b.querySelector('span').textContent = it.k === 'cocoa' ? '마시기' : '먹기'; }
    document.querySelectorAll('#inv .slot').forEach((s) => s.classList.toggle('held', Number(s.dataset.i) === heldSlot && !!it));
  }
  function eatHeld() {
    const myP = players.get(me && me.id);
    if (!myP || !myP.data.held || heldSlot < 0 || eating) return;
    send({ t: 'useItem', slot: heldSlot, how: 'eat' });
    heldSlot = -1;
  }
  $('#eatBtn').addEventListener('click', eatHeld);
  $('#inv').addEventListener('click', (e) => {
    const b = e.target.closest('.slot');
    if (!b) return;
    const i = Number(b.dataset.i), it = inv[i], menu = $('#invMenu');
    if (!it) { toast('🎒 비어 있어요. 주방에서 핫초코나 마시멜로를 만들어 봐요!'); return; }
    const isHeld = i === heldSlot;
    menu.innerHTML = `<b>${esc(Kitchen.itemName(it))}</b>
      ${isHeld ? `<button class="btn primary small" data-how="eat">${it.k === 'cocoa' ? '☕ 마시기' : '😋 먹기'}</button>
        <button class="btn ghost small" data-how="down">내려놓기</button>`
        : `<button class="btn primary small" data-how="hold">✋ 손에 들기</button>`}
      <button class="btn ghost small" data-how="drop">버리기</button>`;
    menu.dataset.i = i;
    menu.hidden = false;
  });
  $('#invMenu').addEventListener('click', (e) => {
    const b = e.target.closest('[data-how]');
    if (!b) return;
    const i = Number($('#invMenu').dataset.i), how = b.dataset.how;
    if (how === 'hold') { send({ t: 'hold', slot: i }); Sound.Sfx.pop(); }
    else if (how === 'down') send({ t: 'hold', slot: -1 });
    else if (how === 'eat') eatHeld();
    else { send({ t: 'useItem', slot: i, how }); if (i === heldSlot) heldSlot = -1; }
    $('#invMenu').hidden = true;
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('#inv') && !e.target.closest('#invMenu')) $('#invMenu').hidden = true; });
  // 먹기 모션: 입으로 가져가서 세 입 → 냠냠 / 호로록 소리
  function onEatItem(m) {
    const p = players.get(m.id);
    if (!p) return;
    const it = m.item, drink = it.k === 'cocoa', mine = m.id === me.id;
    const h = p.el.querySelector('.held');
    p.data.held = null;
    if (mine) { eating = true; updateEatBtn(); }
    h.classList.add('on', 'eating', drink ? 'drink' : 'bite');
    h.innerHTML = Kitchen.itemIcon(it, 0);
    const near = mine || Math.hypot(p.data.x - (players.get(me.id)?.data.x || 0), p.data.y - (players.get(me.id)?.data.y || 0)) < 600;
    [0, 1, 2].forEach((k) => setTimeout(() => {
      h.innerHTML = Kitchen.itemIcon(it, k + 1);
      h.classList.remove('chomp'); void h.offsetWidth; h.classList.add('chomp');
      if (near) drink ? Sound.Sfx.slurp(k) : Sound.Sfx.munch(k);
    }, 450 + k * 520));
    setTimeout(() => {
      h.classList.remove('eating', 'drink', 'bite', 'chomp', 'on');
      h.innerHTML = '';
      const face = it.k === 'mallow' && it.q === 'burnt' ? '😖' : it.k === 'mallow' && it.q === 'perfect' ? '🤩' : drink ? '☺️' : '😋';
      showEmote(m.id, face);
      if (near && face !== '😖') Sound.Sfx.yum();
      if (mine) { eating = false; updateEatBtn(); }
      if (p.data.held) setHeld(p, p.data.held);
    }, 450 + 3 * 520 + 250);
  }

  // ───────── ☕ 주방 ─────────
  const kitchenUI = KitchenUI({
    Sound,
    craft: (item, cb) => { pendingCraft = cb; send({ t: 'craft', item }); setTimeout(() => { if (pendingCraft === cb) { pendingCraft = null; } }, 4000); },
    close: () => closeKitchen(),
  });
  function openKitchen(which) { closeCake(); closeTree(); $('#kitchenModal').hidden = false; kitchenUI.setOpen(true, which); }
  function closeKitchen() { $('#kitchenModal').hidden = true; kitchenUI.setOpen(false); }

  // ───────── 🎄 트리 꾸미기 ─────────
  let treeData = null;
  const treeUI = TreeUI({ send, toast, Sound, myUid: () => myUser && myUser.id, close: () => closeTree() });
  function openTree() { closeCake(); closeKitchen(); $('#treeModal').hidden = false; treeUI.setOpen(true); }
  function closeTree() { if (!$('#treeModal').hidden) { $('#treeModal').hidden = true; treeUI.setOpen(false); } }
  function onTree(t) {
    treeData = t;
    $('#roomTree').innerHTML = Tree.svg(t, { lights: true });
    treeUI.setTree(t);
  }

  function showEmote(id, e) {
    const p = players.get(id);
    if (!p) return;
    const el = p.el.querySelector('.emote');
    el.textContent = e;
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
  }

  // ───────── 아래 메뉴 ─────────
  const COMING = {
    gift: '🎁 그림 선물·쪽지 나눔은 곧 열려요!',
    mafia: '🎅 산타 마피아는 곧 열려요!',
  };
  document.querySelectorAll('.dock-item').forEach((b) =>
    b.addEventListener('click', () => {
      if (b.dataset.feature === 'cake') openCake();
      else if (b.dataset.feature === 'tree') openTree();
      else if (b.dataset.feature !== 'room') toast(COMING[b.dataset.feature]);
    })
  );

  // ───────── 캐릭터 꾸미기 / 계정 ─────────
  let draft = null;
  function openModal(first) {
    draft = { type: myUser.avatar.type, color: myUser.avatar.color, accs: [...Avatar.accList(myUser.avatar)] };
    $('#profileTitle').textContent = first ? '반가워요! 내 캐릭터를 골라봐요 🎁' : '내 캐릭터 꾸미기';
    $('#skipBtn').textContent = first ? '나중에 할래요' : '닫기';
    $('#logoutBtn').hidden = !!first;
    $('#editNick').value = myUser.nick;
    $('#oldPw').value = ''; $('#newPw').value = '';
    $('#accountBox').open = false;
    $('#profileErr').textContent = '';
    renderEditor();
    $('#profileModal').hidden = false;
  }
  function closeModal() { $('#profileModal').hidden = true; }
  function renderEditor() {
    $('#previewAvatar').innerHTML = Avatar.svg(draft);
    const typeRow = $('#typeRow');
    typeRow.innerHTML = '';
    Avatar.TYPES.forEach((t) => {
      const b = document.createElement('button');
      b.className = 'choice' + (draft.type === t.id ? ' on' : '');
      b.innerHTML = `<span class="ch-av">${Avatar.svg({ ...draft, type: t.id, accs: [] })}</span><small>${t.name}</small>`;
      b.onclick = () => { draft.type = t.id; renderEditor(); Sound.preview(t.id); };
      typeRow.appendChild(b);
    });
    const colorRow = $('#colorRow');
    colorRow.innerHTML = '';
    Avatar.COLORS.forEach((c) => {
      const b = document.createElement('button');
      b.className = 'swatch' + (draft.color === c ? ' on' : '');
      b.style.background = c;
      b.title = c;
      b.onclick = () => { draft.color = c; renderEditor(); };
      colorRow.appendChild(b);
    });
    const accRow = $('#accRow');
    accRow.innerHTML = '';
    $('#accCount').textContent = `${draft.accs.length} / ${Avatar.MAX_ACCS}`;
    const none = document.createElement('button');
    none.className = 'choice' + (draft.accs.length === 0 ? ' on' : '');
    none.innerHTML = `<span class="ch-av">${Avatar.svg({ ...draft, accs: [] })}</span><small>없음</small>`;
    none.onclick = () => { draft.accs = []; renderEditor(); };
    accRow.appendChild(none);
    Avatar.ACCS.forEach((a) => {
      const on = draft.accs.includes(a.id);
      const b = document.createElement('button');
      b.className = 'choice' + (on ? ' on' : '') + (!on && draft.accs.length >= Avatar.MAX_ACCS ? ' full' : '');
      b.innerHTML = `<span class="ch-av">${Avatar.svg({ ...draft, accs: [a.id] })}</span><small>${a.name}</small>${on ? '<i class="check">✓</i>' : ''}`;
      b.onclick = () => {
        if (on) draft.accs = draft.accs.filter((x) => x !== a.id);
        else if (draft.accs.length >= Avatar.MAX_ACCS) return toast(`장식은 ${Avatar.MAX_ACCS}개까지 할 수 있어요 🎀`);
        else draft.accs = [...draft.accs, a.id];
        renderEditor();
      };
      accRow.appendChild(b);
    });
  }
  $('#meChip').addEventListener('click', () => openModal(false));
  document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeModal));
  $('#profileModal').addEventListener('click', (e) => { if (e.target.id === 'profileModal') closeModal(); });
  $('#randomBtn').addEventListener('click', () => {
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    const accs = Avatar.ACCS.map((a) => a.id).sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * (Avatar.MAX_ACCS + 1)));
    draft = { type: pick(Avatar.TYPES).id, color: pick(Avatar.COLORS), accs };
    renderEditor();
  });
  $('#saveProfile').addEventListener('click', () => {
    $('#profileErr').textContent = '';
    const msg = { t: 'profile', avatar: draft };
    const nick = $('#editNick').value.trim();
    if (nick && nick !== myUser.nick) msg.nick = nick;
    const newPw = $('#newPw').value;
    if (newPw) { msg.newPw = newPw; msg.oldPw = $('#oldPw').value; }
    send(msg);
  });
  $('#logoutBtn').addEventListener('click', () => {
    send({ t: 'logout' });
    localStorage.removeItem('xmas_token');
    token = null;
    closeModal();
    players.forEach((p) => p.el.remove());
    players.clear();
    showAuth();
  });

  // ───────── 친구 초대 (링크 + QR) ─────────
  let invitePoll = null;
  function isLocalHost() {
    return ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  }
  async function refreshInvite() {
    let info = { publicUrl: null, tunnel: 'off', lan: [] };
    try { info = await (await fetch('/api/share', { cache: 'no-store' })).json(); } catch (_) {}
    let url, note, sub = 'QR을 찍거나 링크를 보내면 바로 들어올 수 있어요';
    if (info.publicUrl) {
      url = info.publicUrl;
      note = '🌍 다른 와이파이, LTE에서도 들어올 수 있는 주소예요. 이 컴퓨터에서 서버가 켜져 있는 동안만 열려 있고, 서버를 다시 켜면 주소가 바뀌어요.';
    } else if (!isLocalHost()) {
      url = location.origin; // 이미 외부/공유 주소로 들어와 있으면 그 주소를 그대로 공유
      note = '지금 들어와 있는 주소를 그대로 공유해요.';
    } else if (info.tunnel === 'starting') {
      url = null;
      sub = '어디서든 들어올 수 있는 주소를 만드는 중이에요… ⏳';
      note = '10초쯤 걸려요. 잠깐만 기다려 주세요.';
    } else {
      url = info.lan[0] || null;
      note = url
        ? '📶 외부 주소가 꺼져 있어서 같은 와이파이에서만 들어올 수 있는 주소예요. 다른 곳에서도 들어오게 하려면 "실행하기.bat"으로 서버를 켜 주세요.'
        : '공유할 주소를 찾지 못했어요.';
    }
    $('#inviteSub').textContent = sub;
    $('#inviteNote').textContent = note;
    $('#inviteLink').value = url || '';
    $('#copyLink').disabled = !url;
    const box = $('#qrBox');
    if (url) {
      if (box.dataset.url !== url) {
        const qr = qrcode(0, 'M');
        qr.addData(url);
        qr.make();
        box.innerHTML = qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
        box.dataset.url = url;
      }
    } else {
      box.innerHTML = '<div class="qr-loading">❄️</div>';
      box.dataset.url = '';
    }
    clearTimeout(invitePoll);
    if (!$('#inviteModal').hidden && !info.publicUrl && info.tunnel === 'starting') invitePoll = setTimeout(refreshInvite, 2000);
  }
  $('#inviteBtn').addEventListener('click', () => {
    $('#inviteModal').hidden = false;
    refreshInvite();
  });
  const closeInvite = () => { $('#inviteModal').hidden = true; clearTimeout(invitePoll); };
  document.querySelectorAll('[data-close-invite]').forEach((b) => b.addEventListener('click', closeInvite));
  $('#inviteModal').addEventListener('click', (e) => { if (e.target.id === 'inviteModal') closeInvite(); });
  $('#copyLink').addEventListener('click', async () => {
    const v = $('#inviteLink').value;
    if (!v) return;
    try { await navigator.clipboard.writeText(v); }
    catch (_) { $('#inviteLink').select(); document.execCommand('copy'); }
    toast('링크를 복사했어요! 친구한테 보내 주세요 💌');
  });

  // 연결 유지용 신호 (호스팅 서버가 잠들지 않게)
  setInterval(() => { if (me) send({ t: 'hb' }); }, 60000);

  connect();
})();
