// 🔔 효과음과 캐롤 BGM — 소리 파일 없이 브라우저(Web Audio)로 직접 만들어요
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

  // 동물마다 목소리 높이가 달라요
  const VOICE = { hamster: 1050, bunny: 940, penguin: 860, cat: 800, fox: 740, puppy: 680, sheep: 620, bear: 520 };
  const Sfx = {
    // 말할 때: 글자 수만큼 "삐약삐약"
    chirp(type, text) {
      const base = VOICE[type] || 760;
      const n = Math.max(2, Math.min(9, Math.ceil([...text].length / 2)));
      for (let i = 0; i < n; i++) {
        const f = base * (0.9 + Math.random() * 0.28);
        tone({ freq: f, freqEnd: f * 1.35, type: 'triangle', dur: 0.07, vol: 0.55, delay: i * 0.085 });
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

  // ───────── 캐롤 BGM (저작권이 끝난 전통 캐롤을 오르골 소리로) ─────────
  const N = (name) => {
    const m = name.match(/^([A-G])(#|b)?(\d)$/);
    const idx = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 }[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
    return 440 * Math.pow(2, (idx + (Number(m[3]) - 4) * 12) / 12);
  };
  // [음, 박자]
  const JINGLE = {
    bpm: 150,
    melody: [
      ['B4', 1], ['B4', 1], ['B4', 2], ['B4', 1], ['B4', 1], ['B4', 2],
      ['B4', 1], ['D5', 1], ['G4', 1.5], ['A4', 0.5], ['B4', 4],
      ['C5', 1], ['C5', 1], ['C5', 1.5], ['C5', 0.5], ['C5', 1], ['B4', 1], ['B4', 1], ['B4', 0.5], ['B4', 0.5],
      ['B4', 1], ['A4', 1], ['A4', 1], ['B4', 1], ['A4', 2], ['D5', 2],
      ['B4', 1], ['B4', 1], ['B4', 2], ['B4', 1], ['B4', 1], ['B4', 2],
      ['B4', 1], ['D5', 1], ['G4', 1.5], ['A4', 0.5], ['B4', 4],
      ['C5', 1], ['C5', 1], ['C5', 1.5], ['C5', 0.5], ['C5', 1], ['B4', 1], ['B4', 1], ['B4', 0.5], ['B4', 0.5],
      ['D5', 1], ['D5', 1], ['C5', 1], ['A4', 1], ['G4', 4],
    ],
    beatsPerBar: 4,
    bass: ['G2', 'G2', 'G2', 'G2', 'C3', 'G2', 'A2', 'D3', 'G2', 'G2', 'G2', 'G2', 'C3', 'G2', 'D3', 'G2'],
  };
  const WISH = {
    bpm: 132,
    pickup: 1,
    melody: [
      ['D4', 1],
      ['G4', 1], ['G4', 0.5], ['A4', 0.5], ['G4', 0.5], ['F#4', 0.5], ['E4', 1], ['E4', 1], ['E4', 1],
      ['A4', 1], ['A4', 0.5], ['B4', 0.5], ['A4', 0.5], ['G4', 0.5], ['F#4', 1], ['D4', 1], ['D4', 1],
      ['B4', 1], ['B4', 0.5], ['C5', 0.5], ['B4', 0.5], ['A4', 0.5], ['G4', 1], ['E4', 1], ['D4', 0.5], ['D4', 0.5],
      ['E4', 1], ['A4', 1], ['F#4', 1], ['G4', 3],
    ],
    beatsPerBar: 3,
    bass: ['G2', 'C3', 'A2', 'D3', 'B2', 'E3', 'C3', 'G2'],
  };
  const SONGS = [JINGLE, WISH];

  function bell(freq, t, dur, vol) {
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
    o1.type = 'sine'; o2.type = 'sine';
    o1.frequency.value = freq; o2.frequency.value = freq * 2.01;
    const g2 = ctx.createGain(); g2.gain.value = 0.18;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.5, dur * 1.6));
    o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(bgmGain);
    o1.start(t); o2.start(t); o1.stop(t + dur * 1.6 + 0.6); o2.stop(t + dur * 1.6 + 0.6);
  }
  function bassNote(freq, t, dur) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(bgmGain);
    o.start(t); o.stop(t + dur + 0.05);
  }

  // 곡 하나를 [시작시각(초), 종류, 주파수, 길이] 목록으로 펼쳐요
  function expand(song) {
    const spb = 60 / song.bpm;
    const ev = [];
    let beat = 0;
    for (const [n, b] of song.melody) { ev.push([beat * spb, 'bell', N(n), b * spb]); beat += b; }
    const offset = song.pickup || 0;
    song.bass.forEach((n, i) => ev.push([(offset + i * song.beatsPerBar) * spb, 'bass', N(n), song.beatsPerBar * spb * 0.9]));
    return { ev: ev.sort((a, b) => a[0] - b[0]), length: beat * spb + spb * 2 };
  }
  const EXPANDED = SONGS.map(expand);

  const Bgm = {
    timer: null, songIdx: 0, songStart: 0, cursor: 0,
    start() {
      if (!ensure() || this.timer) return;
      bgmGain.gain.cancelScheduledValues(ctx.currentTime);
      bgmGain.gain.setTargetAtTime(0.11, ctx.currentTime, 0.4);
      this.songStart = ctx.currentTime + 0.2;
      this.cursor = 0;
      this.timer = setInterval(() => this.tick(), 80);
    },
    stop() {
      if (!ctx || !this.timer) return;
      clearInterval(this.timer); this.timer = null;
      bgmGain.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
    },
    tick() {
      const song = EXPANDED[this.songIdx];
      const ahead = ctx.currentTime + 0.35;
      while (this.cursor < song.ev.length && this.songStart + song.ev[this.cursor][0] < ahead) {
        const [t, kind, f, d] = song.ev[this.cursor++];
        const at = Math.max(ctx.currentTime, this.songStart + t);
        if (kind === 'bell') bell(f, at, d, 0.5); else bassNote(f, at, d);
      }
      if (this.cursor >= song.ev.length && ctx.currentTime > this.songStart + song.length - 0.35) {
        this.songStart += song.length;
        this.songIdx = (this.songIdx + 1) % EXPANDED.length;
        this.cursor = 0;
      }
    },
  };

  window.Sound = {
    Sfx,
    get sfxOn() { return prefs.sfx; },
    get bgmOn() { return prefs.bgm; },
    setSfx(on) { prefs.sfx = on; localStorage.setItem('xmas_sfx', on ? 'on' : 'off'); if (on) { ensure(); Sfx.pop(); } },
    setBgm(on) { prefs.bgm = on; localStorage.setItem('xmas_bgm', on ? 'on' : 'off'); on ? Bgm.start() : Bgm.stop(); },
  };
})();
