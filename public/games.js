// 🙈 숨바꼭질 · 🎅 산타 술래잡기
(function () {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // 숨을 곳 (무대 좌표 x, y, 너비, 높이, 이름)
  const SPOTS = {
    in: { tree: [846, 190, 150, 190, '트리 뒤'], sofa: [300, 526, 400, 70, '소파 뒤'], armL: [194, 336, 86, 76, '왼쪽 안락의자'], armR: [758, 330, 86, 76, '오른쪽 안락의자'],
      gift: [652, 294, 88, 88, '선물 상자 속'], cake: [400, 410, 200, 110, '케이크 테이블 밑'], curtain: [0, 150, 66, 200, '주방 통로 커튼 뒤'], rock: [52, 440, 110, 96, '흔들의자 뒤'] },
    out: { igloo: [786, 362, 204, 118, '이글루 안'], workshop: [112, 424, 156, 124, '눈더미 뒤'], castle: [366, 302, 268, 140, '눈성 뒤'], bench: [312, 528, 146, 70, '벤치 밑'],
      pineL: [0, 498, 62, 118, '왼쪽 나무 뒤'], pineR: [938, 496, 62, 118, '오른쪽 나무 뒤'], race: [646, 284, 158, 106, '썰매 뒤'], house: [6, 150, 230, 190, '집 모퉁이'] },
    kit: { fridge: [50, 150, 136, 260, '냉장고 옆'], pantry: [212, 176, 156, 190, '찬장 속'], oven: [412, 202, 176, 168, '오븐 뒤'], table: [392, 462, 216, 78, '식탁 밑'], counter: [642, 220, 156, 150, '카운터 뒤'] },
  };
  const ROOM_KO = { in: '거실', out: '눈마당', kit: '주방' };
  window.GameSpots = SPOTS;

  window.HideUI = function (api) {
    const $ = (s) => document.querySelector(s);
    let h = { stage: 'idle', players: [], found: [], hiddenUids: [] }, end = 0, tick = null, open = false;
    const me = () => api.myUid();
    const inGame = () => h.players.some((m) => m.uid === me());
    const nick = (u) => (h.players.find((m) => m.uid === u) || {}).nick || '';
    function overlay() {
      const ov = $('#hideSpots');
      const room = api.myRoom();
      const isSeeker = h.seeker === me();
      const show = room === h.room && inGame() && ((h.stage === 'hide' && !isSeeker) || (h.stage === 'seek' && isSeeker));
      if (!show) { ov.innerHTML = ''; ov.hidden = true; }
      else {
        ov.hidden = false;
        ov.innerHTML = Object.entries(SPOTS[h.room]).map(([id, [x, y, w, hh, n]]) =>
          `<button class="hspot ${h.stage} ${h.mySpot === id ? 'mine' : ''}" data-spot="${id}" style="left:${x}px;top:${y}px;width:${w}px;height:${hh}px"><span>${h.stage === 'seek' ? '🔍 ' : h.mySpot === id ? '🙈 ' : ''}${n}</span></button>`).join('');
      }
      // 눈 가리기 (술래가 숫자 세는 동안)
      $('#hideBlind').hidden = !(h.stage === 'hide' && isSeeker && room === h.room);
    }
    function board() {
      const b = $('#hideBoard');
      clearInterval(tick);
      if (h.stage !== 'hide' && h.stage !== 'seek') { b.hidden = true; return; }
      b.hidden = false;
      const draw = () => {
        const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
        const hiders = h.players.filter((m) => m.uid !== h.seeker);
        const remain = hiders.filter((m) => !h.found.includes(m.uid)).length;
        b.innerHTML = `<span>🙈 ${h.stage === 'hide' ? '숨는 시간' : '찾는 시간'}</span><b>${left}초</b><span>술래 ${esc(nick(h.seeker))} · 남은 사람 ${remain}/${hiders.length}</span>`;
        const bl = $('#hideBlind b'); if (bl) bl.textContent = left;
      };
      draw(); tick = setInterval(draw, 250);
    }
    function panel() {
      if (!open) return;
      const host = h.host === me(), mine = inGame();
      let body = '';
      if (h.stage === 'idle') body = `<p class="chint big">🙈 숨바꼭질 할까요?</p><p class="chint">지금 있는 곳(${ROOM_KO[api.myRoom()]})에서 해요. 술래는 랜덤! 숨는 사람은 20초 안에 숨을 곳을 고르고, 술래는 60초 동안 찾아요.</p>
        <button class="btn primary cnext" data-hact="open">🙈 숨바꼭질 열기</button>`;
      else if (h.stage === 'lobby') body = `<p class="chint">장소: <b>${ROOM_KO[h.room]}</b> · 모두 ${ROOM_KO[h.room]}에 모여요</p>
        <div class="hplayers">${h.players.map((m) => `<span>${esc(m.nick)}${m.uid === h.host ? ' 👑' : ''}</span>`).join('')}</div>
        ${mine ? '<button class="btn ghost small" data-hact="leave">빠지기</button>' : '<button class="btn primary" data-hact="join">🙋 나도 할래요</button>'}
        ${host ? '<button class="btn primary cnext" data-hact="start">시작!</button>' : '<p class="chint small">👑 방장이 시작해요</p>'}`;
      else if (h.stage === 'hide' || h.stage === 'seek') {
        const isSeeker = h.seeker === me();
        body = `<p class="chint big">${!mine ? '구경 중이에요 👀' : isSeeker ? (h.stage === 'hide' ? '👀 눈 가리고 숫자 세는 중…' : '🔍 숨을 만한 곳을 눌러서 찾아요!') : (h.stage === 'hide' ? (h.mySpot ? `🙈 ${esc(SPOTS[h.room][h.mySpot][4])}에 숨었어요` : '숨을 곳을 눌러요!') : '🤫 쉿! 들키지 마요')}</p>
          <p class="chint small">${h.found.length ? `찾은 사람: ${h.found.map((u) => esc(nick(u))).join(', ')}` : ''}</p>
          ${mine ? '<button class="btn ghost small quit-btn" data-hact="leave">🏳️ 그만할래요</button>' : ''}`;
      } else body = `<p class="chint big">🙈 숨바꼭질 끝!</p><p class="chint">${(h.survivors || []).length ? `끝까지 안 들킨 사람: <b>${(h.survivors || []).map(esc).join(', ')}</b>` : `술래 ${esc(nick(h.seeker))} 님이 모두 찾았어요!`}</p>
        <button class="btn primary cnext" data-hact="open">🙈 한 판 더!</button>`;
      $('#hidePanel').innerHTML = body;
    }
    $('#hidePanel').addEventListener('click', (e) => {
      const b = e.target.closest('[data-hact]'); if (!b) return;
      if (b.dataset.hact === 'leave' && h.stage !== 'lobby' && b.dataset.armed !== '1') { b.dataset.armed = '1'; b.textContent = '한 번 더 누르면 빠져요'; return; }
      api.send({ t: 'hide', act: b.dataset.hact }); api.Sound.Sfx.pop();
      if (b.dataset.hact === 'start') setTimeout(() => api.close(), 300);
    });
    $('#hideSpots').addEventListener('click', (e) => {
      const b = e.target.closest('[data-spot]'); if (!b) return;
      e.stopPropagation();
      if (h.stage === 'hide') { api.send({ t: 'hide', act: 'spot', spot: b.dataset.spot }); api.Sound.Sfx.whoosh(); }
      else { api.send({ t: 'hide', act: 'seek', spot: b.dataset.spot }); b.classList.add('peek'); setTimeout(() => b.classList.remove('peek'), 500); }
    });
    document.querySelectorAll('[data-close-hide]').forEach((b) => b.addEventListener('click', () => api.close()));
    return {
      set(st) {
        const prev = h.stage;
        h = st; end = Date.now() + (st.left || 0);
        overlay(); board(); panel();
        api.applyHidden(st);
        if (prev !== 'hide' && st.stage === 'hide' && inGame()) api.toast(st.seeker === me() ? '👀 내가 술래! 20초 동안 눈 감고 있어요' : '🙈 20초 안에 숨을 곳을 눌러요!');
        if (prev === 'hide' && st.stage === 'seek' && st.seeker === me()) api.toast('🔍 찾는다~! 숨을 만한 곳을 눌러 봐요');
      },
      seekFx(m) {
        const r = h.room && SPOTS[h.room][m.spot]; if (!r || api.myRoom() !== h.room) return;
        const el = document.createElement('div');
        el.className = 'hfx ' + (m.found.length ? 'hit' : 'miss');
        el.textContent = m.found.length ? '찾았다!' : '없네…';
        el.style.left = (r[0] + r[2] / 2) + 'px'; el.style.top = (r[1] + 10) + 'px';
        $('#fx').appendChild(el); setTimeout(() => el.remove(), 1200);
        api.Sound.Sfx[m.found.length ? 'tada' : 'pop']();
        if (m.found.includes(me())) api.toast('😳 들켰다!');
      },
      refresh() { overlay(); },
      setOpen(v) { open = v; panel(); },
      get state() { return h; },
    };
  };

  window.TagUI = function (api) {
    const $ = (s) => document.querySelector(s);
    let g = { stage: 'idle', players: [], times: {} }, end = 0, tick = null, open = false;
    const me = () => api.myUid();
    const inGame = () => g.players.some((m) => m.uid === me());
    const nick = (u) => (g.players.find((m) => m.uid === u) || {}).nick || '';
    const sec = (ms) => (ms / 1000).toFixed(1);
    function board() {
      const b = $('#tagBoard');
      clearInterval(tick);
      if (g.stage !== 'run') { b.hidden = true; return; }
      b.hidden = false;
      const draw = () => {
        const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
        b.innerHTML = `<span>🎅 산타: <b class="it">${esc(nick(g.it))}</b>${g.it === me() ? ' (나!)' : ''}</span><b>${left}초</b><small>${ROOM_KO[g.room]}에서 · 산타가 가까이 와서 누르면 잡혀요</small>`;
      };
      draw(); tick = setInterval(draw, 250);
    }
    function panel() {
      if (!open) return;
      const host = g.host === me(), mine = inGame();
      let body = '';
      if (g.stage === 'idle') body = `<p class="chint big">🎅 산타 술래잡기!</p><p class="chint">랜덤으로 한 명이 산타가 돼요. 산타가 가까이 가서 친구를 누르면 그 친구가 산타! 90초 동안 산타를 <b>제일 적게 한 사람</b>이 이겨요.</p>
        <button class="btn primary cnext" data-tact="open">🎅 술래잡기 열기</button>`;
      else if (g.stage === 'lobby') body = `<p class="chint">장소: <b>${ROOM_KO[g.room]}</b></p>
        <div class="hplayers">${g.players.map((m) => `<span>${esc(m.nick)}${m.uid === g.host ? ' 👑' : ''}</span>`).join('')}</div>
        ${mine ? '<button class="btn ghost small" data-tact="leave">빠지기</button>' : '<button class="btn primary" data-tact="join">🙋 나도 할래요</button>'}
        ${host ? '<button class="btn primary cnext" data-tact="start">시작!</button>' : '<p class="chint small">👑 방장이 시작해요</p>'}`;
      else if (g.stage === 'run') body = `<p class="chint big">${g.it === me() ? '🎅 내가 산타! 친구를 잡아요' : mine ? '🏃 산타를 피해 도망쳐요!' : '구경 중 👀'}</p>
        <div class="tagtimes">${g.players.map((m) => `<span class="${m.uid === g.it ? 'it' : ''}">${esc(m.nick)} <small>${sec(g.times[m.uid] || 0)}초</small></span>`).join('')}</div>
        ${mine ? '<button class="btn ghost small quit-btn" data-tact="leave">🏳️ 그만할래요</button>' : ''}`;
      else body = `<p class="chint big">🎅 술래잡기 끝!</p>
        <div class="tagtimes">${(g.results || []).map((r, i) => `<span class="${i === 0 ? 'win' : ''}">${i === 0 ? '🏆 ' : ''}${esc(r.nick)} <small>산타 ${sec(r.ms)}초</small></span>`).join('')}</div>
        <button class="btn primary cnext" data-tact="open">🎅 한 판 더!</button>`;
      $('#tagPanel').innerHTML = body;
    }
    $('#tagPanel').addEventListener('click', (e) => {
      const b = e.target.closest('[data-tact]'); if (!b) return;
      if (b.dataset.tact === 'leave' && g.stage === 'run' && b.dataset.armed !== '1') { b.dataset.armed = '1'; b.textContent = '한 번 더 누르면 빠져요'; return; }
      api.send({ t: 'tag', act: b.dataset.tact }); api.Sound.Sfx.pop();
      if (b.dataset.tact === 'start') setTimeout(() => api.close(), 300);
    });
    document.querySelectorAll('[data-close-tag]').forEach((b) => b.addEventListener('click', () => api.close()));
    return {
      set(st) {
        const prevIt = g.it, prev = g.stage;
        g = st; end = Date.now() + (st.left || 0);
        board(); panel(); api.applyTag(st);
        if (st.stage === 'run' && prev !== 'run' && inGame()) api.toast(st.it === me() ? '🎅 내가 산타! 친구들을 잡아요' : `🏃 ${nick(st.it)} 님이 산타예요! 도망쳐요`);
        else if (st.stage === 'run' && st.it === me() && prevIt !== me()) api.toast('🎅 잡혔다! 이제 내가 산타예요');
      },
      setOpen(v) { open = v; panel(); },
      isIt() { return g.stage === 'run' && g.it === me(); },
      inGame(uid) { return g.players.some((m) => m.uid === uid); },
      get state() { return g; },
    };
  };
})();
