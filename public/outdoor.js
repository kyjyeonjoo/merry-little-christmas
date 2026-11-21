// ❄️ 눈마당: 바깥 풍경 · 눈사람 만들기 · 썰매 경주
(function () {
  const LINE = '#5b4036';
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ───────── 바깥 풍경 (1000 × 620) ─────────
  function rnd(seed) { let x = seed; return () => (x = (x * 9301 + 49297) % 233280) / 233280; }
  function pine(x, y, s, snow = true) {
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <rect x="-5" y="-6" width="10" height="16" fill="#7a4a2e"/>
      <path d="M0 -92 L26 -48 L14 -50 L34 -18 L20 -20 L42 8 L-42 8 L-20 -20 L-34 -18 L-14 -50 L-26 -48 Z" fill="#2f7a5c" stroke="#24504a" stroke-width="2.4" stroke-linejoin="round"/>
      ${snow ? `<path d="M0 -92 L12 -71 Q4 -66 -2 -71 Q-8 -66 -12 -71 Z M-20 -47 Q-6 -40 4 -46 Q14 -40 22 -46 L14 -50 L0 -58 L-14 -50 Z M-30 -17 Q-12 -9 2 -15 Q16 -9 32 -16 L20 -20 L0 -30 L-20 -20 Z" fill="#fff"/>` : ''}
    </g>`;
  }
  function scene() {
    const r = rnd(7);
    const stars = Array.from({ length: 46 }, () => `<circle cx="${(r() * 1000).toFixed(0)}" cy="${(r() * 210).toFixed(0)}" r="${(0.8 + r() * 1.6).toFixed(1)}" fill="#fff" opacity="${(0.4 + r() * 0.6).toFixed(2)}"/>`).join('');
    const tw = Array.from({ length: 6 }, (_, i) => `<path class="otw" style="animation-delay:-${i * 0.4}s" transform="translate(${80 + i * 160 + (i % 2) * 40} ${40 + (i * 53) % 120})" d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5 Z" fill="#fff6c4"/>`).join('');
    return `<svg class="out-scene" viewBox="0 0 1000 620" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="oSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#18234a"/><stop offset=".7" stop-color="#36508c"/><stop offset="1" stop-color="#5a76b3"/></linearGradient>
        <radialGradient id="oMoon"><stop offset="0" stop-color="#fff7d0" stop-opacity=".7"/><stop offset="1" stop-color="#fff7d0" stop-opacity="0"/></radialGradient>
        <radialGradient id="oLamp"><stop offset="0" stop-color="#ffe7a0" stop-opacity=".75"/><stop offset="1" stop-color="#ffe7a0" stop-opacity="0"/></radialGradient>
        <linearGradient id="oGround" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9f1fd"/><stop offset="1" stop-color="#fbfdff"/></linearGradient>
      </defs>
      <rect width="1000" height="340" fill="url(#oSky)"/>
      ${stars}${tw}
      <circle cx="880" cy="78" r="70" fill="url(#oMoon)"/>
      <path d="M892 52 A30 30 0 1 0 892 108 A23 23 0 1 1 892 52 Z" fill="#fff3c0"/>
      <!-- 먼 언덕 -->
      <path d="M0 250 Q120 190 260 236 Q380 270 500 222 Q640 168 780 226 Q900 270 1000 230 L1000 340 L0 340 Z" fill="#b9cbea"/>
      ${[[90, 236, .45], [150, 228, .38], [560, 214, .42], [620, 208, .36], [700, 220, .4], [960, 240, .44]].map(([x, y, s]) => pine(x, y, s)).join('')}
      <path d="M0 300 Q180 250 360 292 Q520 326 700 280 Q860 244 1000 290 L1000 340 L0 340 Z" fill="#dbe6f7"/>
      <rect y="320" width="1000" height="300" fill="url(#oGround)"/>
      <path d="M0 330 Q250 312 500 330 Q760 348 1000 326 L1000 345 L0 345 Z" fill="#dfe8f7"/>
      ${Array.from({ length: 14 }, (_, i) => `<ellipse cx="${(r() * 1000).toFixed(0)}" cy="${(380 + r() * 220).toFixed(0)}" rx="${(30 + r() * 60).toFixed(0)}" ry="${(5 + r() * 6).toFixed(0)}" fill="#dbe5f5" opacity=".7"/>`).join('')}
      <!-- 썰매 자국 -->
      <path d="M700 372 Q600 440 520 610 M716 376 Q620 446 542 612" stroke="#d3def2" stroke-width="5" fill="none" stroke-linecap="round"/>

      <!-- 집 -->
      <g>
        <rect x="-10" y="150" width="244" height="212" fill="#b65a43" stroke="${LINE}" stroke-width="3"/>
        ${[176, 202, 228, 254, 280, 306, 332].map((y) => `<path d="M-10 ${y} L234 ${y}" stroke="#9c4734" stroke-width="2"/>`).join('')}
        <rect x="170" y="44" width="34" height="70" fill="#8a5a4a" stroke="${LINE}" stroke-width="3"/>
        <rect x="164" y="38" width="46" height="12" rx="4" fill="#fff" stroke="${LINE}" stroke-width="2.4"/>
        <g class="osmoke" fill="#e6ecf7" opacity=".8"><circle cx="190" cy="26" r="9"/><circle cx="202" cy="10" r="7"/><circle cx="194" cy="-4" r="5"/></g>
        <path d="M-30 168 L112 62 L256 168 Z" fill="#6b3a2e" stroke="${LINE}" stroke-width="3.4" stroke-linejoin="round"/>
        <path d="M-30 168 L112 62 L256 168 Q236 180 214 168 Q196 184 176 168 Q156 182 136 168 Q114 184 92 168 Q70 182 50 168 Q30 184 10 168 Q-10 182 -30 168 Z" fill="none"/>
        <path d="M-34 166 L112 56 L260 166 Q250 178 236 170 Q222 186 204 172 L112 104 L20 172 Q4 186 -10 172 Q-24 178 -34 166 Z" fill="#fff" stroke="#c9d6ea" stroke-width="2"/>
        <rect x="26" y="204" width="70" height="62" rx="6" fill="#ffd98a" stroke="${LINE}" stroke-width="3"/>
        <path d="M61 204 L61 266 M26 235 L96 235" stroke="${LINE}" stroke-width="3"/>
        <rect x="20" y="264" width="82" height="10" rx="4" fill="#fff" stroke="${LINE}" stroke-width="2"/>
        <circle cx="40" cy="222" r="8" fill="#e8474f"/><circle cx="82" cy="250" r="6" fill="#3f9c6d"/>
        <rect x="122" y="236" width="76" height="126" rx="38 38 4 4" fill="#e8474f" stroke="${LINE}" stroke-width="3.4"/>
        <path d="M122 274 Q160 236 198 274" fill="none"/>
        <rect x="130" y="246" width="60" height="110" rx="30" fill="none" stroke="#c23a42" stroke-width="2.4"/>
        <circle cx="188" cy="304" r="4.5" fill="#ffd34d" stroke="${LINE}" stroke-width="1.6"/>
        <circle cx="160" cy="276" r="18" fill="none" stroke="#2f7a5c" stroke-width="9"/>
        <circle cx="160" cy="276" r="18" fill="none" stroke="#3f9c6d" stroke-width="5" stroke-dasharray="4 3"/>
        <path d="M160 292 l-7 10 l7 -3 l7 3 Z" fill="#e8474f" stroke="${LINE}" stroke-width="1.4"/>
        <path d="M-10 362 Q30 344 70 360 Q110 346 150 362 Q190 344 240 362 L240 372 L-10 372 Z" fill="#fff"/>
      </g>

      <!-- 가로등 -->
      <ellipse cx="608" cy="268" rx="70" ry="70" fill="url(#oLamp)"/>
      <rect x="604" y="268" width="8" height="122" fill="#3c4660"/>
      <path d="M594 262 L622 262 L616 280 L600 280 Z" fill="#ffe9a8" stroke="#3c4660" stroke-width="3" stroke-linejoin="round"/>
      <path d="M592 262 L624 262 L608 248 Z" fill="#3c4660"/><rect x="598" y="386" width="20" height="6" rx="2" fill="#3c4660"/>
      <path d="M602 300 Q608 292 614 300" fill="#e8474f" stroke="${LINE}" stroke-width="1.4"/>

      <!-- 눈사람 공방 -->
      <g transform="translate(345 368)">
        <ellipse cx="0" cy="4" rx="58" ry="12" fill="#cfdbef"/>
        <path d="M-52 4 Q-50 -26 -18 -30 Q-4 -46 18 -32 Q48 -28 52 4 Z" fill="#fff" stroke="#c4d2ea" stroke-width="2.4"/>
        <circle cx="-30" cy="-6" r="13" fill="#fff" stroke="#c4d2ea" stroke-width="2"/>
        <g transform="translate(30 -18) rotate(22)"><rect x="-3" y="-44" width="6" height="40" fill="#b97a4f" stroke="${LINE}" stroke-width="1.8"/><path d="M-11 -4 L11 -4 L9 16 Q0 20 -9 16 Z" fill="#9fb1c9" stroke="${LINE}" stroke-width="2"/></g>
        <path d="M-60 -6 L-44 -6 L-46 12 L-58 12 Z" fill="#5b9cf0" stroke="${LINE}" stroke-width="2"/>
        <g transform="translate(-6 -64)"><rect x="-2.5" y="0" width="5" height="34" fill="#8c5232"/>
          <rect x="-36" y="-22" width="72" height="24" rx="6" fill="#fffaf2" stroke="${LINE}" stroke-width="2.4"/>
          <text y="-5" text-anchor="middle" font-size="13" font-family="Jua, sans-serif" fill="${LINE}">눈사람 공방</text></g>
      </g>

      <!-- 벤치 -->
      <g transform="translate(498 384)">
        <rect x="-62" y="-36" width="124" height="10" rx="3" fill="#b97a4f" stroke="${LINE}" stroke-width="2.4"/>
        <rect x="-62" y="-22" width="124" height="10" rx="3" fill="#b97a4f" stroke="${LINE}" stroke-width="2.4"/>
        <path d="M-62 -38 Q-30 -46 0 -38 Q30 -46 62 -38" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none"/>
        <rect x="-66" y="-6" width="132" height="10" rx="3" fill="#c98a5e" stroke="${LINE}" stroke-width="2.4"/>
        <path d="M-56 4 L-56 20 M56 4 L56 20 M-50 -26 L-50 -6 M50 -26 L50 -6" stroke="${LINE}" stroke-width="4" stroke-linecap="round"/>
      </g>

      <!-- 썰매 경주 출발선 -->
      <g transform="translate(712 330)">
        <path d="M-74 -46 L-74 42 M74 -46 L74 42" stroke="#8c5232" stroke-width="6" stroke-linecap="round"/>
        <path d="M-74 -44 Q0 -30 74 -44 L74 -16 Q0 -2 -74 -16 Z" fill="#e8474f" stroke="${LINE}" stroke-width="2.6"/>
        <text y="-17" text-anchor="middle" font-size="16" font-family="Jua, sans-serif" fill="#fff">썰매 경주</text>
        ${Array.from({ length: 10 }, (_, i) => `<rect x="${-70 + i * 14}" y="40" width="14" height="7" fill="${i % 2 ? '#fff' : LINE}"/><rect x="${-70 + i * 14}" y="47" width="14" height="7" fill="${i % 2 ? LINE : '#fff'}"/>`).join('')}
        ${sledArt(-36, 30, 0.8)}${sledArt(30, 34, 0.8, '#5b9cf0')}
      </g>

      <!-- 이글루 -->
      <g transform="translate(872 416)">
        <ellipse cx="0" cy="2" rx="96" ry="12" fill="#cfdbef"/>
        <path d="M-86 0 Q-86 -92 0 -94 Q86 -92 86 0 Z" fill="#f4f8ff" stroke="#9fb4d6" stroke-width="3.4"/>
        ${[-22, -46, -68].map((y, i) => `<path d="M${-86 + i * 7} ${y} Q0 ${y - 6} ${86 - i * 7} ${y}" stroke="#c4d2ea" stroke-width="2.4" fill="none"/>`).join('')}
        ${[[-60, -11], [-20, -11], [20, -11], [60, -11], [-40, -34], [0, -34], [40, -34], [-52, -57], [-14, -57], [26, -57], [-20, -80], [20, -80]].map(([x, y]) => `<path d="M${x} ${y - 11} L${x} ${y + 11}" stroke="#c4d2ea" stroke-width="2.2"/>`).join('')}
        <path d="M-34 0 Q-34 -46 0 -46 Q34 -46 34 0 Z" fill="#e3ebf8" stroke="#9fb4d6" stroke-width="3"/>
        <path d="M-22 0 Q-22 -32 0 -32 Q22 -32 22 0 Z" fill="#3a527c"/>
        <path d="M-18 -8 Q0 -14 18 -8" stroke="#ffd98a" stroke-width="3" opacity=".6" fill="none"/>
      </g>
      ${pine(975, 330, 0.9)}${pine(560, 300, 0.55)}${pine(262, 350, 0.6)}
    </svg>`;
  }
  function sledArt(x, y, s, color = '#e8474f') {
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <path d="M-30 6 L26 6 Q36 6 36 -4" stroke="#8a95a8" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <path d="M-20 0 L-20 6 M14 0 L14 6" stroke="#8a95a8" stroke-width="3"/>
      <rect x="-28" y="-10" width="56" height="11" rx="4" fill="${color}" stroke="${LINE}" stroke-width="2.4"/>
      <path d="M-24 -5 L24 -5" stroke="#fff" stroke-width="2" opacity=".5"/>
    </g>`;
  }
  // 거실 벽의 바깥 문
  function doorArt() {
    return `<svg viewBox="0 0 90 196" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="86" height="190" rx="43 43 4 4" fill="#c98a5e" stroke="${LINE}" stroke-width="3"/>
      <rect x="10" y="12" width="70" height="182" rx="35 35 2 2" fill="#e8474f" stroke="${LINE}" stroke-width="3"/>
      <rect x="18" y="66" width="22" height="46" rx="5" fill="none" stroke="#c23a42" stroke-width="2.4"/>
      <rect x="50" y="66" width="22" height="46" rx="5" fill="none" stroke="#c23a42" stroke-width="2.4"/>
      <rect x="18" y="122" width="22" height="50" rx="5" fill="none" stroke="#c23a42" stroke-width="2.4"/>
      <rect x="50" y="122" width="22" height="50" rx="5" fill="none" stroke="#c23a42" stroke-width="2.4"/>
      <path d="M22 50 Q45 20 68 50 Z" fill="#9fd0ff" stroke="${LINE}" stroke-width="2.4"/>
      <circle cx="70" cy="120" r="4.5" fill="#ffd34d" stroke="${LINE}" stroke-width="1.6"/>
      <circle cx="45" cy="86" r="17" fill="none" stroke="#2f7a5c" stroke-width="8"/>
      <circle cx="45" cy="86" r="17" fill="none" stroke="#3f9c6d" stroke-width="4" stroke-dasharray="4 3"/>
      <g fill="#e8474f"><circle cx="33" cy="76" r="2.4"/><circle cx="58" cy="80" r="2.4"/><circle cx="52" cy="100" r="2.4"/></g>
      <path d="M45 101 l-7 10 l7 -3 l7 3 Z" fill="#e8474f" stroke="${LINE}" stroke-width="1.4"/>
      <g transform="translate(45 158)"><rect x="-26" y="-11" width="52" height="20" rx="5" fill="#fffaf2" stroke="${LINE}" stroke-width="2"/>
        <text y="4" text-anchor="middle" font-size="11" font-family="Jua, sans-serif" fill="${LINE}">눈마당 ▸</text></g>
    </svg>`;
  }

  // ───────── 눈사람 그림 (발 밑 가운데가 0,0) ─────────
  const SCARF = { red: '#e8474f', green: '#3f9c6d', blue: '#5b9cf0', pink: '#ff9db5', stripe: '#e8474f' };
  function snowman(sm, opt = {}) {
    const lv = sm.lv === 2 ? 2 : 3;
    const sz = sm.sz || [44, 32, 24];
    const rB = sz[0], rM = lv === 3 ? sz[1] : 0, rH = sz[2];
    const yB = -rB;
    const yM = lv === 3 ? yB - rB * 0.82 - rM * 0.82 : yB;
    const yH = lv === 3 ? yM - rM * 0.85 - rH * 0.85 : yB - rB * 0.84 - rH * 0.84;
    const ball = (y, r) => `<circle cy="${y}" r="${r}" fill="#fff" stroke="${LINE}" stroke-width="2.6"/><path d="M${r * 0.35} ${y + r * 0.82} A${r} ${r} 0 0 0 ${r * 0.9} ${y + r * 0.2}" stroke="#d9e4f4" stroke-width="${r * 0.18}" fill="none" stroke-linecap="round"/>`;
    const body = ball(yB, rB) + (lv === 3 ? ball(yM, rM) : '') + ball(yH, rH);
    const torsoY = lv === 3 ? yM : yB, torsoR = lv === 3 ? rM : rB;
    // 팔
    let arms = '';
    if (sm.arms !== 'none') {
      const ay = torsoY - torsoR * 0.15, ax = torsoR * 0.9;
      const twig = (d) => `<g transform="scale(${d} 1)"><path d="M${ax} ${ay} L${ax + 30} ${ay - 22} M${ax + 18} ${ay - 13} L${ax + 22} ${ay - 26} M${ax + 24} ${ay - 18} L${ax + 36} ${ay - 18}" stroke="#7a4a2e" stroke-width="3.4" stroke-linecap="round" fill="none"/>
        ${sm.arms === 'mitten' ? `<g transform="translate(${ax + 32} ${ay - 24})"><path d="M-6 4 Q-8 -6 0 -8 Q8 -8 7 2 Q6 8 0 8 Q-5 8 -6 4 Z" fill="#e8474f" stroke="${LINE}" stroke-width="1.8"/><path d="M-6 -1 Q-11 -4 -9 -8 Q-6 -10 -4 -6" fill="#e8474f" stroke="${LINE}" stroke-width="1.6"/><rect x="-6" y="5" width="12" height="4" rx="2" fill="#fff" stroke="${LINE}" stroke-width="1.4"/></g>` : ''}</g>`;
      arms = twig(1) + twig(-1);
    }
    // 단추
    let buttons = '';
    if (sm.buttons !== 'none') {
      const cs = sm.buttons === 'color' ? ['#e8474f', '#3f9c6d', '#f2c14e'] : ['#3b3030', '#3b3030', '#3b3030'];
      buttons = [-0.35, 0.05, 0.45].map((f, i) => `<circle cy="${torsoY + f * torsoR}" r="${Math.max(2.6, torsoR * 0.1)}" fill="${cs[i]}" ${sm.buttons === 'color' ? `stroke="${LINE}" stroke-width="1.2"` : ''}/>`).join('');
    }
    // 얼굴
    const ex = rH * 0.36, ey = yH - rH * 0.18, er = Math.max(2.4, rH * 0.12);
    const coal = (x) => `<circle cx="${x}" cy="${ey}" r="${er}" fill="#3b3030"/>`;
    const arc = (x) => `<path d="M${x - er * 1.2} ${ey + er * 0.5} Q${x} ${ey - er * 1.6} ${x + er * 1.2} ${ey + er * 0.5}" stroke="#3b3030" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    let eyes = '';
    switch (sm.eyes) {
      case 'sparkle': eyes = [-ex, ex].map((x) => coal(x) + `<circle cx="${x - er * 0.35}" cy="${ey - er * 0.35}" r="${er * 0.38}" fill="#fff"/>`).join(''); break;
      case 'happy': eyes = arc(-ex) + arc(ex); break;
      case 'sleepy': eyes = [-ex, ex].map((x) => `<path d="M${x - er * 1.2} ${ey} Q${x} ${ey + er * 1.3} ${x + er * 1.2} ${ey}" stroke="#3b3030" stroke-width="2.4" fill="none" stroke-linecap="round"/>`).join(''); break;
      case 'wink': eyes = coal(-ex) + arc(ex); break;
      default: eyes = coal(-ex) + coal(ex);
    }
    const ny = yH + rH * 0.12;
    let nose = '';
    if (sm.nose === 'round') nose = `<circle cy="${ny}" r="${rH * 0.15}" fill="#ff9a3c" stroke="${LINE}" stroke-width="1.6"/>`;
    else if (sm.nose === 'button') nose = `<circle cy="${ny}" r="${rH * 0.14}" fill="#e8474f" stroke="${LINE}" stroke-width="1.6"/><circle cx="${-rH * 0.04}" cy="${ny - rH * 0.04}" r="${rH * 0.04}" fill="#fff"/>`;
    else nose = `<path d="M-1 ${ny - rH * 0.1} L${rH * 0.75} ${ny + rH * 0.04} L-1 ${ny + rH * 0.12} Z" fill="#ff9a3c" stroke="${LINE}" stroke-width="1.6" stroke-linejoin="round"/><path d="M${rH * 0.2} ${ny - rH * 0.06} l0 ${rH * 0.1} M${rH * 0.42} ${ny - rH * 0.02} l0 ${rH * 0.07}" stroke="#d9772a" stroke-width="1.2"/>`;
    const my = yH + rH * 0.45, mw = rH * 0.38;
    let mouth = '';
    switch (sm.mouth) {
      case 'coal': mouth = [-1, -0.5, 0, 0.5, 1].map((f) => `<circle cx="${f * mw}" cy="${my + (1 - f * f) * rH * 0.1}" r="${Math.max(1.6, rH * 0.06)}" fill="#3b3030"/>`).join(''); break;
      case 'open': mouth = `<path d="M${-mw * 0.7} ${my - 2} Q0 ${my - 3} ${mw * 0.7} ${my - 2} Q${mw * 0.5} ${my + rH * 0.28} 0 ${my + rH * 0.28} Q${-mw * 0.5} ${my + rH * 0.28} ${-mw * 0.7} ${my - 2} Z" fill="#7a3a3a" stroke="#3b3030" stroke-width="1.8"/><ellipse cy="${my + rH * 0.19}" rx="${mw * 0.32}" ry="${rH * 0.07}" fill="#ff8fa3"/>`; break;
      case 'cat': mouth = `<path d="M${-mw} ${my} Q${-mw / 2} ${my + rH * 0.2} 0 ${my} Q${mw / 2} ${my + rH * 0.2} ${mw} ${my}" stroke="#3b3030" stroke-width="2.2" fill="none" stroke-linecap="round"/>`; break;
      case 'tongue': mouth = `<path d="M${-mw} ${my} Q0 ${my + rH * 0.3} ${mw} ${my}" stroke="#3b3030" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M${mw * 0.05} ${my + rH * 0.12} q${mw * 0.3} ${rH * 0.02} ${mw * 0.32} ${rH * 0.2} q-${mw * 0.16} ${rH * 0.12} -${mw * 0.34} -${rH * 0.04} Z" fill="#ff8fa3" stroke="#3b3030" stroke-width="1.4"/>`; break;
      default: mouth = `<path d="M${-mw} ${my} Q0 ${my + rH * 0.3} ${mw} ${my}" stroke="#3b3030" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    }
    const blush = sm.blush ? `<ellipse cx="${-rH * 0.58}" cy="${yH + rH * 0.25}" rx="${rH * 0.16}" ry="${rH * 0.1}" fill="#ff9db5" opacity=".75"/><ellipse cx="${rH * 0.58}" cy="${yH + rH * 0.25}" rx="${rH * 0.16}" ry="${rH * 0.1}" fill="#ff9db5" opacity=".75"/>` : '';
    // 목도리 (머리 밑)
    let scarf = '';
    if (sm.scarf && sm.scarf !== 'none') {
      const sc = SCARF[sm.scarf], sy = yH + rH * 0.86, sw = rH * 0.95;
      const stripes = sm.scarf === 'stripe' ? `stroke-dasharray="5 5"` : '';
      scarf = `<path d="M${-sw} ${sy - 3} Q0 ${sy + 8} ${sw} ${sy - 3} L${sw} ${sy + 5} Q0 ${sy + 16} ${-sw} ${sy + 5} Z" fill="${sc}" stroke="${LINE}" stroke-width="2.2" stroke-linejoin="round"/>
        ${sm.scarf === 'stripe' ? `<path d="M${-sw + 2} ${sy + 2} Q0 ${sy + 12} ${sw - 2} ${sy + 2}" stroke="#fff" stroke-width="5" fill="none" ${stripes}/>` : ''}
        <path d="M${sw * 0.35} ${sy + 6} L${sw * 0.55} ${sy + 30} L${sw * 0.15} ${sy + 32} L${sw * 0.05} ${sy + 8} Z" fill="${sc}" stroke="${LINE}" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M${sw * 0.2} ${sy + 32} l0 4 M${sw * 0.35} ${sy + 31} l0 4 M${sw * 0.5} ${sy + 30} l0 4" stroke="${sc}" stroke-width="2" stroke-linecap="round"/>`;
    }
    // 모자
    const ht = yH - rH * 0.78;
    let hat = '';
    switch (sm.hat) {
      case 'beanie': hat = `<path d="M${-rH * 0.95} ${ht + rH * 0.25} Q${-rH} ${ht - rH * 0.8} 0 ${ht - rH * 0.85} Q${rH} ${ht - rH * 0.8} ${rH * 0.95} ${ht + rH * 0.25} Z" fill="#e8474f" stroke="${LINE}" stroke-width="2.4"/>
        <rect x="${-rH * 1.02}" y="${ht + rH * 0.02}" width="${rH * 2.04}" height="${rH * 0.34}" rx="${rH * 0.15}" fill="#fff" stroke="${LINE}" stroke-width="2.2"/>
        <circle cy="${ht - rH * 0.88}" r="${rH * 0.24}" fill="#fff" stroke="${LINE}" stroke-width="2.2"/>`; break;
      case 'santa': hat = `<path d="M${-rH * 0.95} ${ht + rH * 0.15} Q${-rH * 0.6} ${ht - rH * 1.2} ${rH * 0.4} ${ht - rH * 1.1} Q${rH * 1.3} ${ht - rH * 0.9} ${rH * 1.35} ${ht - rH * 0.2} L${rH * 0.9} ${ht + rH * 0.15} Z" fill="#e8474f" stroke="${LINE}" stroke-width="2.4" stroke-linejoin="round"/>
        <rect x="${-rH * 1.05}" y="${ht}" width="${rH * 2.1}" height="${rH * 0.36}" rx="${rH * 0.18}" fill="#fff" stroke="${LINE}" stroke-width="2.2"/>
        <circle cx="${rH * 1.35}" cy="${ht - rH * 0.2}" r="${rH * 0.24}" fill="#fff" stroke="${LINE}" stroke-width="2.2"/>`; break;
      case 'top': hat = `<rect x="${-rH * 0.7}" y="${ht - rH * 1.1}" width="${rH * 1.4}" height="${rH * 1.2}" rx="3" fill="#3a3340" stroke="${LINE}" stroke-width="2.4"/>
        <rect x="${-rH * 0.7}" y="${ht - rH * 0.32}" width="${rH * 1.4}" height="${rH * 0.28}" fill="#e8474f"/>
        <rect x="${-rH * 1.1}" y="${ht + rH * 0.02}" width="${rH * 2.2}" height="${rH * 0.22}" rx="${rH * 0.1}" fill="#3a3340" stroke="${LINE}" stroke-width="2.2"/>
        <path d="M${rH * 0.2} ${ht - rH * 0.3} l${rH * 0.14} -${rH * 0.14} l${rH * 0.14} ${rH * 0.14} l-${rH * 0.14} ${rH * 0.14} Z" fill="#3f9c6d"/>`; break;
      case 'bucket': hat = `<g transform="rotate(-10 0 ${ht})"><path d="M${-rH * 0.85} ${ht + rH * 0.15} L${-rH * 0.6} ${ht - rH * 0.95} L${rH * 0.6} ${ht - rH * 0.95} L${rH * 0.85} ${ht + rH * 0.15} Z" fill="#5b9cf0" stroke="${LINE}" stroke-width="2.4" stroke-linejoin="round"/>
        <ellipse cy="${ht - rH * 0.95}" rx="${rH * 0.6}" ry="${rH * 0.12}" fill="#3f7ad0" stroke="${LINE}" stroke-width="2"/>
        <path d="M${-rH * 0.7} ${ht - rH * 0.3} Q0 ${ht - rH * 0.15} ${rH * 0.72} ${ht - rH * 0.3}" stroke="#fff" stroke-width="2" opacity=".6" fill="none"/></g>`; break;
      case 'muffs': hat = `<path d="M${-rH * 0.95} ${yH - rH * 0.05} Q0 ${yH - rH * 1.55} ${rH * 0.95} ${yH - rH * 0.05}" stroke="#ff9db5" stroke-width="${rH * 0.16}" fill="none" stroke-linecap="round"/>
        <circle cx="${-rH * 0.95}" cy="${yH}" r="${rH * 0.27}" fill="#fff" stroke="${LINE}" stroke-width="2.2"/><circle cx="${rH * 0.95}" cy="${yH}" r="${rH * 0.27}" fill="#fff" stroke="${LINE}" stroke-width="2.2"/>
        <circle cx="${-rH * 0.95}" cy="${yH}" r="${rH * 0.15}" fill="#ff9db5"/><circle cx="${rH * 0.95}" cy="${yH}" r="${rH * 0.15}" fill="#ff9db5"/>`; break;
      case 'bow': { const bx = rH * 0.55, by = yH - rH * 0.75; hat = `<g transform="translate(${bx} ${by}) rotate(18) scale(${rH / 24})"><path d="M0 0 C-6 -10 -15 -8 -14 -1 C-13 4 -5 3 0 0 Z M0 0 C6 -10 15 -8 14 -1 C13 4 5 3 0 0 Z" fill="#e8474f" stroke="${LINE}" stroke-width="2"/><circle r="3.4" fill="#ff6b73" stroke="${LINE}" stroke-width="1.8"/></g>`; break; }
    }
    const nameTag = opt.name ? `<g transform="translate(0 16)"><rect x="-40" y="-11" width="80" height="20" rx="10" fill="#fff" opacity=".92"/><text y="4" text-anchor="middle" font-size="12" font-family="Jua, sans-serif" fill="${LINE}">${esc(sm.name || '눈사람')}</text></g>` : '';
    return `<ellipse cy="2" rx="${rB * 1.05}" ry="${rB * 0.2}" fill="#9fb4d6" opacity=".35"/>${arms}${body}${buttons}${scarf}${eyes}${nose}${mouth}${blush}${hat}${nameTag}`;
  }
  const snowmanSVG = (sm, opt = {}) => `<svg viewBox="-75 -265 150 ${opt.name ? 300 : 272}" xmlns="http://www.w3.org/2000/svg">${snowman(sm, opt)}</svg>`;

  window.Outdoor = { scene, doorArt, snowmanSVG, sledArt };

  // ───────── 눈사람 공방 창 ─────────
  const OPTS = {
    hat: [['none', '없음'], ['beanie', '털모자'], ['santa', '산타 모자'], ['top', '신사 모자'], ['bucket', '양동이'], ['muffs', '귀마개'], ['bow', '리본']],
    scarf: [['none', '없음'], ['red', '빨강'], ['green', '초록'], ['blue', '파랑'], ['pink', '분홍'], ['stripe', '줄무늬']],
    eyes: [['coal', '석탄 눈'], ['sparkle', '반짝 눈'], ['happy', '웃는 눈'], ['sleepy', '졸린 눈'], ['wink', '윙크']],
    nose: [['carrot', '당근'], ['round', '동그란 코'], ['button', '빨간 코']],
    mouth: [['smile', '미소'], ['coal', '석탄 미소'], ['open', '앙'], ['cat', '고양이 입'], ['tongue', '메롱']],
    arms: [['twig', '나뭇가지'], ['mitten', '벙어리장갑'], ['none', '없음']],
    buttons: [['coal', '석탄 단추'], ['color', '알록달록'], ['none', '없음']],
  };
  const DECO_TABS = [['hat', '모자'], ['scarf', '목도리'], ['face', '얼굴'], ['body', '팔 · 단추']];
  const MIN = [34, 24, 18], MAX = [52, 40, 30], START = [14, 10, 8];

  window.SnowmanUI = function (api) {
    const $ = (s) => document.querySelector(s);
    let open = false, step = 'roll', cur = 0, dtab = 'hat', editing = false;
    let sm = null;
    const fresh = () => ({ lv: 3, sz: START.slice(), hat: 'beanie', scarf: 'red', eyes: 'coal', nose: 'carrot', mouth: 'smile', arms: 'twig', buttons: 'coal', blush: true, name: '' });
    const balls = () => (sm.lv === 3 ? [0, 1, 2] : [0, 2]);

    function preview() {
      if (step !== 'roll') return snowmanSVG(sm);
      // 굴리는 중: 지금까지 만든 공만 쌓아서 보여줘요
      const idx = balls(), upto = idx.slice(0, idx.indexOf(cur) + 1);
      const rB = sm.sz[0], rM = sm.lv === 3 ? sm.sz[1] : 0, rH = sm.sz[2];
      const yB = -rB, yM = yB - rB * 0.82 - rM * 0.82;
      const yH = sm.lv === 3 ? yM - rM * 0.85 - rH * 0.85 : yB - rB * 0.84 - rH * 0.84;
      const Y = { 0: [yB, rB], 1: [yM, rM], 2: [yH, rH] };
      const ball = (k) => { const [y, r] = Y[k]; return `<g class="sm-ball ${k === cur ? 'sm-spin' : ''}" style="transform-origin:0px ${y}px"><circle cy="${y}" r="${r}" fill="#fff" stroke="${LINE}" stroke-width="2.6"/>
        <path d="M${-r * 0.45} ${y - r * 0.3} q${r * 0.2} -${r * 0.16} ${r * 0.42} 0 M${r * 0.05} ${y + r * 0.38} q${r * 0.2} -${r * 0.13} ${r * 0.38} 0" stroke="#d9e4f4" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>`; };
      return `<svg viewBox="-75 -265 150 272" xmlns="http://www.w3.org/2000/svg"><ellipse cy="2" rx="${rB * 1.05}" ry="${rB * 0.2}" fill="#9fb4d6" opacity=".35"/>${upto.map(ball).join('')}</svg>`;
    }
    function render() {
      if (!open) return;
      $('#snowView').innerHTML = preview();
      const panel = $('#snowPanel');
      const stepsHtml = `<div class="cake-steps">${[['roll', '눈 굴리기'], ['deco', '꾸미기'], ['name', '이름 · 세우기']].map(([k, n], i, arr) => {
        const ci = arr.findIndex(([kk]) => kk === step);
        return `<span class="cstep ${i < ci ? 'done' : i === ci ? 'now' : ''}"><b>${i < ci ? '✓' : i + 1}</b>${n}</span>`;
      }).join('')}</div>`;
      $('#snowSteps').innerHTML = stepsHtml;
      if (step === 'roll') {
        const names = { 0: '아래 몸통', 1: '가운데 몸통', 2: '머리' };
        const v = sm.sz[cur], ok = v >= MIN[cur];
        panel.innerHTML = `<div class="crow sm-lv"><button class="btn ghost small ${sm.lv === 3 ? 'on' : ''}" data-lv="3">3단 눈사람</button><button class="btn ghost small ${sm.lv === 2 ? 'on' : ''}" data-lv="2">2단 눈사람</button></div>
          <p class="chint">버튼을 <b>톡톡톡</b> 눌러서 <b>${names[cur]}</b>을(를) 굴려요. 많이 누를수록 커져요!</p>
          <div class="cprog"><i style="width:${Math.round((v - START[cur]) / (MAX[cur] - START[cur]) * 100)}%"></i><span>${v >= MAX[cur] ? '최대!' : ok ? '좋아요! 더 키워도 돼요' : '조금 더!'}</span></div>
          <button class="btn primary cnext sm-rollbtn" data-act="roll">❄️ 톡톡 굴리기</button>
          <button class="btn ghost" data-act="nextball" ${ok ? '' : 'disabled'}>${cur === 2 ? '다 굴렸어요! 꾸미러 가기 ▶' : '다음 공 굴리기 ▶'}</button>
          ${editing ? '<button class="btn ghost small" data-act="skip">공 크기는 그대로 두기 ▶</button>' : ''}`;
        return;
      }
      if (step === 'deco') {
        const grid = (k) => `<div class="cbtns sm-opts">${OPTS[k].map(([v, n]) => `<button class="cbtn sm ${sm[k] === v ? 'on' : ''}" data-k="${k}" data-v="${v}"><small>${n}</small></button>`).join('')}</div>`;
        let body = '';
        if (dtab === 'hat') body = grid('hat');
        else if (dtab === 'scarf') body = grid('scarf');
        else if (dtab === 'face') body = `<p class="clabel-sm">눈</p>${grid('eyes')}<p class="clabel-sm">코</p>${grid('nose')}<p class="clabel-sm">입</p>${grid('mouth')}
          <label class="ganon"><input type="checkbox" id="smBlush" ${sm.blush ? 'checked' : ''}> 발그레 볼터치</label>`;
        else body = `<p class="clabel-sm">팔</p>${grid('arms')}<p class="clabel-sm">단추</p>${grid('buttons')}`;
        panel.innerHTML = `<div class="ktabs sm-tabs">${DECO_TABS.map(([k, n]) => `<button data-dtab="${k}" class="${dtab === k ? 'on' : ''}">${n}</button>`).join('')}</div>
          ${body}
          <div class="crow"><button class="btn ghost" data-act="toroll">◀ 다시 굴리기</button><button class="btn primary cnext" data-act="toname">다 꾸몄어요 ▶</button></div>`;
        const bl = $('#smBlush'); if (bl) bl.addEventListener('change', (e) => { sm.blush = e.target.checked; $('#snowView').innerHTML = preview(); });
        return;
      }
      panel.innerHTML = `<p class="chint">눈사람 이름을 지어 줘요 ⛄</p>
        <input id="smName" class="wish-input sm-name" maxlength="10" placeholder="예) 눈송이" value="${esc(sm.name)}">
        <p class="chint small">한 사람당 눈사람 하나를 눈마당에 세울 수 있어요. 다시 만들면 내 눈사람이 바뀌어요</p>
        <div class="crow"><button class="btn ghost" data-act="todeco">◀ 꾸미기</button><button class="btn primary cnext" data-act="build">⛄ ${editing ? '고쳐 세우기' : '눈마당에 세우기'}</button></div>
        ${editing ? '<button class="btn ghost small sm-melt" data-act="melt">내 눈사람 녹이기</button>' : ''}`;
      $('#smName').addEventListener('input', (e) => { sm.name = e.target.value; });
    }
    let meltArmed = 0;
    $('#snowPanel').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      if (b.dataset.lv) { sm.lv = Number(b.dataset.lv); if (cur === 1 && sm.lv === 2) cur = 0; render(); return; }
      if (b.dataset.dtab) { dtab = b.dataset.dtab; render(); return; }
      if (b.dataset.k) { sm[b.dataset.k] = b.dataset.v; api.Sound.Sfx.pop(); render(); return; }
      switch (b.dataset.act) {
        case 'roll': {
          if (sm.sz[cur] >= MAX[cur]) { api.Sound.Sfx.pop(); return; }
          sm.sz[cur] = Math.min(MAX[cur], sm.sz[cur] + 1.6);
          api.Sound.Sfx.plop();
          render();
          const sp2 = $('#snowView .sm-spin'); if (sp2) sp2.classList.add('go');
          break;
        }
        case 'nextball': {
          const idx = balls(), i = idx.indexOf(cur);
          api.Sound.Sfx.ding();
          if (i < idx.length - 1) cur = idx[i + 1]; else step = 'deco';
          render(); break;
        }
        case 'skip': step = 'deco'; render(); break;
        case 'toroll': step = 'roll'; cur = balls()[0]; render(); break;
        case 'toname': step = 'name'; render(); break;
        case 'todeco': step = 'deco'; render(); break;
        case 'build': {
          const out = { ...sm, sz: sm.sz.map((v, i) => Math.max(MIN[i], Math.round(v))), name: (sm.name || '').trim() || '눈사람' };
          api.send({ t: 'snowman', act: 'build', sm: out });
          api.Sound.Sfx.tada();
          api.close();
          break;
        }
        case 'melt': {
          const now = Date.now();
          if (now - meltArmed > 1500) { meltArmed = now; api.toast('한 번 더 누르면 내 눈사람이 녹아요 💧'); return; }
          api.send({ t: 'snowman', act: 'del' }); api.close(); break;
        }
      }
    });
    document.querySelectorAll('[data-close-snow]').forEach((b) => b.addEventListener('click', () => api.close()));
    return {
      setOpen(v, existing) {
        open = v;
        if (v) {
          editing = !!existing;
          sm = existing ? { ...fresh(), ...existing, sz: existing.sz.slice() } : fresh();
          step = existing ? 'deco' : 'roll'; cur = 0; dtab = 'hat';
        }
        render();
      },
    };
  };

  // ───────── 🛷 썰매 경주 창 ─────────
  window.RaceUI = function (api) {
    const $ = (s) => document.querySelector(s);
    let open = false, race = { stage: 'idle', racers: [], bets: {}, results: [] }, cdEnd = 0, cdTimer = null;
    const myUid = () => api.myUid();
    const meRacer = () => race.racers.find((r) => r.uid === myUid());
    const LANE_COL = ['#e8474f', '#5b9cf0', '#3f9c6d', '#f2c14e', '#a487e8', '#ff9db5'];

    function track() {
      const rs = race.racers;
      const lanes = rs.length ? rs.map((r, i) => `
        <div class="rlane ${r.uid === myUid() ? 'me' : ''}">
          <span class="rname">${esc(r.nick)}${r.place ? ` <b>${r.place}등</b>` : ''}</span>
          <div class="rsled" data-uid="${esc(r.uid)}" style="left:calc(${(Math.min(100, r.pos) * 0.84).toFixed(1)}% + 4px)">
            <div class="rrider">${api.avatarSVG(r.avatar)}</div>
            <svg class="rsledsvg" viewBox="-40 -14 80 24">${sledArt(0, 0, 1, LANE_COL[i % 6])}</svg>
            ${race.stage === 'run' && !r.place ? '<i class="rspray"></i>' : ''}
          </div>
        </div>`).join('') : '<p class="rempty">아직 썰매에 탄 사람이 없어요</p>';
      const cd = race.stage === 'count' ? `<div class="rcount" id="raceCount"></div>` : '';
      return `<div class="rtrack ${race.stage === 'run' ? 'running' : ''}"><div class="rfinish"></div>${lanes}${cd}</div>`;
    }
    function panel() {
      const me = meRacer(), uid = myUid(), host = race.host === uid;
      const myBet = race.bets[uid];
      const betCount = (u) => Object.values(race.bets).filter((v) => v === u).length;
      switch (race.stage) {
        case 'idle': return `<p class="chint big">🛷 누가 먼저 결승선에 도착할까요?</p>
          <p class="chint">경주를 열면 친구들이 같이 달리거나, 1등을 맞히는 내기를 할 수 있어요. 출발하면 버튼을 <b>연타</b>!</p>
          <button class="btn primary cnext" data-act="open">🛷 썰매 경주 열기</button>`;
        case 'lobby': return `<p class="chint">${host ? '👑 내가 연 경주예요. 다 모이면 출발!' : '썰매에 타거나 1등을 맞혀 봐요'}</p>
          ${me ? `<button class="btn ghost small" data-act="leave">썰매에서 내리기</button>` : `<button class="btn primary" data-act="join" ${race.racers.length >= 6 ? 'disabled' : ''}>🛷 나도 달리기</button>`}
          ${!me && race.racers.length ? `<p class="clabel-sm">🎯 1등 맞히기 (맞히면 황금 마시멜로!)</p>
            <div class="rbets">${race.racers.map((r) => `<button class="cbtn sm ${myBet === r.uid ? 'on' : ''}" data-bet="${esc(r.uid)}"><small>${esc(r.nick)}</small><small class="rbc">${betCount(r.uid) ? `🎯 ${betCount(r.uid)}` : ''}</small></button>`).join('')}</div>` : ''}
          ${host ? `<button class="btn primary cnext" data-act="start">🏁 출발!</button>` : `<p class="chint small">👑 방장이 출발 버튼을 눌러요</p>`}
          <p class="chint small">1등에게는 황금 마시멜로를 줘요 (2명 이상 달릴 때)</p>`;
        case 'count': return `<p class="chint big">준비… ${me ? '버튼에 손가락 올려요! 👆' : ''}</p>${me ? '<button class="btn primary cnext rtap" disabled>연타!</button>' : ''}`;
        case 'run':
          if (me && !me.place) return `<button class="btn primary cnext rtap" data-act="tap">🛷 연타! 연타!</button><p class="chint small">PC는 스페이스바도 돼요</p>`;
          if (me) return `<p class="chint big">🏁 ${me.place}등으로 들어왔어요!</p><p class="chint">다른 친구들을 기다려요…</p>`;
          return `<p class="chint big">📣 응원 중!</p>${myBet ? `<p class="chint">내가 찍은 사람: <b>${esc((race.racers.find((r) => r.uid === myBet) || {}).nick || '')}</b></p>` : ''}`;
        case 'done': {
          const res = race.results || [];
          const win = res[0];
          const right = win ? Object.entries(race.bets).filter(([, v]) => v === win.uid).map(([k]) => k) : [];
          return `<div class="rpodium">${res.slice(0, 3).map((r) => `<div class="rp p${r.place}"><b>${['🥇', '🥈', '🥉'][r.place - 1]}</b><span>${esc(r.nick)}</span></div>`).join('')}</div>
            ${res.length > 3 ? `<p class="chint small">${res.slice(3).map((r) => `${r.place}등 ${esc(r.nick)}`).join(' · ')}</p>` : ''}
            ${Object.keys(race.bets).length ? `<p class="chint">${right.includes(uid) ? '🎯 내기 성공! 황금 마시멜로 받았어요' : race.bets[uid] ? '😢 아쉽게 못 맞혔어요' : `🎯 1등을 맞힌 사람 ${right.length}명`}</p>` : ''}
            <button class="btn primary cnext" data-act="open">🛷 한 판 더!</button>`;
        }
      }
      return '';
    }
    function render() {
      if (!open) return;
      $('#raceView').innerHTML = track();
      $('#racePanel').innerHTML = panel();
      tickCount();
    }
    function renderTrackOnly() {
      // 달리는 중에는 썰매 위치만 바꿔서 버튼이 깜빡이지 않게
      if (!open) return;
      for (const r of race.racers) {
        const el = $(`#raceView .rsled[data-uid="${CSS.escape(r.uid)}"]`);
        if (!el) return render();
        el.style.left = `calc(${(Math.min(100, r.pos) * 0.84).toFixed(1)}% + 4px)`;
        if (r.place) { const n = el.parentElement.querySelector('.rname'); if (n && !n.querySelector('b')) n.innerHTML += ` <b>${r.place}등</b>`; const sp = el.querySelector('.rspray'); if (sp) sp.remove(); }
      }
    }
    function tickCount() {
      clearInterval(cdTimer);
      if (race.stage !== 'count') return;
      const draw = () => {
        const el = $('#raceCount'); if (!el) return;
        const left = Math.ceil((cdEnd - Date.now()) / 1000);
        const txt = left > 0 ? String(left) : '출발!';
        if (el.textContent !== txt) { el.textContent = txt; el.classList.remove('pop2'); void el.offsetWidth; el.classList.add('pop2'); api.Sound.Sfx[left > 0 ? 'pop' : 'ding'](); }
      };
      draw(); cdTimer = setInterval(draw, 100);
    }
    function tap() {
      const me = meRacer();
      if (race.stage !== 'run' || !me || me.place) return;
      api.send({ t: 'race', act: 'tap' });
      if (Math.random() < 0.5) api.Sound.Sfx.tick();
      const b = $('#racePanel .rtap'); if (b) { b.classList.remove('hit'); void b.offsetWidth; b.classList.add('hit'); }
    }
    $('#racePanel').addEventListener('pointerdown', (e) => {
      const b = e.target.closest('[data-act=tap]');
      if (b) { e.preventDefault(); tap(); }
    });
    $('#racePanel').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      if (b.dataset.bet) { api.send({ t: 'race', act: 'bet', uid: b.dataset.bet }); api.Sound.Sfx.pop(); return; }
      const a = b.dataset.act;
      if (a && a !== 'tap') { api.send({ t: 'race', act: a }); if (a === 'join') api.Sound.Sfx.jump(); }
    });
    window.addEventListener('keydown', (e) => {
      if (!open || e.repeat) return;
      if (e.code !== 'Space' && e.key !== ' ') return;
      if (document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
      e.preventDefault(); tap();
    });
    document.querySelectorAll('[data-close-race]').forEach((b) => b.addEventListener('click', () => api.close()));

    return {
      setRace(r) {
        const prev = race;
        race = r || race;
        if (race.stage === 'count') cdEnd = Date.now() + (race.cd || 0);
        if (prev.stage === 'run' && race.stage === 'run' && prev.racers.length === race.racers.length && !prev.racers.some((x, i) => x.uid !== race.racers[i].uid)) renderTrackOnly();
        else render();
        if (prev.stage !== 'done' && race.stage === 'done') api.Sound.Sfx.tada();
      },
      setOpen(v) { open = v; if (!v) clearInterval(cdTimer); render(); },
      get race() { return race; },
    };
  };
})();
