// 🔔 효과음(브라우저가 직접 만든 소리)과 캐롤 BGM(무료 음원 재생)
(function () {
  let ctx = null, master = null, sfxGain = null, bgmGain = null;
  const num = (k, d) => { const v = parseFloat(localStorage.getItem(k)); return isNaN(v) ? d : Math.max(0, Math.min(1, v)); };
  const prefs = {
    sfx: localStorage.getItem('xmas_sfx') !== 'off',
    bgm: localStorage.getItem('xmas_bgm') === 'on',
    sfxVol: num('xmas_sfx_vol', 0.6),
    bgmVol: num('xmas_bgm_vol', 0.35),
  };

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
      sfxGain = ctx.createGain(); sfxGain.gain.value = 0.4 * prefs.sfxVol; sfxGain.connect(master);
      bgmGain = ctx.createGain(); bgmGain.gain.value = 0.0; bgmGain.connect(master);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  // 브라우저는 사용자가 한 번 누르기 전까지 소리를 막아요 → 첫 클릭/키 입력 때 켜요
  const unlock = () => { ensure(); if (prefs.bgm) Bgm.start(); };
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });

  // ───────── 효과음 ─────────
  function tone({ freq, freqEnd, type = 'sine', dur = 0.12, vol = 1, delay = 0, attack = 0.005 }) {
    if (!prefs.sfx || !ensure()) return;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(sfxGain);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur = 0.15, vol = 0.6, delay = 0) {
    if (!prefs.sfx || !ensure()) return;
    const t = ctx.currentTime + delay;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1800;
    const g = ctx.createGain(); g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(sfxGain);
    src.start(t);
  }

  // 물방울 "뽀록" 소리: 짧은 사인파가 위로 휙 올라가요
  function bloop(freq, delay, dur, vol) {
    if (!prefs.sfx || !ensure()) return;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = 'sine';
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 2.3, t + dur * 0.7);
    f.type = 'lowpass'; f.frequency.value = 2600;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f); f.connect(g); g.connect(sfxGain);
    o.start(t); o.stop(t + dur + 0.02);
  }

  // ───────── 동물 울음소리 (브라우저가 직접 합성) ─────────
  // voice: 발진기 → (필터) → 음량, 주파수/음량 곡선을 [시각, 값] 목록으로 줘요
  function voice({ type = 'sawtooth', t0, dur, freq, gain, filter, q = 1, vibrato }) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq[0][1], t0);
    for (const [dt, f] of freq.slice(1)) o.frequency.linearRampToValueAtTime(f, t0 + dt);
    g.gain.setValueAtTime(0.0001, t0);
    for (const [dt, v] of gain) g.gain.linearRampToValueAtTime(v, t0 + dt);
    g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
    let node = o;
    if (filter) {
      const f = ctx.createBiquadFilter();
      f.type = filter.type || 'bandpass'; f.Q.value = q;
      f.frequency.setValueAtTime(filter.f[0][1], t0);
      for (const [dt, v] of filter.f.slice(1)) f.frequency.linearRampToValueAtTime(v, t0 + dt);
      node.connect(f); node = f;
    }
    if (vibrato) {
      const l = ctx.createOscillator(), lg = ctx.createGain();
      l.frequency.value = vibrato.rate; lg.gain.value = vibrato.depth;
      l.connect(lg); lg.connect(o.frequency); l.start(t0); l.stop(t0 + dur + 0.05);
    }
    node.connect(g); g.connect(sfxGain);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function puff(t0, dur, vol, fc) { // 짧은 바람 소리
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = fc; f.Q.value = 1.2;
    const g = ctx.createGain(); g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(sfxGain); src.start(t0);
  }
  const CRY_LEN = { cat: 0.5, puppy: 0.45, bear: 0.5, bunny: 0.32, hamster: 0.3, fox: 0.42, sheep: 0.65, penguin: 0.4 };
  const CRIES = {
    // 고양이: 냐~옹 (올라갔다 내려오는 음 + 모음처럼 바뀌는 필터)
    cat(t, p) {
      voice({ t0: t, dur: 0.42, freq: [[0, 620 * p], [0.12, 880 * p], [0.42, 560 * p]],
        gain: [[0.03, 0.7], [0.3, 0.55]], filter: { f: [[0, 900], [0.15, 1700], [0.42, 900]] }, q: 3 });
    },
    // 멍멍이: 멍! 멍!
    puppy(t, p) {
      for (const dt of [0, 0.2]) {
        voice({ type: 'square', t0: t + dt, dur: 0.12, freq: [[0, 420 * p], [0.03, 520 * p], [0.12, 260 * p]],
          gain: [[0.01, 0.65]], filter: { type: 'lowpass', f: [[0, 1500], [0.12, 600]] }, q: 2 });
        puff(t + dt, 0.06, 0.25, 900);
      }
    },
    // 곰돌이: 우웅~ (낮고 둥근 소리)
    bear(t, p) {
      voice({ type: 'triangle', t0: t, dur: 0.45, freq: [[0, 150 * p], [0.12, 190 * p], [0.45, 135 * p]],
        gain: [[0.06, 0.95], [0.32, 0.8]], filter: { type: 'lowpass', f: [[0, 500], [0.15, 800], [0.45, 400]] }, q: 1,
        vibrato: { rate: 6, depth: 6 } });
    },
    // 토끼: 뿅뿅 (높게 튀어오르는 소리)
    bunny(t, p) {
      for (const dt of [0, 0.13]) {
        voice({ type: 'sine', t0: t + dt, dur: 0.09, freq: [[0, 700 * p], [0.05, 1700 * p], [0.09, 1300 * p]], gain: [[0.008, 0.75]] });
      }
    },
    // 햄찌: 찍찍
    hamster(t, p) {
      for (const dt of [0, 0.1]) {
        voice({ type: 'square', t0: t + dt, dur: 0.06, freq: [[0, 2300 * p], [0.03, 2900 * p], [0.06, 2500 * p]],
          gain: [[0.005, 0.32]], filter: { type: 'lowpass', f: [[0, 4500]] } });
      }
    },
    // 여우: 캥캥 (날카롭게 짧은 소리)
    fox(t, p) {
      for (const dt of [0, 0.18]) {
        voice({ t0: t + dt, dur: 0.13, freq: [[0, 900 * p], [0.04, 1350 * p], [0.13, 750 * p]],
          gain: [[0.01, 0.6]], filter: { f: [[0, 1400], [0.05, 2200], [0.13, 1200]] }, q: 4 });
      }
    },
    // 양: 메에에~ (떨리는 소리)
    sheep(t, p) {
      voice({ t0: t, dur: 0.6, freq: [[0, 420 * p], [0.1, 470 * p], [0.6, 400 * p]],
        gain: [[0.04, 0.6], [0.45, 0.5]], filter: { f: [[0, 1000], [0.1, 1300], [0.6, 900]] }, q: 2.5,
        vibrato: { rate: 9, depth: 28 } });
    },
    // 펭귄: 꽥! (코맹맹이 소리)
    penguin(t, p) {
      voice({ type: 'square', t0: t, dur: 0.22, freq: [[0, 560 * p], [0.05, 640 * p], [0.22, 430 * p]],
        gain: [[0.01, 0.55], [0.15, 0.45]], filter: { f: [[0, 1300], [0.22, 1000]] }, q: 6 });
      puff(t, 0.05, 0.2, 1500);
    },
  };

  // 동물마다 목소리 높이가 달라요
  const VOICE = { hamster: 1050, bunny: 940, penguin: 860, cat: 800, fox: 740, puppy: 680, sheep: 620, bear: 520 };
  const Sfx = {
    // 말할 때: 동물마다 다른 울음소리 (긴 말은 두 번)
    chirp(type, text) {
      if (!prefs.sfx || !ensure()) return;
      const fn = CRIES[type] || CRIES.bear;
      const times = [...text].length > 18 ? 2 : 1;
      const gap = CRY_LEN[type] || 0.4;
      for (let k = 0; k < times; k++) fn(ctx.currentTime + k * gap, 0.92 + Math.random() * 0.16);
    },
    jump() { tone({ freq: 380, freqEnd: 980, type: 'square', dur: 0.14, vol: 0.18 }); },
    land() { tone({ freq: 220, freqEnd: 120, type: 'sine', dur: 0.08, vol: 0.4 }); },
    sparkle() {
      [1568, 2093, 1760, 2349, 2637].forEach((f, i) =>
        tone({ freq: f, type: 'sine', dur: 0.35, vol: 0.25, delay: i * 0.06 + Math.random() * 0.03 }));
    },
    whoosh() { tone({ freq: 600, freqEnd: 260, type: 'sine', dur: 0.3, vol: 0.15 }); },
    splat() { noise(0.18, 0.7); tone({ freq: 160, freqEnd: 70, dur: 0.12, vol: 0.5 }); },
    pop() { tone({ freq: 660, freqEnd: 990, type: 'sine', dur: 0.09, vol: 0.4 }); },
  };

  // ───────── 캐롤 BGM: 서버가 받아둔 무료 음원(OpenGameArt)을 차례로 틀어요 ─────────
  const Bgm = {
    audio: null, list: null, idx: 0, playing: false, onTrack: null,
    async load() {
      if (this.list) return this.list;
      try {
        const all = await (await fetch('/api/music', { cache: 'no-store' })).json();
        const probe = document.createElement('audio');
        const ok = (ext) => probe.canPlayType(ext === 'ogg' ? 'audio/ogg; codecs="vorbis"' : 'audio/mpeg') !== '';
        this.list = all.filter((t) => ok(t.ext));
      } catch (_) { this.list = []; }
      return this.list;
    },
    async start() {
      if (this.playing) return;
      this.playing = true;
      const list = await this.load();
      if (!this.playing) return;
      if (!list.length) { this.playing = false; if (this.onTrack) this.onTrack(null); return; }
      if (!this.audio) {
        this.audio = new Audio();
        this.audio.volume = prefs.bgmVol;
        this.audio.preload = 'auto';
        this.audio.addEventListener('ended', () => this.next());
        this.audio.addEventListener('error', () => { if (this.playing) setTimeout(() => this.next(), 500); });
      }
      if (!this.audio.src) this.setTrack(this.idx);
      this.audio.play().catch(() => {});
    },
    setTrack(i) {
      const t = this.list[i];
      this.audio.src = t.url;
      if (this.onTrack) this.onTrack(t);
    },
    next() {
      if (!this.list || !this.list.length) return;
      this.idx = (this.idx + 1) % this.list.length;
      this.setTrack(this.idx);
      if (this.playing) this.audio.play().catch(() => {});
    },
    stop() {
      this.playing = false;
      if (this.audio) this.audio.pause();
    },
  };

  window.Sound = {
    Sfx,
    get sfxOn() { return prefs.sfx; },
    get bgmOn() { return prefs.bgm; },
    setSfx(on) { prefs.sfx = on; localStorage.setItem('xmas_sfx', on ? 'on' : 'off'); if (on) { ensure(); Sfx.pop(); } },
    setBgm(on) { prefs.bgm = on; localStorage.setItem('xmas_bgm', on ? 'on' : 'off'); on ? Bgm.start() : Bgm.stop(); },
    nextTrack() { Bgm.next(); },
    get bgmVolume() { return prefs.bgmVol; },
    get sfxVolume() { return prefs.sfxVol; },
    setBgmVolume(v) {
      prefs.bgmVol = v; localStorage.setItem('xmas_bgm_vol', v);
      if (Bgm.audio) Bgm.audio.volume = v;
    },
    setSfxVolume(v) {
      prefs.sfxVol = v; localStorage.setItem('xmas_sfx_vol', v);
      if (sfxGain) sfxGain.gain.value = 0.4 * v;
    },
    preview(type) { Sfx.chirp(type, '안녕'); },
    set onTrack(fn) { Bgm.onTrack = fn; },
    get track() { return Bgm.list && Bgm.list[Bgm.idx]; },
  };
})();
