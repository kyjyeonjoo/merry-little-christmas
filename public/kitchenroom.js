// 🍳 주방 방: 풍경 · 냉장고/찬장 뒤적이기 · 요리하기
(function () {
  const L = '#5b4036';
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const INGR = {
    egg: ['달걀', `<ellipse cy="2" rx="13" ry="16" fill="#fffaf2" stroke="${L}" stroke-width="2.4"/><ellipse cx="-4" cy="-4" rx="3" ry="5" fill="#fff" opacity=".9"/>`],
    milk: ['우유', `<path d="M-11 -10 L-11 18 L11 18 L11 -10 L5 -18 L-5 -18 Z" fill="#fff" stroke="${L}" stroke-width="2.4" stroke-linejoin="round"/><rect x="-11" y="0" width="22" height="9" fill="#5b8def"/><path d="M-5 -18 L-5 -22 L5 -22 L5 -18" fill="#fff" stroke="${L}" stroke-width="2"/>`],
    butter: ['버터', `<path d="M-16 4 L-10 -8 L16 -8 L10 4 Z" fill="#fff3a0" stroke="${L}" stroke-width="2.2" stroke-linejoin="round"/><rect x="-16" y="4" width="26" height="10" fill="#ffe066" stroke="${L}" stroke-width="2.2"/><path d="M10 4 L16 -8 L16 2 L10 14 Z" fill="#f5cf3a" stroke="${L}" stroke-width="2.2" stroke-linejoin="round"/>`],
    cheese: ['치즈', `<path d="M-16 10 L-16 -2 L14 -14 L16 10 Z" fill="#ffd34d" stroke="${L}" stroke-width="2.4" stroke-linejoin="round"/><circle cx="-6" cy="4" r="3" fill="#f2b230"/><circle cx="6" cy="-2" r="2.4" fill="#f2b230"/><circle cx="8" cy="6" r="2" fill="#f2b230"/>`],
    tomato: ['토마토', `<circle cy="3" r="14" fill="#e8474f" stroke="${L}" stroke-width="2.4"/><path d="M-7 -10 L0 -7 L7 -10 L3 -12 L0 -16 L-3 -12 Z" fill="#3f9c6d" stroke="${L}" stroke-width="1.6" stroke-linejoin="round"/><ellipse cx="-5" cy="-1" rx="3" ry="4" fill="#fff" opacity=".5"/>`],
    lettuce: ['양상추', `<path d="M-15 8 Q-18 -10 -4 -14 Q8 -18 14 -6 Q20 6 8 14 Q-6 18 -15 8 Z" fill="#8fd17a" stroke="${L}" stroke-width="2.4"/><path d="M-6 10 Q0 -2 4 -12 M0 2 l8 -4 M-2 6 l-8 -4" stroke="#5aa96f" stroke-width="2" fill="none"/>`],
    strawberry: ['딸기', `<path d="M0 16 Q-16 4 -12 -6 Q-6 -12 0 -9 Q6 -12 12 -6 Q16 4 0 16 Z" fill="#e8474f" stroke="${L}" stroke-width="2.4"/><path d="M-8 -9 L0 -6 L8 -9 L4 -12 L0 -16 L-4 -12 Z" fill="#3f9c6d" stroke="${L}" stroke-width="1.4"/>${[[-5, -1], [4, -2], [0, 5], [-4, 8], [5, 7]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="#ffe066"/>`).join('')}`],
    tangerine: ['귤', `<circle cy="3" r="14" fill="#ffa53d" stroke="${L}" stroke-width="2.4"/><path d="M0 -11 q4 -6 9 -4 q-2 5 -9 4" fill="#3f9c6d" stroke="${L}" stroke-width="1.4"/><circle cx="-5" cy="-1" r="2.4" fill="#fff" opacity=".5"/>`],
    chicken: ['닭고기', `<path d="M-14 6 Q-18 -10 -4 -14 Q10 -16 12 -2 Q12 10 0 12 Q-10 14 -14 6 Z" fill="#ffc9a8" stroke="${L}" stroke-width="2.4"/><path d="M8 4 L16 12" stroke="#fff4e0" stroke-width="5" stroke-linecap="round"/><circle cx="17" cy="13" r="3.4" fill="#fff4e0" stroke="${L}" stroke-width="1.6"/>`],
    sausage: ['소시지', `<rect x="-17" y="-6" width="34" height="13" rx="6.5" fill="#d9614a" stroke="${L}" stroke-width="2.4" transform="rotate(-15)"/><path d="M-8 -4 l2 4 M0 -6 l2 4 M8 -8 l2 4" stroke="#b5432f" stroke-width="1.6" transform="rotate(-15)"/>`],
    flour: ['밀가루', `<path d="M-13 -12 L13 -12 L15 16 L-15 16 Z" fill="#f5efe4" stroke="${L}" stroke-width="2.4" stroke-linejoin="round"/><path d="M-13 -12 Q0 -20 13 -12" fill="#f5efe4" stroke="${L}" stroke-width="2"/><rect x="-9" y="-2" width="18" height="10" rx="2" fill="#ffd56b"/>`],
    sugar: ['설탕', `<rect x="-12" y="-14" width="24" height="30" rx="4" fill="#ffd6e0" stroke="${L}" stroke-width="2.4"/><rect x="-7" y="-7" width="6" height="6" fill="#fff" stroke="${L}" stroke-width="1.2"/><rect x="1" y="-3" width="6" height="6" fill="#fff" stroke="${L}" stroke-width="1.2"/><rect x="-4" y="5" width="6" height="6" fill="#fff" stroke="${L}" stroke-width="1.2"/>`],
    noodle: ['라면사리', `<rect x="-15" y="-12" width="30" height="26" rx="5" fill="#ffe08a" stroke="${L}" stroke-width="2.4"/>${[-6, 0, 6].map((y) => `<path d="M-11 ${y} q3 -3 6 0 q3 3 6 0 q3 -3 6 0 q3 3 4 0" stroke="#e8b84a" stroke-width="2" fill="none"/>`).join('')}`],
    rice: ['밥', `<path d="M-15 0 Q-14 16 0 16 Q14 16 15 0 Z" fill="#fff" stroke="${L}" stroke-width="2.4"/><path d="M-14 0 Q-10 -14 0 -14 Q10 -14 14 0 Z" fill="#fffdf6" stroke="${L}" stroke-width="2.2"/><path d="M-15 4 Q0 10 15 4" stroke="#5b8def" stroke-width="3" fill="none"/>`],
    ricecake: ['떡', `${[[-8, 2, -20], [5, -4, 25], [4, 8, -5]].map(([x, y, a]) => `<rect x="${x - 10}" y="${y - 4}" width="20" height="8" rx="4" fill="#fff6ee" stroke="${L}" stroke-width="2" transform="rotate(${a} ${x} ${y})"/>`).join('')}`],
    bread: ['식빵', `<path d="M-14 14 L-14 -4 Q-18 -16 -4 -16 Q0 -20 6 -16 Q18 -16 14 -4 L14 14 Z" fill="#e8b46a" stroke="${L}" stroke-width="2.4"/><path d="M-9 10 L-9 -4 Q-11 -11 -2 -11 Q3 -13 6 -11 Q12 -11 9 -4 L9 10 Z" fill="#fde7b8"/>`],
    gochujang: ['고추장', `<rect x="-13" y="-8" width="26" height="24" rx="5" fill="#d23b44" stroke="${L}" stroke-width="2.4"/><rect x="-14" y="-14" width="28" height="8" rx="3" fill="#3f9c6d" stroke="${L}" stroke-width="2.2"/><circle cy="4" r="5" fill="#fff" opacity=".85"/><path d="M-2 4 q2 -4 4 0" stroke="#d23b44" stroke-width="1.6" fill="none"/>`],
  };
  const ingrIcon = (k, size = '') => `<svg class="ingr-ic ${size}" viewBox="-20 -22 40 42" xmlns="http://www.w3.org/2000/svg">${(INGR[k] || ['', ''])[1]}</svg>`;
  const ingrName = (k) => (INGR[k] || [k])[0];
  const RECIPES = {
    pancake: ['flour', 'egg', 'milk', 'butter'], pizza: ['flour', 'cheese', 'tomato', 'sausage'], chicken: ['chicken', 'flour', 'egg'],
    ramen: ['noodle', 'egg'], omelet: ['rice', 'egg', 'tomato'], cupcake: ['flour', 'sugar', 'egg', 'strawberry'],
    salad: ['lettuce', 'tomato'], toast: ['bread', 'egg', 'milk', 'sugar'], tteok: ['ricecake', 'gochujang'], fruit: ['strawberry', 'tangerine'],
  };
  const OVEN = new Set(['pizza', 'cupcake']), NOFIRE = new Set(['salad', 'fruit']);

  // ───────── 주방 풍경 (1000 × 620) ─────────
  function scene() {
    const tiles = [];
    for (let y = 196; y < 340; y += 24) for (let x = (y / 24) % 2 ? 0 : -24; x < 1000; x += 48) tiles.push(`<rect x="${x}" y="${y}" width="46" height="22" rx="3" fill="#e6f4ee"/>`);
    return `<svg class="kit-scene" viewBox="0 0 1000 620" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="1000" height="200" fill="#fff4e3"/>
      <path d="M0 0 H1000 V14 H0 Z" fill="#f3dcc0"/>
      ${Array.from({ length: 21 }, (_, i) => `<path d="M${i * 50} 14 q25 22 50 0" fill="#ffd6e0" stroke="#f0b8c6" stroke-width="2"/>`).join('')}
      <rect y="196" width="1000" height="144" fill="#cfe9df"/>${tiles.join('')}
      <rect y="338" width="1000" height="282" fill="#f2d7b6"/>
      ${Array.from({ length: 11 }, (_, i) => `<path d="M0 ${360 + i * 26} H1000" stroke="#e6c59f" stroke-width="2"/>`).join('')}
      ${Array.from({ length: 30 }, (_, i) => `<path d="M${(i * 97) % 1000} ${360 + (i % 10) * 26} v26" stroke="#e6c59f" stroke-width="2"/>`).join('')}
      <!-- 창문 -->
      <rect x="400" y="46" width="200" height="130" rx="14" fill="#2c3e6e" stroke="#fff" stroke-width="10"/>
      <path d="M500 46 V176 M400 112 H600" stroke="#fff" stroke-width="6"/>
      ${[[425, 70], [470, 98], [540, 66], [575, 130], [440, 150], [520, 140]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#fff"/>`).join('')}
      <path d="M392 50 Q440 96 410 186 L390 186 Z M608 50 Q560 96 590 186 L610 186 Z" fill="#ff9db5" stroke="#e8798f" stroke-width="2"/>
      <rect x="392" y="176" width="216" height="12" rx="4" fill="#fff" stroke="#e6c59f" stroke-width="2"/>
      <g transform="translate(470 168)"><path d="M-10 0 L-8 8 L8 8 L10 0 Z" fill="#c98a5e" stroke="${L}" stroke-width="1.6"/><path d="M0 0 Q-8 -12 -2 -16 M0 0 Q6 -14 10 -10 M0 0 Q0 -12 2 -18" stroke="#3f9c6d" stroke-width="3" fill="none"/></g>
      <!-- 선반 -->
      <rect x="640" y="104" width="190" height="10" rx="3" fill="#c98a5e" stroke="${L}" stroke-width="2"/>
      ${[[660, '#e8474f'], [690, '#ffd34d'], [722, '#8fd17a'], [756, '#ff9db5'], [792, '#5b8def']].map(([x, c], i) => `<g transform="translate(${x} 104)"><rect x="-11" y="-${26 + (i % 2) * 6}" width="22" height="${26 + (i % 2) * 6}" rx="5" fill="#fff" stroke="${L}" stroke-width="1.8" opacity=".95"/><rect x="-9" y="-${18 + (i % 2) * 4}" width="18" height="${14 + (i % 2) * 4}" rx="3" fill="${c}"/><rect x="-12" y="-${30 + (i % 2) * 6}" width="24" height="6" rx="2" fill="#c98a5e"/></g>`).join('')}
      <!-- 걸려 있는 프라이팬 -->
      <path d="M440 0 V30 M480 0 V22" stroke="#8a95a8" stroke-width="2"/>
      <g transform="translate(440 52)"><circle r="18" fill="#4d5a6a" stroke="${L}" stroke-width="2"/><rect x="-3" y="-38" width="6" height="22" rx="3" fill="#8c5232"/></g>
      <!-- 문 (거실로) -->
      <g transform="translate(910 340)"><path d="M-46 0 V-150 Q-46 -170 -26 -170 H26 Q46 -170 46 -150 V0 Z" fill="#c98a5e" stroke="${L}" stroke-width="3"/>
        <path d="M-38 0 V-146 Q-38 -162 -22 -162 H22 Q38 -162 38 -146 V0" fill="#ffe7c2" stroke="${L}" stroke-width="2"/>
        <path d="M-30 -60 V-140 M0 -60 V-150 M30 -60 V-140" stroke="#e6c59f" stroke-width="3"/>
        <g transform="translate(0 -100)"><rect x="-32" y="-12" width="64" height="22" rx="6" fill="#fffaf2" stroke="${L}" stroke-width="2"/><text y="4" text-anchor="middle" font-size="12" font-family="Jua, sans-serif" fill="${L}">◂ 거실</text></g></g>
    </svg>`;
  }
  function fridgeSVG(open = false) {
    return `<svg viewBox="-70 -262 140 266" xmlns="http://www.w3.org/2000/svg">
      <ellipse cy="0" rx="62" ry="6" fill="#000" opacity=".1"/>
      <rect x="-56" y="-256" width="112" height="252" rx="16" fill="#f4f9ff" stroke="${L}" stroke-width="3"/>
      <path d="M-56 -168 H56" stroke="${L}" stroke-width="2.6"/>
      ${open ? `<rect x="-50" y="-162" width="100" height="150" rx="8" fill="#e8f2ff"/>
        <path d="M-50 -112 H50 M-50 -62 H50" stroke="#c4d4ec" stroke-width="3"/>
        <circle cx="-26" cy="-124" r="9" fill="#e8474f"/><rect x="0" y="-136" width="16" height="24" rx="3" fill="#fff" stroke="#c4d4ec" stroke-width="1.6"/><ellipse cx="-22" cy="-72" rx="8" ry="10" fill="#fffaf2" stroke="#c4d4ec"/><rect x="10" y="-80" width="26" height="14" rx="4" fill="#ffd34d"/>
        <path d="M50 -164 L92 -152 L92 -2 L50 -12 Z" fill="#f4f9ff" stroke="${L}" stroke-width="3"/>` : `<rect x="34" y="-150" width="8" height="54" rx="4" fill="#c4d4ec" stroke="${L}" stroke-width="1.8"/>`}
      <rect x="34" y="-236" width="8" height="46" rx="4" fill="#c4d4ec" stroke="${L}" stroke-width="1.8"/>
      <circle cx="-30" cy="-220" r="8" fill="#ff9db5" stroke="${L}" stroke-width="1.6"/><rect x="-14" y="-232" width="20" height="16" rx="2" fill="#ffd34d" stroke="${L}" stroke-width="1.6" transform="rotate(-8 -4 -224)"/>
      <circle cx="-38" cy="-140" r="6" fill="#8fd17a" stroke="${L}" stroke-width="1.4"/>
      <g transform="translate(-6 -192)"><rect x="-26" y="-11" width="52" height="20" rx="6" fill="#fffaf2" stroke="${L}" stroke-width="1.8"/><text y="4" text-anchor="middle" font-size="11" font-family="Jua, sans-serif" fill="${L}">냉장고</text></g>
    </svg>`;
  }
  function pantrySVG(open = false) {
    return `<svg viewBox="-80 -190 160 194" xmlns="http://www.w3.org/2000/svg">
      <ellipse cy="0" rx="72" ry="6" fill="#000" opacity=".1"/>
      <rect x="-70" y="-182" width="140" height="178" rx="10" fill="#c98a5e" stroke="${L}" stroke-width="3"/>
      ${open ? `<rect x="-62" y="-174" width="124" height="162" rx="6" fill="#8c5a3c"/>
        <path d="M-62 -120 H62 M-62 -66 H62" stroke="#c98a5e" stroke-width="5"/>
        <rect x="-50" y="-160" width="22" height="36" rx="4" fill="#f5efe4"/><rect x="-20" y="-150" width="20" height="26" rx="4" fill="#ffd6e0"/><rect x="10" y="-158" width="30" height="34" rx="5" fill="#ffe08a"/>
        <rect x="-50" y="-104" width="30" height="34" rx="5" fill="#d23b44"/><rect x="-10" y="-100" width="40" height="30" rx="6" fill="#e8b46a"/>
        <path d="M-62 -174 L-98 -164 L-98 -2 L-62 -12 Z M62 -174 L98 -164 L98 -2 L62 -12 Z" fill="#c98a5e" stroke="${L}" stroke-width="3"/>`
        : `<path d="M0 -182 V-4" stroke="${L}" stroke-width="2.6"/>
        <rect x="-60" y="-172" width="52" height="74" rx="6" fill="none" stroke="#a96b44" stroke-width="2.4"/><rect x="8" y="-172" width="52" height="74" rx="6" fill="none" stroke="#a96b44" stroke-width="2.4"/>
        <rect x="-60" y="-88" width="52" height="74" rx="6" fill="none" stroke="#a96b44" stroke-width="2.4"/><rect x="8" y="-88" width="52" height="74" rx="6" fill="none" stroke="#a96b44" stroke-width="2.4"/>
        <circle cx="-12" cy="-96" r="4" fill="#ffd34d" stroke="${L}" stroke-width="1.4"/><circle cx="12" cy="-96" r="4" fill="#ffd34d" stroke="${L}" stroke-width="1.4"/>`}
      <g transform="translate(0 -194)"><rect x="-26" y="-11" width="52" height="20" rx="6" fill="#fffaf2" stroke="${L}" stroke-width="1.8"/><text y="4" text-anchor="middle" font-size="11" font-family="Jua, sans-serif" fill="${L}">찬장</text></g>
    </svg>`;
  }
  function stoveSVG() {
    return `<svg viewBox="-90 -168 180 172" xmlns="http://www.w3.org/2000/svg">
      <ellipse cy="0" rx="84" ry="6" fill="#000" opacity=".1"/>
      <rect x="-80" y="-120" width="160" height="116" rx="10" fill="#fffaf2" stroke="${L}" stroke-width="3"/>
      <rect x="-82" y="-130" width="164" height="16" rx="6" fill="#e8474f" stroke="${L}" stroke-width="2.6"/>
      <rect x="-62" y="-100" width="124" height="70" rx="10" fill="#3a3340" stroke="${L}" stroke-width="2.6"/><rect x="-54" y="-92" width="108" height="54" rx="8" fill="#ffb347" opacity=".35"/>
      <rect x="-40" y="-24" width="80" height="8" rx="4" fill="#c4d4ec" stroke="${L}" stroke-width="1.8"/>
      ${[-50, -20, 20, 50].map((x) => `<circle cx="${x}" cy="-110" r="4" fill="#fff" stroke="${L}" stroke-width="1.6"/>`).join('')}
      <ellipse cx="-36" cy="-132" rx="22" ry="5" fill="#4d5a6a"/><ellipse cx="36" cy="-132" rx="22" ry="5" fill="#4d5a6a"/>
      <g transform="translate(-36 -134)"><path d="M-20 0 Q-20 -24 0 -26 Q20 -24 20 0 Z" fill="#e8474f" stroke="${L}" stroke-width="2.4"/><rect x="-6" y="-32" width="12" height="7" rx="3" fill="#3a3340"/></g>
      <g transform="translate(36 -134)"><ellipse rx="20" ry="5" fill="#3a3340" stroke="${L}" stroke-width="2"/><rect x="18" y="-3" width="26" height="6" rx="3" fill="#8c5232"/></g>
      <g class="ksteam" fill="#fff" opacity=".8"><circle cx="-36" cy="-170" r="6"/><circle cx="-28" cy="-182" r="4"/></g>
      <g transform="translate(0 -150)"><rect x="-30" y="-11" width="60" height="20" rx="6" fill="#fffaf2" stroke="${L}" stroke-width="1.8"/><text y="4" text-anchor="middle" font-size="11" font-family="Jua, sans-serif" fill="${L}">요리하기</text></g>
    </svg>`;
  }
  function counterSVG() {
    return `<svg viewBox="-80 -150 160 154" xmlns="http://www.w3.org/2000/svg">
      <ellipse cy="0" rx="74" ry="6" fill="#000" opacity=".1"/>
      <rect x="-70" y="-84" width="140" height="80" rx="8" fill="#8fd1b8" stroke="${L}" stroke-width="3"/>
      <rect x="-76" y="-94" width="152" height="14" rx="5" fill="#f3dcc0" stroke="${L}" stroke-width="2.6"/>
      <rect x="-60" y="-72" width="56" height="60" rx="6" fill="none" stroke="#5fae90" stroke-width="2.4"/><rect x="4" y="-72" width="56" height="60" rx="6" fill="none" stroke="#5fae90" stroke-width="2.4"/>
      <g transform="translate(-34 -94)"><path d="M-16 0 Q-18 -26 0 -28 Q18 -26 16 0 Z" fill="#fff" stroke="${L}" stroke-width="2.4"/><path d="M16 -18 Q28 -18 26 -6" stroke="${L}" stroke-width="2.4" fill="none"/><path d="M-16 -16 L-28 -24" stroke="${L}" stroke-width="3" stroke-linecap="round"/><rect x="-5" y="-33" width="10" height="6" rx="3" fill="#e8474f"/></g>
      ${[[10, '#e8474f'], [34, '#5b8def'], [58, '#ffd34d']].map(([x, c]) => `<g transform="translate(${x - 4} -94)"><rect x="-9" y="-18" width="18" height="18" rx="3" fill="${c}" stroke="${L}" stroke-width="2"/><path d="M9 -13 Q15 -13 14 -6 Q13 -2 9 -3" stroke="${L}" stroke-width="2" fill="none"/></g>`).join('')}
      <g transform="translate(0 -128)"><rect x="-34" y="-11" width="68" height="20" rx="6" fill="#fffaf2" stroke="${L}" stroke-width="1.8"/><text y="4" text-anchor="middle" font-size="11" font-family="Jua, sans-serif" fill="${L}">핫초코 · 마시멜로</text></g>
    </svg>`;
  }
  function tableSVG() {
    return `<svg viewBox="-110 -76 220 80" xmlns="http://www.w3.org/2000/svg">
      <ellipse cy="0" rx="100" ry="7" fill="#000" opacity=".1"/>
      <path d="M-80 -30 L-80 0 M80 -30 L80 0 M-60 -30 L-60 -4 M60 -30 L60 -4" stroke="#8c5232" stroke-width="6" stroke-linecap="round"/>
      <ellipse cy="-40" rx="100" ry="24" fill="#c98a5e" stroke="${L}" stroke-width="3"/>
      <ellipse cy="-44" rx="92" ry="18" fill="#fff" stroke="#f0b8c6" stroke-width="2"/>
      <path d="M-92 -44 Q0 -10 92 -44" stroke="#ff9db5" stroke-width="3" fill="none" stroke-dasharray="8 6"/>
      <g transform="translate(0 -52)"><path d="M-10 0 L-8 8 L8 8 L10 0 Z" fill="#fff" stroke="${L}" stroke-width="1.6"/><circle cx="-4" cy="-4" r="5" fill="#e8474f"/><circle cx="5" cy="-5" r="4" fill="#ffd34d"/><path d="M0 -2 L2 -12" stroke="#3f9c6d" stroke-width="2"/></g>
    </svg>`;
  }
  function stoolSVG() {
    return `<svg viewBox="-30 -44 60 48" xmlns="http://www.w3.org/2000/svg"><path d="M-16 -16 L-20 2 M16 -16 L20 2 M0 -16 L0 2" stroke="#8c5232" stroke-width="4" stroke-linecap="round"/><ellipse cy="-20" rx="22" ry="8" fill="#ff9db5" stroke="${L}" stroke-width="2.4"/><ellipse cy="-22" rx="16" ry="4" fill="#ffc2d0"/></svg>`;
  }
  // 거실에서 주방으로 가는 입구 (예전 주방 카운터 자리)
  function doorArt() {
    return `<svg viewBox="0 0 180 140" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="90" cy="134" rx="80" ry="6" fill="#000" opacity=".1"/>
      <path d="M20 134 V40 Q20 8 52 8 H128 Q160 8 160 40 V134 Z" fill="#cfe9df" stroke="${L}" stroke-width="3"/>
      ${[30, 50, 70, 90, 110].map((y) => `<path d="M24 ${y} H156" stroke="#b6dccd" stroke-width="2"/>`).join('')}
      <rect x="40" y="70" width="40" height="64" rx="4" fill="#f4f9ff" stroke="${L}" stroke-width="2"/><rect x="72" y="92" width="5" height="16" rx="2" fill="#c4d4ec"/>
      <rect x="92" y="96" width="56" height="38" rx="4" fill="#fffaf2" stroke="${L}" stroke-width="2"/><ellipse cx="108" cy="96" rx="9" ry="2.6" fill="#4d5a6a"/><ellipse cx="132" cy="96" rx="9" ry="2.6" fill="#4d5a6a"/>
      <path d="M100 92 Q100 82 108 82 Q116 82 116 92 Z" fill="#e8474f" stroke="${L}" stroke-width="1.6"/>
      <path d="M14 40 Q14 0 52 0 H128 Q166 0 166 40" fill="none" stroke="#c98a5e" stroke-width="10"/>
      <g transform="translate(90 24)"><rect x="-30" y="-12" width="60" height="22" rx="7" fill="#fffaf2" stroke="${L}" stroke-width="2"/><text y="4" text-anchor="middle" font-size="13" font-family="Jua, sans-serif" fill="${L}">주방 ▸</text></g>
    </svg>`;
  }
  // 거실 벽의 주방 입구: 나무 아치 + 체크무늬 카페 커튼 + 안쪽에 살짝 보이는 주방
  function archArt() {
    const g = (x, w) => `<pattern id="gingham${x}" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#fff"/><rect width="6" height="12" fill="#e8474f" opacity=".45"/><rect width="12" height="6" fill="#e8474f" opacity=".45"/></pattern>`;
    return `<svg viewBox="0 0 170 272" xmlns="http://www.w3.org/2000/svg">
      <defs>${g(0)}<linearGradient id="kaGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3d6"/><stop offset="1" stop-color="#ffe2b0"/></linearGradient></defs>
      <path d="M8 272 V86 Q8 10 85 10 Q162 10 162 86 V272 Z" fill="#c98a5e" stroke="${L}" stroke-width="3"/>
      <path d="M20 272 V90 Q20 24 85 24 Q150 24 150 90 V272 Z" fill="url(#kaGlow)" stroke="${L}" stroke-width="2.4"/>
      <!-- 안쪽: 민트 타일 · 선반 · 작은 화분 -->
      <clipPath id="kaIn"><path d="M20 272 V90 Q20 24 85 24 Q150 24 150 90 V272 Z"/></clipPath>
      <g clip-path="url(#kaIn)">
        <rect x="20" y="150" width="130" height="122" fill="#cfe9df"/>
        ${[150, 166, 182, 198, 214, 230].map((y, i) => `<path d="M20 ${y} H150" stroke="#b6dccd" stroke-width="2"/>` + [0, 1, 2, 3, 4].map((j) => `<path d="M${30 + j * 26 + (i % 2) * 13} ${y} v16" stroke="#b6dccd" stroke-width="2"/>`).join('')).join('')}
        <rect x="20" y="246" width="130" height="26" fill="#f2d7b6"/>
        <rect x="38" y="118" width="94" height="7" rx="3" fill="#c98a5e" stroke="${L}" stroke-width="1.6"/>
        ${[[50, '#e8474f'], [70, '#ffd34d'], [92, '#8fd17a'], [114, '#ff9db5']].map(([x, c], i) => `<g transform="translate(${x} 118)"><rect x="-7" y="-${16 + (i % 2) * 4}" width="14" height="${16 + (i % 2) * 4}" rx="3" fill="#fff" stroke="${L}" stroke-width="1.4"/><rect x="-5" y="-${11 + (i % 2) * 3}" width="10" height="${9 + (i % 2) * 3}" rx="2" fill="${c}"/></g>`).join('')}
        <g transform="translate(118 246)"><rect x="-22" y="-44" width="44" height="44" rx="4" fill="#fffaf2" stroke="${L}" stroke-width="2"/><rect x="-16" y="-34" width="32" height="22" rx="4" fill="#3a3340"/><rect x="-16" y="-34" width="32" height="22" rx="4" fill="#ffb347" opacity=".3"/>
          <ellipse cx="-9" cy="-46" rx="8" ry="2.4" fill="#4d5a6a"/><path d="M-16 -48 Q-16 -60 -6 -60 Q4 -60 4 -48 Z" fill="#e8474f" stroke="${L}" stroke-width="1.6"/></g>
        <g class="ksteam" fill="#fff" opacity=".85"><circle cx="112" cy="178" r="5"/><circle cx="118" cy="166" r="3.6"/></g>
      </g>
      <!-- 카페 커튼 -->
      <path d="M16 70 H154" stroke="#8c5232" stroke-width="5" stroke-linecap="round"/>
      <circle cx="16" cy="70" r="5" fill="#ffd34d" stroke="${L}" stroke-width="1.6"/><circle cx="154" cy="70" r="5" fill="#ffd34d" stroke="${L}" stroke-width="1.6"/>
      <path d="M22 70 L82 70 L82 150 Q72 158 62 150 Q52 158 42 150 Q32 158 22 150 Z" fill="url(#gingham0)" stroke="${L}" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M88 70 L148 70 L148 150 Q138 158 128 150 Q118 158 108 150 Q98 158 88 150 Z" fill="url(#gingham0)" stroke="${L}" stroke-width="2.2" stroke-linejoin="round"/>
      ${[30, 42, 54, 66, 78].map((x) => `<circle cx="${x - 2}" cy="72" r="3" fill="#fff" stroke="${L}" stroke-width="1.2"/>`).join('')}${[94, 106, 118, 130, 142].map((x) => `<circle cx="${x}" cy="72" r="3" fill="#fff" stroke="${L}" stroke-width="1.2"/>`).join('')}
      <!-- 간판 -->
      <path d="M62 10 L70 0 M108 10 L100 0" stroke="${L}" stroke-width="1.6"/>
      <g transform="translate(85 18)"><rect x="-32" y="-14" width="64" height="26" rx="8" fill="#fffaf2" stroke="${L}" stroke-width="2.2"/>
        <text y="5" text-anchor="middle" font-size="15" font-family="Jua, sans-serif" fill="${L}">주방</text>
        <path d="M-22 -2 q4 -6 8 0 M14 -2 q4 -6 8 0" stroke="#3f9c6d" stroke-width="2" fill="none"/><circle cx="-18" cy="0" r="2" fill="#e8474f"/><circle cx="18" cy="0" r="2" fill="#e8474f"/></g>
      <!-- 발판 -->
      <ellipse cx="85" cy="268" rx="56" ry="6" fill="#e8474f" opacity=".85"/>
    </svg>`;
  }
  const OBJS = [
    { k: 'fridge', x: 118, y: 412, w: 140, h: 266, svg: () => fridgeSVG(), hs: true },
    { k: 'pantry', x: 290, y: 368, w: 160, h: 194, svg: () => pantrySVG(), hs: true },
    { k: 'stove', x: 500, y: 372, w: 180, h: 172, svg: stoveSVG, hs: true },
    { k: 'counter', x: 720, y: 372, w: 160, h: 154, svg: counterSVG, hs: true },
    { k: 'table', x: 500, y: 540, w: 220, h: 80, svg: tableSVG, z: 520 },
  ];
  function objects() {
    return OBJS.map((o) => `<div class="kobj o-${o.k}${o.hs ? ' khs' : ''}" data-k="${o.k}" style="left:${o.x - o.w / 2}px;top:${o.y - o.h + 4}px;width:${o.w}px;height:${o.h}px;z-index:${o.z || o.y}">${o.svg()}</div>`).join('');
  }
  function openDoor(k, ms = 900) {
    const el = document.querySelector(`.kobj.o-${k}`); if (!el) return;
    el.innerHTML = k === 'fridge' ? fridgeSVG(true) : pantrySVG(true);
    clearTimeout(el._t); el._t = setTimeout(() => { el.innerHTML = k === 'fridge' ? fridgeSVG() : pantrySVG(); }, ms);
  }
  window.KitchenRoom = { scene, objects, doorArt, archArt, stoolSVG, ingrIcon, ingrName, INGR, RECIPES, openDoor };

  // ───────── 요리 창 ─────────
  window.CookUI = function (api) {
    const $ = (s) => document.querySelector(s);
    let open = false, ingr = {}, dish = null, step = 'menu', added = [], heat = 0, on = false, speed = 1, sweet = 0.5, t = 0, raf = null, last = 0, result = null;
    const have = (k) => ingr[k] || 0;
    const canMake = (d) => RECIPES[d].every((k) => have(k) > 0);
    const QN = { great: '✨ 최고예요!', good: '맛있게 됐어요!', ok: '그럭저럭 괜찮아요', burnt: '앗, 살짝 탔어요…' };
    function qualityOf(h) { return h >= sweet && h <= sweet + 0.08 ? 'great' : h >= 0.35 && h < 0.85 ? 'good' : h < 0.35 ? 'ok' : 'burnt'; }
    function loop(ts) {
      const dt = Math.min(0.05, (ts - last) / 1000); last = ts;
      if (on) {
        t += dt; heat = Math.min(1.2, heat + dt * speed * (0.18 + t * 0.09) * (1 + 0.3 * Math.sin(t * 5)));
        const m = $('#cookHeat i'); if (m) m.style.left = Math.min(100, heat / 1.2 * 100) + '%';
        if (heat >= 1.2) { pull(); return; }
      }
      raf = requestAnimationFrame(loop);
    }
    function pull() { if (!on) return; on = false; cancelAnimationFrame(raf); raf = null; result = qualityOf(heat); api.Sound.Sfx[result === 'great' ? 'tada' : result === 'burnt' ? 'splat' : 'ding'](); step = 'done'; render(); }
    function bag() {
      const ks = Object.keys(KitchenRoom.INGR).filter((k) => have(k));
      return ks.length ? `<div class="kbag">${ks.map((k) => `<span class="kchip" title="${ingrName(k)}">${ingrIcon(k)}<b>${have(k)}</b></span>`).join('')}</div>` : '<p class="chint small">재료 바구니가 비었어요. 냉장고랑 찬장을 눌러서 뒤져 봐요!</p>';
    }
    function render() {
      if (!open) return;
      const view = $('#cookView'), panel = $('#cookPanel');
      if (step === 'menu') {
        view.innerHTML = `<div class="kmenu">${Object.keys(RECIPES).map((d) => `<button class="kdish ${canMake(d) ? 'ok' : ''} ${dish === d ? 'on' : ''}" data-dish="${d}">${Foods.art(d)}<small>${Foods.NAMES[d]}</small></button>`).join('')}</div>`;
        const r = dish && RECIPES[dish];
        panel.innerHTML = `<p class="clabel-sm">🧺 내 재료 바구니</p>${bag()}
          ${r ? `<p class="chint"><b>${Foods.NAMES[dish]}</b> 재료</p><div class="kneed">${r.map((k) => `<span class="kchip ${have(k) ? '' : 'miss'}">${ingrIcon(k)}<small>${ingrName(k)}</small></span>`).join('')}</div>
            <button class="btn primary cnext" data-act="go" ${canMake(dish) ? '' : 'disabled'}>${canMake(dish) ? '🍳 요리 시작!' : '재료가 모자라요'}</button>` : '<p class="chint">만들 요리를 골라요</p>'}`;
        return;
      }
      if (step === 'add') {
        const r = RECIPES[dish];
        view.innerHTML = `<div class="kpan ${OVEN.has(dish) ? 'oven' : NOFIRE.has(dish) ? 'board' : ''}">${added.map((k, i) => `<span class="kin" style="left:${20 + (i * 53) % 60}%;top:${30 + (i % 2) * 20}%">${ingrIcon(k, 'big')}</span>`).join('')}</div>`;
        panel.innerHTML = `<p class="chint">재료를 하나씩 눌러서 넣어요 (${added.length}/${r.length})</p>
          <div class="kneed">${r.map((k) => `<button class="kchip btnchip ${added.includes(k) ? 'used' : ''}" data-add="${k}" ${added.includes(k) ? 'disabled' : ''}>${ingrIcon(k)}<small>${ingrName(k)}</small></button>`).join('')}</div>
          <button class="btn ghost small" data-act="menu">◀ 다른 요리</button>`;
        return;
      }
      if (step === 'cook') {
        view.innerHTML = `<div class="kpan cooking ${OVEN.has(dish) ? 'oven' : ''}">${Foods.art(dish)}<i class="kfire"></i></div>`;
        panel.innerHTML = `<p class="chint">${on ? '지금이다 싶을 때 꺼내요!' : `${OVEN.has(dish) ? '오븐' : '불'}을 켜면 점점 빨리 익어요. <b class="gold">반짝이는 칸</b>에서 꺼내면 최고!`}</p>
          <div class="heatbar" id="cookHeat"><b class="sweet" style="left:${sweet / 1.2 * 100}%;width:${0.08 / 1.2 * 100}%"></b><i style="left:${Math.min(100, heat / 1.2 * 100)}%"></i>
            <span class="z raw">덜 익음</span><span class="z golden">잘 익음</span><span class="z brown">바삭</span><span class="z burnt">탐</span></div>
          ${on ? '<button class="btn primary cnext know" data-act="pull">✋ 지금 꺼내기!</button>' : `<button class="btn primary cnext" data-act="fire">🔥 ${OVEN.has(dish) ? '오븐 켜기' : '불 켜기'}</button>`}`;
        return;
      }
      view.innerHTML = `<div class="kpan done">${Foods.art(dish, 0, result)}</div>`;
      panel.innerHTML = `<p class="chint big">${QN[result]}</p><p class="chint">${Foods.name(dish, result)} 완성! 🎒 가방에 넣었어요</p>
        <button class="btn primary cnext" data-act="menu">다른 요리 하기</button>`;
    }
    $('#cookView').addEventListener('click', (e) => { const b = e.target.closest('[data-dish]'); if (b) { dish = b.dataset.dish; api.Sound.Sfx.pop(); render(); } });
    $('#cookPanel').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      if (b.dataset.add) {
        added.push(b.dataset.add); api.Sound.Sfx.plop();
        if (added.length === RECIPES[dish].length) {
          if (NOFIRE.has(dish)) { result = Math.random() < 0.4 ? 'great' : 'good'; finish(); return; }
          step = 'cook'; heat = 0; on = false; t = 0; speed = 0.85 + Math.random() * 0.4; sweet = 0.45 + Math.random() * 0.15;
        }
        render(); return;
      }
      switch (b.dataset.act) {
        case 'go': if (!api.bagRoom()) { api.toast('🎒 가방이 꽉 찼어요! 하나 먹거나 버리고 와요'); return; } step = 'add'; added = []; render(); break;
        case 'menu': step = 'menu'; render(); break;
        case 'fire': on = true; last = performance.now(); raf = requestAnimationFrame(loop); api.Sound.Sfx.whoosh(); render(); break;
        case 'pull': pull(); break;
      }
    });
    function finish(already) {
      if (!already) { step = 'done'; api.Sound.Sfx.tada(); render(); }
      api.send({ t: 'cook', act: 'cook', dish, q: result });
    }
    // 자동으로 꺼내졌을 때(탔을 때)도 보내요
    const origPull = pull;
    pull = function () { const was = on; origPull(); if (was) api.send({ t: 'cook', act: 'cook', dish, q: result }); };
    document.querySelectorAll('[data-close-cook]').forEach((b) => b.addEventListener('click', () => api.close()));
    return {
      setOpen(v) { open = v; if (!v) { on = false; cancelAnimationFrame(raf); raf = null; if (step !== 'done') step = 'menu'; } else if (step === 'done') step = 'menu'; render(); },
      setIngr(g) { ingr = g || {}; if (open && step === 'menu') render(); },
    };
  };
})();
