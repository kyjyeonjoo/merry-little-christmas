// 작고 동글동글한 동물 캐릭터를 SVG로 그려요
(function () {
  const TYPES = [
    { id: 'bear', name: '곰돌이' },
    { id: 'bunny', name: '토끼' },
    { id: 'cat', name: '고양이' },
    { id: 'hamster', name: '햄찌' },
    { id: 'puppy', name: '멍멍이' },
    { id: 'fox', name: '여우' },
    { id: 'sheep', name: '양' },
    { id: 'penguin', name: '펭귄' },
  ];
  const COLORS = ['#ffffff', '#fff1d6', '#ffd6e0', '#ffd9b8', '#d4f2e1', '#d6ebff', '#e6dcff', '#d9b99b', '#d8d8de'];
  const ACCS = [
    { id: 'santa', name: '산타 모자' },
    { id: 'scarf', name: '목도리' },
    { id: 'antlers', name: '사슴뿔' },
    { id: 'ribbon', name: '리본' },
    { id: 'glasses', name: '동글 안경' },
    { id: 'star', name: '별 머리핀' },
    { id: 'earmuffs', name: '귀마개' },
    { id: 'bell', name: '방울 목걸이' },
    { id: 'mittens', name: '벙어리장갑' },
    { id: 'rudolph', name: '루돌프 코' },
    { id: 'holly', name: '호랑가시' },
  ];
  const MAX_ACCS = 3;

  const LINE = '#5b4036';
  const PINK = '#ffb3c1';

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const f = (c) => Math.max(0, Math.min(255, Math.round(c + amt)));
    const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }

  function ears(type, c) {
    const s = `fill="${c}" stroke="${LINE}" stroke-width="2.6"`;
    switch (type) {
      case 'bear':
        return `<circle cx="25" cy="27" r="11" ${s}/><circle cx="75" cy="27" r="11" ${s}/>
                <circle cx="25" cy="27" r="5.5" fill="${PINK}" opacity=".7"/><circle cx="75" cy="27" r="5.5" fill="${PINK}" opacity=".7"/>`;
      case 'bunny':
        return `<ellipse cx="37" cy="10" rx="8.5" ry="22" ${s} transform="rotate(-8 37 10)"/>
                <ellipse cx="63" cy="10" rx="8.5" ry="22" ${s} transform="rotate(8 63 10)"/>
                <ellipse cx="37" cy="11" rx="4" ry="15" fill="${PINK}" opacity=".7" transform="rotate(-8 37 11)"/>
                <ellipse cx="63" cy="11" rx="4" ry="15" fill="${PINK}" opacity=".7" transform="rotate(8 63 11)"/>`;
      case 'cat':
        return `<path d="M17 38 L20 9 L44 25 Z" ${s} stroke-linejoin="round"/>
                <path d="M83 38 L80 9 L56 25 Z" ${s} stroke-linejoin="round"/>
                <path d="M22 30 L23.5 16 L35 25 Z" fill="${PINK}" opacity=".7"/>
                <path d="M78 30 L76.5 16 L65 25 Z" fill="${PINK}" opacity=".7"/>`;
      case 'hamster':
        return `<circle cx="27" cy="29" r="8" ${s}/><circle cx="73" cy="29" r="8" ${s}/>
                <circle cx="27" cy="29" r="4" fill="${PINK}" opacity=".7"/><circle cx="73" cy="29" r="4" fill="${PINK}" opacity=".7"/>`;
      case 'puppy':
        return ''; // 귀는 얼굴 위에 덮어 그려요
      case 'fox': {
        const tip = shade(c, -70);
        return `<path d="M13 42 L17 0 L45 23 Z" ${s} stroke-linejoin="round"/>
                <path d="M87 42 L83 0 L55 23 Z" ${s} stroke-linejoin="round"/>
                <path d="M16.2 12 L17 0 L26.5 7.8 Z" fill="${tip}"/><path d="M83.8 12 L83 0 L73.5 7.8 Z" fill="${tip}"/>
                <path d="M19 32 L21 12 L36 24 Z" fill="${PINK}" opacity=".7"/>
                <path d="M81 32 L79 12 L64 24 Z" fill="${PINK}" opacity=".7"/>`;
      }
      case 'sheep': {
        const d = shade(c, -22);
        return `<ellipse cx="13" cy="50" rx="12" ry="6.5" fill="${d}" stroke="${LINE}" stroke-width="2.4" transform="rotate(18 13 50)"/>
                <ellipse cx="87" cy="50" rx="12" ry="6.5" fill="${d}" stroke="${LINE}" stroke-width="2.4" transform="rotate(-18 87 50)"/>`;
      }
      case 'penguin':
        return '';
    }
    return '';
  }

  function frontEars(type, c) {
    if (type !== 'puppy') return '';
    const d = shade(c, -28);
    const s = `fill="${d}" stroke="${LINE}" stroke-width="2.6"`;
    return `<ellipse cx="18" cy="48" rx="10" ry="19" ${s} transform="rotate(22 18 48)"/>
            <ellipse cx="82" cy="48" rx="10" ry="19" ${s} transform="rotate(-22 82 48)"/>`;
  }

  // 얼굴 위에 덧그리는 특징 (여우 입가, 양털, 펭귄 얼굴 무늬)
  function faceMarks(type, c) {
    if (type === 'fox') {
      return `<path d="M24 60 Q36 52 50 60 Q64 52 76 60 Q72 80 50 82 Q28 80 24 60 Z" fill="#fff" opacity=".9"/>`;
    }
    if (type === 'sheep') {
      const wool = shade(c, 34);
      const blobs = [[28, 32, 10], [39, 25, 11], [52, 23, 11], [64, 26, 11], [74, 33, 9.5], [50, 33, 10]];
      return blobs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${wool}" stroke="${LINE}" stroke-width="2.2"/>`).join('')
        + blobs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r - 1.6}" fill="${wool}"/>`).join('');
    }
    if (type === 'penguin') {
      return `<path d="M50 40 C40 30, 20 36, 22 56 C24 74, 38 82, 50 82 C62 82, 76 74, 78 56 C80 36, 60 30, 50 40 Z" fill="#fff"/>`;
    }
    return '';
  }

  function face(type) {
    const cheek = type === 'hamster' ? 9 : 6.5;
    let extra = '';
    if (type === 'cat') {
      extra = `<g stroke="${LINE}" stroke-width="1.6" stroke-linecap="round" opacity=".7">
        <line x1="14" y1="58" x2="25" y2="60"/><line x1="14" y1="65" x2="25" y2="64"/>
        <line x1="86" y1="58" x2="75" y2="60"/><line x1="86" y1="65" x2="75" y2="64"/></g>`;
    }
    if (type === 'puppy' || type === 'bear' || type === 'fox' || type === 'sheep') {
      extra = `<ellipse cx="50" cy="61" rx="3.6" ry="2.6" fill="${LINE}"/>`;
    }
    if (type === 'bunny') {
      extra = `<path d="M47.5 59.5 L52.5 59.5 L50 62.5 Z" fill="#f28da0"/>`;
    }
    return `
      <ellipse cx="28" cy="63" rx="${cheek}" ry="${cheek * 0.62}" fill="${PINK}" opacity=".75"/>
      <ellipse cx="72" cy="63" rx="${cheek}" ry="${cheek * 0.62}" fill="${PINK}" opacity=".75"/>
      <g class="eyes">
        <ellipse cx="38" cy="54" rx="3.4" ry="4.3" fill="#3a2a26"/>
        <ellipse cx="62" cy="54" rx="3.4" ry="4.3" fill="#3a2a26"/>
        <circle cx="39.2" cy="52.4" r="1.3" fill="#fff"/><circle cx="63.2" cy="52.4" r="1.3" fill="#fff"/>
      </g>
      ${extra}
      ${type === 'penguin'
        ? `<path d="M45 61 L55 61 L50 67 Z" fill="#ffb347" stroke="${LINE}" stroke-width="1.6" stroke-linejoin="round"/>`
        : `<path d="M46 64.5 Q48 67 50 64.5 Q52 67 54 64.5" fill="none" stroke="${LINE}" stroke-width="1.8" stroke-linecap="round"/>`}`;
  }

  function accessory(acc, type) {
    switch (acc) {
      case 'santa': {
        const y = type === 'bunny' ? -2 : 0;
        return `<g transform="translate(0 ${y})">
          <path d="M23 31 C27 6, 60 -6, 84 6 C76 12, 76 22, 78 31 Z" fill="#e8474f" stroke="${LINE}" stroke-width="2.4" stroke-linejoin="round"/>
          <rect x="18" y="25" width="64" height="11" rx="5.5" fill="#fff" stroke="${LINE}" stroke-width="2.2"/>
          <circle cx="86" cy="7" r="6.5" fill="#fff" stroke="${LINE}" stroke-width="2.2"/></g>`;
      }
      case 'scarf':
        return `<path d="M27 77 Q50 87 73 77 L74 84 Q50 95 26 84 Z" fill="#e8474f" stroke="${LINE}" stroke-width="2.2" stroke-linejoin="round"/>
          <path d="M60 84 L66 101 L74 98 L70 82 Z" fill="#e8474f" stroke="${LINE}" stroke-width="2.2" stroke-linejoin="round"/>
          <path d="M36 82 L37 88 M48 84 L48 90 M60 83 L59 89" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`;
      case 'antlers':
        return `<g fill="none" stroke="#a0673f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M32 26 L24 6 M27 14 L17 10 M25 9 L28 0"/>
          <path d="M68 26 L76 6 M73 14 L83 10 M75 9 L72 0"/></g>`;
      case 'glasses':
        return `<g fill="#fff" fill-opacity=".25" stroke="${LINE}" stroke-width="2.2">
          <circle cx="38" cy="54" r="8.5"/><circle cx="62" cy="54" r="8.5"/></g>
          <path d="M46.5 53 Q50 50.5 53.5 53" fill="none" stroke="${LINE}" stroke-width="2.2" stroke-linecap="round"/>`;
      case 'star':
        return `<path transform="translate(27 26) rotate(-12) scale(.95)" d="M0 -11 L3.2 -3.6 L11 -3.4 L4.8 1.6 L7 9.4 L0 4.8 L-7 9.4 L-4.8 1.6 L-11 -3.4 L-3.2 -3.6 Z"
          fill="#ffd34d" stroke="${LINE}" stroke-width="2" stroke-linejoin="round"/>`;
      case 'earmuffs':
        return `<path d="M15 46 Q50 -2 85 46" fill="none" stroke="#e8474f" stroke-width="4.5" stroke-linecap="round"/>
          <circle cx="14" cy="53" r="10.5" fill="#fff" stroke="${LINE}" stroke-width="2.2"/><circle cx="86" cy="53" r="10.5" fill="#fff" stroke="${LINE}" stroke-width="2.2"/>
          <circle cx="14" cy="53" r="5" fill="#ffb3c1"/><circle cx="86" cy="53" r="5" fill="#ffb3c1"/>`;
      case 'bell':
        return `<path d="M31 76 Q50 85 69 76" fill="none" stroke="#e8474f" stroke-width="3.5" stroke-linecap="round"/>
          <circle cx="50" cy="86" r="6.5" fill="#ffc94a" stroke="${LINE}" stroke-width="2"/>
          <path d="M44.5 85 L55.5 85" stroke="${LINE}" stroke-width="1.4"/><circle cx="50" cy="89" r="1.4" fill="${LINE}"/>`;
      case 'mittens':
        return `<g transform="rotate(25 29 82)"><ellipse cx="29" cy="84" rx="6.5" ry="7" fill="#e8474f" stroke="${LINE}" stroke-width="2.2"/>
            <rect x="22" y="75" width="14" height="4.5" rx="2.2" fill="#fff" stroke="${LINE}" stroke-width="1.6"/></g>
          <g transform="rotate(-25 71 82)"><ellipse cx="71" cy="84" rx="6.5" ry="7" fill="#e8474f" stroke="${LINE}" stroke-width="2.2"/>
            <rect x="64" y="75" width="14" height="4.5" rx="2.2" fill="#fff" stroke="${LINE}" stroke-width="1.6"/></g>`;
      case 'rudolph':
        return `<circle cx="50" cy="61.5" r="5.8" fill="#e8474f" stroke="${LINE}" stroke-width="1.8"/>
          <circle cx="48.2" cy="59.6" r="1.6" fill="#fff" opacity=".85"/>`;
      case 'holly': {
        const leaf = 'M0 0 C5 -7, 14 -8, 21 -3 C17 -1, 18 2, 21 3 C14 6, 5 5, 0 0 Z';
        return `<g transform="translate(29 25)">
          <path d="${leaf}" transform="rotate(-150)" fill="#3f9c6d" stroke="${LINE}" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="${leaf}" transform="rotate(-30)" fill="#4fb07f" stroke="${LINE}" stroke-width="1.8" stroke-linejoin="round"/>
          <circle cx="-3" cy="1" r="3.4" fill="#e8474f" stroke="${LINE}" stroke-width="1.5"/>
          <circle cx="3" cy="1.5" r="3.4" fill="#e8474f" stroke="${LINE}" stroke-width="1.5"/>
          <circle cx="0" cy="-3.5" r="3.4" fill="#e8474f" stroke="${LINE}" stroke-width="1.5"/></g>`;
      }
      case 'ribbon':
        return `<g transform="translate(70 26) rotate(18)">
          <path d="M0 0 L-13 -8 L-13 8 Z M0 0 L13 -8 L13 8 Z" fill="#ff7aa2" stroke="${LINE}" stroke-width="2.2" stroke-linejoin="round"/>
          <circle r="4" fill="#ff5c8d" stroke="${LINE}" stroke-width="2"/></g>`;
    }
    return '';
  }

  function accList(a) {
    if (Array.isArray(a.accs)) return a.accs;
    return a.acc && a.acc !== 'none' ? [a.acc] : [];
  }

  function svg(av) {
    const a = av || { type: 'bear', color: '#fff1d6', accs: [] };
    const accs = accList(a);
    const has = (id) => accs.includes(id);
    const c = a.color;
    const penguin = a.type === 'penguin';
    const belly = penguin ? '#ffffff' : shade(c, 12);
    const foot = penguin ? '#ffb347' : shade(c, -18);
    // 겹쳐 그리는 순서: 사슴뿔(귀 뒤) → 몸 → 장갑 → 얼굴 → 목도리·방울 → 귀마개 → 안경 → 모자 → 리본·별
    return `<svg class="avatar-svg" viewBox="0 -16 100 120" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="101" rx="26" ry="4.5" fill="#000" opacity=".12"/>
      ${has('antlers') ? accessory('antlers', a.type) : ''}
      ${ears(a.type, c)}
      <g class="body">
        <ellipse cx="38" cy="96" rx="8" ry="5" fill="${foot}" stroke="${LINE}" stroke-width="2.4"/>
        <ellipse cx="62" cy="96" rx="8" ry="5" fill="${foot}" stroke="${LINE}" stroke-width="2.4"/>
        <ellipse cx="50" cy="83" rx="22" ry="15" fill="${c}" stroke="${LINE}" stroke-width="2.6"/>
        <ellipse cx="50" cy="86" rx="12" ry="8" fill="${belly}" opacity="${penguin ? 1 : 0.8}"/>
        <ellipse class="arm-l" cx="29" cy="82" rx="5.5" ry="7.5" fill="${c}" stroke="${LINE}" stroke-width="2.4" transform="rotate(25 29 82)"/>
        <ellipse class="arm-r" cx="71" cy="82" rx="5.5" ry="7.5" fill="${c}" stroke="${LINE}" stroke-width="2.4" transform="rotate(-25 71 82)"/>
      </g>
      <ellipse cx="50" cy="54" rx="36" ry="30" fill="${c}" stroke="${LINE}" stroke-width="2.8"/>
      ${has('mittens') ? accessory('mittens', a.type) : ''}
      ${faceMarks(a.type, c)}
      ${frontEars(a.type, c)}
      ${face(a.type)}
      ${has('scarf') ? accessory('scarf', a.type) : ''}
      ${has('bell') ? accessory('bell', a.type) : ''}
      ${has('earmuffs') ? accessory('earmuffs', a.type) : ''}
      ${has('rudolph') ? accessory('rudolph', a.type) : ''}
      ${has('glasses') ? accessory('glasses', a.type) : ''}
      ${has('santa') ? accessory('santa', a.type) : ''}
      ${has('ribbon') ? accessory('ribbon', a.type) : ''}
      ${has('star') ? accessory('star', a.type) : ''}
      ${has('holly') ? accessory('holly', a.type) : ''}
    </svg>`;
  }

  window.Avatar = { TYPES, COLORS, ACCS, MAX_ACCS, svg, accList };
})();
