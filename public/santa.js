// 🎅 산타 할아버지 · 🦌 썰매 그림자
(function () {
  const L = '#5b4036';
  // 동글동글 산타 (발 밑 가운데 0,0 — 캐릭터와 같은 크기)
  function santaSVG(walk = false) {
    return `<svg viewBox="-42 -98 84 102" xmlns="http://www.w3.org/2000/svg" class="${walk ? 'santa-walk' : ''}">
      <ellipse cy="2" rx="26" ry="5" fill="#000" opacity=".12"/>
      <g class="sleg"><ellipse cx="-11" cy="-3" rx="9" ry="6" fill="#3a3340" stroke="${L}" stroke-width="2"/><ellipse cx="11" cy="-3" rx="9" ry="6" fill="#3a3340" stroke="${L}" stroke-width="2"/></g>
      <path d="M-28 -6 Q-32 -44 0 -46 Q32 -44 28 -6 Q0 2 -28 -6 Z" fill="#e8474f" stroke="${L}" stroke-width="2.6"/>
      <path d="M-27 -12 Q0 -4 27 -12" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/>
      <rect x="-28" y="-28" width="56" height="7" fill="#3a3340"/><rect x="-6" y="-30" width="12" height="11" rx="2" fill="#ffd34d" stroke="${L}" stroke-width="1.6"/>
      <path d="M0 -44 L0 -30" stroke="#fff" stroke-width="5"/>
      <g class="sarm"><path d="M-26 -36 Q-38 -30 -36 -18" stroke="#e8474f" stroke-width="9" stroke-linecap="round" fill="none"/><circle cx="-36" cy="-16" r="5" fill="#fff" stroke="${L}" stroke-width="1.8"/></g>
      <path d="M30 -40 Q46 -46 44 -24 Q42 -10 30 -14 Z" fill="#b97a4f" stroke="${L}" stroke-width="2.2"/><path d="M30 -40 Q36 -48 42 -42" stroke="#8c5232" stroke-width="2" fill="none"/>
      <circle cy="-62" r="20" fill="#ffd9c2" stroke="${L}" stroke-width="2.6"/>
      <path d="M-20 -60 Q-22 -38 0 -36 Q22 -38 20 -60 Q12 -52 0 -54 Q-12 -52 -20 -60 Z" fill="#fff" stroke="${L}" stroke-width="2.2"/>
      <path d="M-8 -55 Q-4 -51 0 -55 Q4 -51 8 -55" stroke="${L}" stroke-width="1.6" fill="#fff"/>
      <circle cx="-7" cy="-66" r="2.4" fill="${L}"/><circle cx="7" cy="-66" r="2.4" fill="${L}"/>
      <ellipse cx="-13" cy="-60" rx="4" ry="2.6" fill="#ff9db5" opacity=".8"/><ellipse cx="13" cy="-60" rx="4" ry="2.6" fill="#ff9db5" opacity=".8"/>
      <circle cy="-60" r="3.6" fill="#ff8f8f" stroke="${L}" stroke-width="1.4"/>
      <path d="M-21 -72 Q-16 -96 6 -94 Q22 -92 26 -76 L32 -66" stroke="none" fill="#e8474f"/>
      <path d="M-21 -72 Q-16 -96 6 -94 Q22 -92 26 -76 Q30 -72 34 -68" stroke="${L}" stroke-width="2.4" fill="#e8474f" stroke-linejoin="round"/>
      <rect x="-23" y="-78" width="46" height="9" rx="4.5" fill="#fff" stroke="${L}" stroke-width="2"/>
      <circle cx="34" cy="-66" r="5.5" fill="#fff" stroke="${L}" stroke-width="2"/>
    </svg>`;
  }
  // 하늘을 지나가는 썰매 그림자 (오른쪽을 보고 있어요)
  function sleighSVG() {
    const deer = (x) => `<g transform="translate(${x} 0)">
      <path d="M-14 6 Q-16 -6 -4 -8 L10 -8 Q16 -16 18 -20 L22 -18 Q20 -10 16 -4 L14 6 L10 6 L10 0 L-6 0 L-8 6 Z" fill="#1b2440"/>
      <path d="M-14 6 l-4 8 M-8 6 l-2 8 M10 6 l3 8 M14 6 l5 7" stroke="#1b2440" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M18 -20 l-3 -8 l-3 3 M20 -20 l2 -9 l3 4" stroke="#1b2440" stroke-width="1.8" fill="none" stroke-linecap="round"/></g>`;
    return `<svg viewBox="-150 -40 300 70" xmlns="http://www.w3.org/2000/svg">
      <path d="M-62 2 Q-20 -4 30 -8 M-62 4 Q20 4 92 -6" stroke="#1b2440" stroke-width="1.4" fill="none" opacity=".8"/>
      ${deer(40)}${deer(74)}${deer(108)}
      <circle cx="131" cy="-17" r="3.4" fill="#ff3b3b" class="rudolph"/><circle cx="131" cy="-17" r="8" fill="#ff3b3b" opacity=".35" class="rudolph"/>
      <g transform="translate(-90 0)">
        <path d="M-40 -6 L20 -6 Q30 -6 30 6 L-30 6 Q-48 6 -46 -14 Q-44 -18 -40 -14 Z" fill="#1b2440"/>
        <path d="M-40 14 L26 14 Q34 14 36 8" stroke="#1b2440" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M-30 6 L-30 14 M18 6 L18 14" stroke="#1b2440" stroke-width="2.4"/>
        <circle cx="-8" cy="-18" r="9" fill="#1b2440"/><path d="M-16 -22 Q-10 -36 4 -30 L8 -26" fill="#1b2440"/><circle cx="9" cy="-26" r="3" fill="#1b2440"/>
        <path d="M-26 -8 Q-34 -26 -18 -26 Q-14 -16 -18 -8 Z" fill="#1b2440"/>
      </g>
    </svg>`;
  }
  window.SantaArt = { santaSVG, sleighSVG };
})();
