// 🔔 효과음(브라우저가 직접 만든 소리)과 캐롤 BGM(무료 음원 재생)
(function () {
  let ctx = null, master = null, sfxGain = null, bgmGain = null;
  const prefs = {
    sfx: localStorage.getItem('xmas_sfx') !== 'off',
    bgm: localStorage.getItem('xmas_bgm') === 'on',
  };

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
      sfxGain = ctx.createGain(); sfxGain.gain.value = 0.22; sfxGain.connect(master);
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

  // 동물마다 목소리 높이가 달라요
  const VOICE = { hamster: 1050, bunny: 940, penguin: 860, cat: 800, fox: 740, puppy: 680, sheep: 620, bear: 520 };
  const Sfx = {
    // 말할 때: 물방울 같은 "뽀록" (긴 말은 "뽀록뽀록")
    chirp(type, text) {
      const base = (VOICE[type] || 760) * 0.62;
      const pairs = [...text].length > 18 ? 2 : 1;
      for (let k = 0; k < pairs; k++) {
        const t0 = k * 0.26;
        const f1 = base * (0.96 + Math.random() * 0.08);
        bloop(f1, t0, 0.075, 0.8);              // 뽀
        bloop(f1 * 1.28, t0 + 0.095, 0.065, 0.6); // 록
      }
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
        this.audio.volume = 0.35;
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
    set onTrack(fn) { Bgm.onTrack = fn; },
    get track() { return Bgm.list && Bgm.list[Bgm.idx]; },
  };
})();
