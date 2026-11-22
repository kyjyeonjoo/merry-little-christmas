// 🍳 음식 그림 (산타 선물 · 주방 요리) — 가운데 0,0 · 반지름 약 40
(function () {
  const L = '#5b4036';
  const NAMES = {
    cane: '지팡이 사탕', cookie: '진저브레드 쿠키', pancake: '핫케이크', pizza: '피자', chicken: '치킨', ramen: '라면',
    omelet: '오므라이스', cupcake: '컵케이크', salad: '샐러드', toast: '프렌치토스트', tteok: '떡볶이', fruit: '과일 꼬치',
  };
  const Q = { great: '최고의 ', good: '맛있는 ', ok: '', burnt: '살짝 탄 ' };
  const plate = (rx = 40, ry = 13, y = 22) => `<ellipse cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" stroke="${L}" stroke-width="2.4"/><ellipse cy="${y - 1}" rx="${rx - 9}" ry="${ry - 4}" fill="#f1f5fb"/>`;
  const bowl = (c = '#fff') => `<path d="M-36 0 Q-34 30 0 32 Q34 30 36 0 Z" fill="${c}" stroke="${L}" stroke-width="2.6"/><ellipse rx="36" ry="9" fill="${c}" stroke="${L}" stroke-width="2.6"/>`;
  const ART = {
    cane: () => `<g transform="rotate(-10)"><path d="M6 36 L6 -14 Q6 -32 -10 -32 Q-24 -32 -24 -18" stroke="${L}" stroke-width="15" fill="none" stroke-linecap="round"/>
      <path d="M6 36 L6 -14 Q6 -32 -10 -32 Q-24 -32 -24 -18" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round"/>
      <path d="M6 36 L6 -14 Q6 -32 -10 -32 Q-24 -32 -24 -18" stroke="#e8474f" stroke-width="10" fill="none" stroke-dasharray="7 7"/>
      <path d="M-2 26 l14 -10 M8 -26 q6 2 6 8" stroke="#fff" stroke-width="2" opacity=".6"/></g>`,
    cookie: () => `<path d="M0 -36 a12 12 0 1 1 -.1 0 Z M-8 -14 L-26 -14 Q-32 -8 -26 -2 L-12 -2 L-16 22 Q-14 30 -6 28 L0 14 L6 28 Q14 30 16 22 L12 -2 L26 -2 Q32 -8 26 -14 L8 -14 Z" fill="#c9834e" stroke="${L}" stroke-width="2.6" stroke-linejoin="round"/>
      <circle cx="-4.5" cy="-27" r="2" fill="${L}"/><circle cx="4.5" cy="-27" r="2" fill="${L}"/><path d="M-5 -21 Q0 -17 5 -21" stroke="${L}" stroke-width="1.8" fill="none"/>
      <path d="M-24 -8 L-16 -8 M16 -8 L24 -8 M-12 20 l6 0 M6 20 l6 0" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>
      <circle cy="-6" r="2.4" fill="#e8474f"/><circle cy="3" r="2.4" fill="#3f9c6d"/>`,
    pancake: () => `${plate()}${[14, 4, -6].map((y) => `<ellipse cy="${y}" rx="32" ry="10" fill="#e8a75c" stroke="${L}" stroke-width="2.4"/><path d="M-30 ${y + 2} Q0 ${y + 10} 30 ${y + 2}" stroke="#c98638" stroke-width="2" fill="none"/>`).join('')}
      <path d="M-20 -10 Q-22 4 -14 6 Q-10 -2 -2 2 Q4 -6 14 0 Q18 -8 22 -10 Q0 -20 -20 -10 Z" fill="#c9762e" opacity=".85"/>
      <rect x="-8" y="-20" width="16" height="10" rx="2.5" fill="#fff6c4" stroke="${L}" stroke-width="2"/>
      <circle cx="16" cy="-12" r="3.5" fill="#e8474f"/><circle cx="-18" cy="-13" r="3" fill="#5b8def"/>`,
    pizza: () => `<path d="M0 34 L-34 -22 Q0 -40 34 -22 Z" fill="#ffd56b" stroke="${L}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M-34 -22 Q0 -40 34 -22 L30 -14 Q0 -30 -30 -14 Z" fill="#e0a35a" stroke="${L}" stroke-width="2.2"/>
      <path d="M-22 -10 Q0 -20 22 -10 L0 26 Z" fill="#ff9a3c" opacity=".55"/>
      ${[[-10, -6], [10, -4], [0, 10], [-4, -16], [14, -16]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#e8474f" stroke="${L}" stroke-width="1.6"/>`).join('')}
      <path d="M-14 4 l4 -3 M6 14 l4 -2 M16 0 l3 -3" stroke="#3f9c6d" stroke-width="3" stroke-linecap="round"/>`,
    chicken: () => `${plate(42, 13, 24)}
      <g transform="rotate(-20 -8 0)"><path d="M-30 6 Q-34 -16 -16 -22 Q2 -26 6 -8 Q8 8 -8 14 Q-24 18 -30 6 Z" fill="#e39a3b" stroke="${L}" stroke-width="2.6"/>
        <path d="M2 2 L18 14" stroke="#fff4e0" stroke-width="7" stroke-linecap="round"/><path d="M2 2 L18 14" stroke="${L}" stroke-width="1.6" stroke-linecap="round" opacity=".4"/>
        <circle cx="20" cy="15" r="4.5" fill="#fff4e0" stroke="${L}" stroke-width="1.8"/><circle cx="16" cy="18" r="4" fill="#fff4e0" stroke="${L}" stroke-width="1.8"/>
        <path d="M-24 -6 l3 2 M-16 -14 l3 1 M-12 0 l3 2 M-6 -10 l2 3" stroke="#b56f22" stroke-width="2" stroke-linecap="round"/></g>
      <g transform="translate(16 -4) rotate(25)"><path d="M-14 6 Q-16 -10 -2 -14 Q12 -16 14 -2 Q14 10 2 12 Q-10 14 -14 6 Z" fill="#d98a2b" stroke="${L}" stroke-width="2.4"/>
        <path d="M-8 -4 l3 2 M2 -8 l3 1 M4 2 l2 3" stroke="#b56f22" stroke-width="2" stroke-linecap="round"/></g>`,
    ramen: () => `<g transform="translate(0 4)">${bowl('#fff')}<ellipse rx="30" ry="7" fill="#f2b45c"/>
      ${[-18, -8, 2, 12].map((x) => `<path d="M${x} -4 q4 4 0 7 q-4 3 0 6" stroke="#ffe08a" stroke-width="3" fill="none"/>`).join('')}
      <circle cx="-14" cy="-1" r="7" fill="#fff" stroke="${L}" stroke-width="1.6"/><circle cx="-14" cy="-1" r="3.4" fill="#ffc53d"/>
      <path d="M8 -6 L22 -2 L12 4 Z" fill="#3f9c6d" stroke="${L}" stroke-width="1.4"/><circle cx="20" cy="2" r="4" fill="#ff9db5" stroke="${L}" stroke-width="1.4"/>
      <path d="M-26 22 Q0 30 26 22" stroke="#e8474f" stroke-width="3" fill="none" stroke-dasharray="6 5"/>
      <path d="M22 -28 L6 2 M28 -24 L12 4" stroke="#b97a4f" stroke-width="3.4" stroke-linecap="round"/></g>`,
    omelet: () => `${plate(44, 14, 20)}<path d="M-34 14 Q-36 -16 0 -18 Q36 -16 34 14 Q0 22 -34 14 Z" fill="#ffd34d" stroke="${L}" stroke-width="2.6"/>
      <path d="M-24 -2 Q0 -12 24 -2" stroke="#ffe48a" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M-14 -4 Q-6 -12 0 -4 Q6 -12 14 -4 Q8 6 0 10 Q-8 6 -14 -4 Z" fill="#e8474f" stroke="#c23a42" stroke-width="1.6"/>`,
    cupcake: () => `<path d="M-24 2 L-18 34 L18 34 L24 2 Z" fill="#ff9db5" stroke="${L}" stroke-width="2.6" stroke-linejoin="round"/>
      ${[-14, -5, 4, 13].map((x) => `<path d="M${x} 4 L${x + 2} 32" stroke="#e8798f" stroke-width="2"/>`).join('')}
      <path d="M-28 4 Q-32 -10 -18 -12 Q-16 -26 0 -26 Q16 -26 18 -12 Q32 -10 28 4 Q0 10 -28 4 Z" fill="#fffaf2" stroke="${L}" stroke-width="2.6"/>
      <circle cy="-30" r="7" fill="#e8474f" stroke="${L}" stroke-width="2"/><path d="M0 -36 q4 -6 8 -6" stroke="#3f9c6d" stroke-width="2" fill="none"/>
      ${[[-14, -4, '#5b8def'], [8, -14, '#ffd34d'], [14, 0, '#3f9c6d'], [-4, -16, '#e8474f']].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="6" height="2.4" rx="1.2" fill="${c}" transform="rotate(30 ${x} ${y})"/>`).join('')}`,
    salad: () => `<g transform="translate(0 4)">${bowl('#e8f4ff')}
      ${[[-18, -6, '#6cc08b', 12], [0, -10, '#3f9c6d', 13], [16, -6, '#8fd17a', 11], [-6, -2, '#5aa96f', 10]].map(([x, y, c, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${L}" stroke-width="1.8"/>`).join('')}
      <circle cx="10" cy="-12" r="5" fill="#e8474f" stroke="${L}" stroke-width="1.6"/><circle cx="-14" cy="-12" r="4.5" fill="#e8474f" stroke="${L}" stroke-width="1.6"/>
      <ellipse cx="2" cy="-2" rx="6" ry="3.4" fill="#ffd34d" stroke="${L}" stroke-width="1.4"/></g>`,
    toast: () => `${plate()}<g transform="rotate(-8)"><path d="M-26 14 L-26 -12 Q-26 -26 -10 -26 Q-4 -32 4 -26 Q26 -26 26 -12 L26 14 Z" fill="#e8b46a" stroke="${L}" stroke-width="2.6"/>
      <path d="M-20 10 L-20 -10 Q-20 -20 -8 -20 Q0 -24 6 -20 Q20 -20 20 -10 L20 10 Z" fill="#f5cf8a"/>
      <rect x="-8" y="-12" width="14" height="9" rx="2" fill="#fff6c4" stroke="${L}" stroke-width="1.8"/>
      <circle cx="12" cy="4" r="4" fill="#e8474f"/><circle cx="-12" cy="4" r="3.4" fill="#a487e8"/></g>
      ${[[-30, -6], [26, -18], [30, 6]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#fff"/>`).join('')}`,
    tteok: () => `${plate(42, 14, 20)}<ellipse cy="12" rx="32" ry="9" fill="#e8474f" opacity=".85"/>
      ${[[-18, 4, 20], [2, 0, -15], [16, 8, 30], [-6, 12, 5], [10, -6, -40]].map(([x, y, a]) => `<rect x="${x - 11}" y="${y - 4}" width="22" height="8" rx="4" fill="#ff7a5c" stroke="${L}" stroke-width="1.8" transform="rotate(${a} ${x} ${y})"/>`).join('')}
      <path d="M-6 -4 l8 2 M12 4 l6 -3" stroke="#3f9c6d" stroke-width="3" stroke-linecap="round"/><circle cx="-14" cy="-6" r="4" fill="#fff" stroke="${L}" stroke-width="1.4"/><circle cx="-14" cy="-6" r="2" fill="#ffc53d"/>`,
    fruit: () => `<path d="M0 38 L0 -40" stroke="#b97a4f" stroke-width="3.6" stroke-linecap="round"/>
      <circle cy="-26" r="11" fill="#e8474f" stroke="${L}" stroke-width="2.2"/><path d="M-4 -36 q4 -6 8 -4" stroke="#3f9c6d" stroke-width="2.4" fill="none"/>
      <ellipse cy="-4" rx="12" ry="9" fill="#ffd34d" stroke="${L}" stroke-width="2.2"/>
      <circle cy="16" r="10" fill="#7ed957" stroke="${L}" stroke-width="2.2"/><path d="M-5 13 l2 2 M3 18 l2 1 M2 11 l1 2" stroke="#3a7d2c" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="-3" cy="-29" r="2.4" fill="#fff" opacity=".7"/>`,
  };
  let mk = 0;
  function art(t, bite = 0, q) {
    const id = 'fb' + (++mk);
    const holes = [[28, -28, 14], [10, -34, 16], [0, 0, 70]].slice(0, bite);
    const inner = ART[t] ? ART[t]() : `${plate()}<circle r="18" fill="#ffd56b" stroke="${L}" stroke-width="2.4"/>`;
    const burnt = q === 'burnt' ? `<g opacity=".45" fill="#3b2a22"><circle cx="-12" cy="-4" r="6"/><circle cx="10" cy="6" r="5"/><circle cx="4" cy="-14" r="4"/></g>` : '';
    const sparkle = q === 'great' && !bite ? `<g fill="#ffd34d" stroke="#fff" stroke-width="1"><path d="M-34 -30 l3 -8 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 z"/><path d="M30 -38 l2 -5 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 z"/></g>` : '';
    return `<svg viewBox="-48 -48 96 96" xmlns="http://www.w3.org/2000/svg">
      ${bite ? `<mask id="${id}"><rect x="-60" y="-60" width="120" height="120" fill="#fff"/>${holes.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#000"/>`).join('')}</mask>` : ''}
      <g ${bite ? `mask="url(#${id})"` : ''}>${inner}${burnt}</g>${bite >= 3 ? `<g opacity=".5">${plate()}</g>` : ''}${sparkle}</svg>`;
  }
  const name = (t, q) => (Q[q] || '') + (NAMES[t] || '음식');
  window.Foods = { art, name, NAMES };
})();
