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

  // ───────── 동물 말소리 ─────────
  // 귀여운 "말소리": 부드러운 사인파가 휙 올라가거나 내려가는 짧은 음절들
  // notes: [시작(초), 길이(초), 시작음, 끝음(, 중간음)]
  function cute(t0, notes, { vib = 0, vol = 0.5, low = false } = {}) {
    for (const [dt, dur, f0, f1, fm] of notes) {
      const t = t0 + dt;
      const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), g2 = ctx.createGain();
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 3200;
      o.type = 'sine'; o2.type = 'triangle';
      for (const osc of [o, o2]) {
        const mul = osc === o ? 1 : 2;
        osc.frequency.setValueAtTime(f0 * mul, t);
        if (fm) {
          osc.frequency.exponentialRampToValueAtTime(fm * mul, t + dur * 0.45);
          osc.frequency.exponentialRampToValueAtTime(f1 * mul, t + dur);
        } else {
          osc.frequency.exponentialRampToValueAtTime(f1 * mul, t + dur * 0.8);
        }
      }
      if (vib) {
        const l = ctx.createOscillator(), lg = ctx.createGain();
        l.frequency.value = 11; lg.gain.value = vib;
        l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + 0.05);
      }
      g2.gain.value = low ? 0.05 : 0.1; // 살짝 반짝이는 배음
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
      g.gain.setValueAtTime(vol, t + dur * 0.6);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.04);
      o.connect(g); o2.connect(g2); g2.connect(g); g.connect(f); f.connect(sfxGain);
      o.start(t); o2.start(t); o.stop(t + dur + 0.06); o2.stop(t + dur + 0.06);
    }
  }
  const CRY_LEN = { cat: 0.48, puppy: 0.36, bear: 0.36, bunny: 0.3, hamster: 0.3, fox: 0.34, sheep: 0.5, penguin: 0.26, chick: 0.32, monkey: 0.36, turtle: 0.32 };
  const CRIES = {
    cat: (t, p) => cute(t, [[0, 0.15, 880 * p, 1320 * p], [0.17, 0.22, 1240 * p, 980 * p]], { vib: 18 }),          // 냐~옹
    puppy: (t, p) => cute(t, [[0, 0.1, 640 * p, 960 * p], [0.15, 0.1, 640 * p, 960 * p]]),                         // 왕왕
    bear: (t, p) => cute(t, [[0, 0.26, 420 * p, 470 * p, 560 * p]], { vol: 0.6, low: true }),                      // 뽀옹
    bunny: (t, p) => cute(t, [[0, 0.08, 1000 * p, 1900 * p], [0.11, 0.08, 1000 * p, 1900 * p]], { vol: 0.42 }),     // 뿅뿅
    hamster: (t, p) => cute(t, [[0, 0.05, 2000 * p, 2500 * p], [0.075, 0.05, 2000 * p, 2500 * p], [0.15, 0.06, 2100 * p, 2700 * p]], { vol: 0.32 }), // 찍찍찍
    fox: (t, p) => cute(t, [[0, 0.1, 1100 * p, 1200 * p, 1500 * p], [0.14, 0.1, 1100 * p, 1200 * p, 1500 * p]], { vol: 0.45 }), // 콩콩
    sheep: (t, p) => cute(t, [[0, 0.38, 700 * p, 700 * p, 780 * p]], { vib: 28 }),                                  // 메에~
    penguin: (t, p) => cute(t, [[0, 0.13, 900 * p, 1000 * p, 1400 * p]], { vol: 0.5 }),                            // 뾱!
    chick: (t, p) => cute(t, [[0, 0.08, 1800 * p, 2400 * p], [0.1, 0.12, 2300 * p, 1900 * p]], { vol: 0.38 }),      // 삐약
    monkey: (t, p) => cute(t, [[0, 0.07, 1300 * p, 1800 * p], [0.09, 0.07, 1300 * p, 1800 * p], [0.18, 0.09, 1400 * p, 2000 * p]], { vol: 0.4 }), // 끼끼끼
    turtle(t, p) {                                                                                                  // 뽀록
      const d = t - ctx.currentTime;
      bloop(330 * p, d, 0.09, 0.8);
      bloop(420 * p, d + 0.12, 0.08, 0.65);
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
    jump() { tone({ freq: 520, freqEnd: 1250, type: 'sine', dur: 0.14, vol: 0.4 }); },
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
