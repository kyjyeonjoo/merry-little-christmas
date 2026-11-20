// 🎄 크리스마스 놀이방 — 클라이언트
(() => {
  const $ = (s) => document.querySelector(s);
  const STAGE_W = 1000, STAGE_H = 620;
  const BOUNDS = { minX: 40, maxX: 960, minY: 340, maxY: 600 };
  const WALK_SPEED = 170; // px/s
  // 서버(server.js)의 SEATS와 같은 id/좌표
  const SEATS = {
    armL: { x: 200, y: 395, kind: 'arm', face: 1 },
    armR: { x: 800, y: 395, kind: 'arm', face: -1 },
    sofa1: { x: 430, y: 575, kind: 'sofa' },
    sofa2: { x: 570, y: 575, kind: 'sofa' },
    cush1: { x: 400, y: 470, kind: 'cush', face: 1 },
    cush2: { x: 600, y: 470, kind: 'cush', face: -1 },
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
      case 'emote': showEmote(m.id, m.e); break;
      case 'pupdate': {
        const p = players.get(m.id);
        if (p) { p.data.nick = m.nick; p.data.avatar = m.avatar; renderPlayer(p); }
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
      case 'toast': toast(m.msg); break;
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
      d.innerHTML = Avatar.svg({ type: types[i], color: pick(Avatar.COLORS), acc: pick(['santa', 'scarf', 'antlers', 'ribbon']) });
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
    renderMe();
    updateCount();
    fitStage();
    if (window.innerWidth < 760 && !$('#chatPanel').classList.contains('collapsed')) $('#chatToggle').click();
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

  // ───────── 무대 크기 맞추기 ─────────
  let scale = 1;
  function fitStage() {
    const wrap = $('#stageWrap');
    const w = wrap.clientWidth, h = wrap.clientHeight;
    scale = Math.min(w / STAGE_W, h / STAGE_H);
    $('#stage').style.transform = `translate(-50%, -50%) scale(${scale})`;
  }
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
      } else {
        el.innerHTML = `<div class="sofa-back"></div>`;
        el.style.zIndex = s.y + 15;
      }
      el.title = '누르면 앉아요';
      seatEls[id] = el;
      box.appendChild(el);
    }
  }
  function refreshSeats() {
    const taken = new Set([...players.values()].map((p) => p.data.seat).filter(Boolean));
    for (const [id, el] of Object.entries(seatEls)) el.classList.toggle('taken', taken.has(id));
  }

  // ───────── 캐릭터 ─────────
  function addPlayer(d) {
    if (players.has(d.id)) removePlayer(d.id);
    const el = document.createElement('div');
    el.className = 'player';
    if (d.id === me.id) el.classList.add('is-me');
    el.innerHTML = `<div class="bubble"></div><div class="emote"></div><div class="sprite"></div><div class="name"></div>`;
    const p = { data: d, el };
    players.set(d.id, p);
    renderPlayer(p);
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
    const seatEl = e.target.closest('.seat');
    if (seatEl) {
      const id = seatEl.dataset.seat;
      if (mine.data.seat === id) send({ t: 'stand' });
      else send({ t: 'sit', seat: id });
      return;
    }
    if (e.target.closest('.player')) return;
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

  function showEmote(id, e) {
    const p = players.get(id);
    if (!p) return;
    const el = p.el.querySelector('.emote');
    el.textContent = e;
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
  }
  $('#emotes').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) send({ t: 'emote', e: b.dataset.e });
  });

  // ───────── 아래 메뉴 ─────────
  const COMING = {
    cake: '🎂 케이크 투표·만들기·같이 먹기는 곧 열려요!',
    gift: '🎁 그림 선물·쪽지 나눔은 곧 열려요!',
    tree: '🎄 다 같이 트리 꾸미기는 곧 열려요!',
    mafia: '🎅 산타 마피아는 곧 열려요!',
  };
  document.querySelectorAll('.dock-item').forEach((b) =>
    b.addEventListener('click', () => {
      if (b.dataset.feature !== 'room') toast(COMING[b.dataset.feature]);
    })
  );

  // ───────── 캐릭터 꾸미기 / 계정 ─────────
  let draft = null;
  function openModal(first) {
    draft = { ...myUser.avatar };
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
      b.innerHTML = `<span class="ch-av">${Avatar.svg({ ...draft, type: t.id, acc: 'none' })}</span><small>${t.name}</small>`;
      b.onclick = () => { draft.type = t.id; renderEditor(); };
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
    Avatar.ACCS.forEach((a) => {
      const b = document.createElement('button');
      b.className = 'choice' + (draft.acc === a.id ? ' on' : '');
      b.innerHTML = `<span class="ch-av">${Avatar.svg({ ...draft, acc: a.id })}</span><small>${a.name}</small>`;
      b.onclick = () => { draft.acc = a.id; renderEditor(); };
      accRow.appendChild(b);
    });
  }
  $('#meChip').addEventListener('click', () => openModal(false));
  document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeModal));
  $('#profileModal').addEventListener('click', (e) => { if (e.target.id === 'profileModal') closeModal(); });
  $('#randomBtn').addEventListener('click', () => {
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    draft = { type: pick(Avatar.TYPES).id, color: pick(Avatar.COLORS), acc: pick(Avatar.ACCS).id };
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
