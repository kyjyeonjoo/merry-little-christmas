// 🎄 크리스마스 놀이방 서버
// 외부 패키지 없이 Node.js 기본 기능만 사용해요.  실행:  node server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const { spawn } = require('child_process');

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'users.json');

// ───────────────────────── 저장소 ─────────────────────────
// 내 컴퓨터에서는 data/users.json 파일에,
// 무료 호스팅(Render 등)에서는 Upstash Redis에 저장해요.
// (호스팅 서버는 재시작하면 파일이 지워지기 때문이에요)
// 붙여넣을 때 따라온 따옴표·공백·'이름=' 부분은 알아서 떼어내요
function cleanEnv(v, name) {
  let s = String(v || '').trim();
  if (s.startsWith(name + '=')) s = s.slice(name.length + 1).trim();
  return s.replace(/^["']+|["']+$/g, '').trim();
}
const UP_URL = cleanEnv(process.env.UPSTASH_REDIS_REST_URL, 'UPSTASH_REDIS_REST_URL').replace(/\/$/, '');
const UP_TOKEN = cleanEnv(process.env.UPSTASH_REDIS_REST_TOKEN, 'UPSTASH_REDIS_REST_TOKEN');
// 🛠️ 개발자 모드: 닉네임 "개발자" + 서버 환경 변수 ADMIN_PW (코드에는 비밀번호를 넣지 않아요)
const ADMIN_NICK = '개발자';
const ADMIN_PW = cleanEnv(process.env.ADMIN_PW, 'ADMIN_PW');
let adminTries = [];
function adminPwOk(pw) {
  if (!ADMIN_PW) return false;
  const now = Date.now();
  adminTries = adminTries.filter((t) => now - t < 60000);
  if (adminTries.length >= 5) return false; // 1분에 5번까지만 (비밀번호 맞히기 방지)
  adminTries.push(now);
  const a = Buffer.from(String(pw)), b = Buffer.from(ADMIN_PW);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
const USE_REDIS = !!(UP_URL && UP_TOKEN);
const REDIS_KEY = 'xmas:db';

let db = { users: {}, tokens: {} };

async function loadDb() {
  if (USE_REDIS) {
    const r = await fetch(`${UP_URL}/get/${REDIS_KEY}`, { headers: { Authorization: `Bearer ${UP_TOKEN}` } });
    if (r.status === 401) throw new Error('Upstash 토큰이 맞지 않아요 (HTTP 401). UPSTASH_REDIS_REST_TOKEN 값을 다시 확인해 주세요. 지금 값 길이: ' + UP_TOKEN.length + '자');
    if (!r.ok) throw new Error('Upstash 읽기 실패: HTTP ' + r.status);
    const j = await r.json();
    if (j.result) db = JSON.parse(j.result);
  } else {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    try { db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch (_) {}
  }
  db.users = db.users || {};
  db.tree = db.tree && Array.isArray(db.tree.items) ? db.tree : { items: [], top: 'star', next: 1 };
  db.gifts = db.gifts && Array.isArray(db.gifts.pool) ? db.gifts : { pool: [], waiting: [], next: 1 };
  db.snow = db.snow && Array.isArray(db.snow.men) ? db.snow : { men: [], next: 1 };
  db.castle = db.castle && db.castle.cells ? db.castle : { cells: {} };
  snowRelayout();
  db.tokens = db.tokens || {};
}

let saveTimer = null;
let saving = Promise.resolve();
function saveDb() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const snapshot = JSON.stringify(db);
    saving = saving.then(async () => {
      try {
        if (USE_REDIS) {
          const r = await fetch(`${UP_URL}/set/${REDIS_KEY}`, {
            method: 'POST', headers: { Authorization: `Bearer ${UP_TOKEN}` }, body: snapshot,
          });
          if (!r.ok) throw new Error('HTTP ' + r.status);
        } else {
          await fs.promises.writeFile(DB_FILE, snapshot);
        }
      } catch (err) { console.error('저장 실패', err.message); }
    });
  }, 300);
}

function hashPw(pw, salt) {
  return crypto.scryptSync(pw, salt, 32).toString('hex');
}
function checkPw(user, pw) {
  const h = Buffer.from(hashPw(pw, user.salt), 'hex');
  const s = Buffer.from(user.hash, 'hex');
  return h.length === s.length && crypto.timingSafeEqual(h, s);
}
function findUserByNick(nick) {
  const n = nick.toLowerCase();
  return Object.values(db.users).find((u) => u.nick.toLowerCase() === n);
}

const ANIMALS = ['bear', 'bunny', 'cat', 'hamster', 'puppy', 'fox', 'sheep', 'penguin', 'chick', 'monkey', 'turtle'];
const COLORS = ['#ffffff', '#fff1d6', '#fff0a0', '#ffd6e0', '#ffd9b8', '#d4f2e1', '#d6ebff', '#e6dcff', '#d9b99b', '#d8d8de'];
const ACCS = ['santa', 'scarf', 'antlers', 'ribbon', 'glasses', 'star', 'earmuffs', 'bell', 'mittens', 'rudolph', 'holly'];
const MAX_ACCS = 3;

function shuffle(a) { return [...a].sort(() => Math.random() - 0.5); }
function randomAvatar() {
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  return { type: pick(ANIMALS), color: pick(COLORS), accs: shuffle(ACCS).slice(0, 1 + Math.floor(Math.random() * 2)) };
}
// 예전 형식({acc:'santa'})도 새 형식({accs:[...]})으로 바꿔줘요
function normAvatar(a) {
  a = a || {};
  let accs = Array.isArray(a.accs) ? a.accs : a.acc && a.acc !== 'none' ? [a.acc] : [];
  accs = [...new Set(accs.filter((x) => ACCS.includes(x)))].slice(0, MAX_ACCS);
  return {
    type: ANIMALS.includes(a.type) ? a.type : 'bear',
    color: COLORS.includes(a.color) ? a.color : COLORS[1],
    accs,
  };
}
function cleanAvatar(a) {
  if (!a || typeof a !== 'object' || !ANIMALS.includes(a.type) || !COLORS.includes(a.color)) return null;
  if (!Array.isArray(a.accs) || a.accs.length > MAX_ACCS) return null;
  if (a.accs.some((x) => !ACCS.includes(x))) return null;
  return { type: a.type, color: a.color, accs: [...new Set(a.accs)] };
}
function validNick(nick) {
  return typeof nick === 'string' && /^[^\s<>"'&]{2,12}$/.test(nick.trim());
}
function validPw(pw) {
  return typeof pw === 'string' && pw.length >= 4 && pw.length <= 64;
}
function newToken(uid) {
  const t = crypto.randomBytes(24).toString('hex');
  db.tokens[t] = uid;
  saveDb();
  return t;
}
function publicUser(u) {
  return { id: u.id, nick: u.nick, avatar: normAvatar(u.avatar) };
}

// ───────────────────────── 방 (벽난로 거실) ─────────────────────────
const ROOM = { w: 1000, h: 620, minX: 40, maxX: 960, minY: 340, maxY: 600 };
// 좌석: 클라이언트(public/app.js)의 SEATS와 같은 id/좌표를 써요
const SEATS = {
  armL: { x: 236, y: 400 },
  armR: { x: 800, y: 395 },
  sofa1: { x: 360, y: 578 },
  sofa2: { x: 500, y: 578 },
  sofa3: { x: 640, y: 578 },
  cush1: { x: 345, y: 500 },
  cush2: { x: 655, y: 500 },
  cush3: { x: 262, y: 512 },
  poufL: { x: 105, y: 520 },
  poufR: { x: 895, y: 520 },
  hearthL: { x: 382, y: 368 }, // 난로 앞 방석
  hearthR: { x: 604, y: 368 },
  // 눈마당
  bench1: { x: 357, y: 600, room: 'out' },
  bench2: { x: 413, y: 600, room: 'out' },
  igloo: { x: 888, y: 484, room: 'out' },
};
const seatRoom = (id) => (SEATS[id] && SEATS[id].room) || 'in';
const DOOR = { in: { x: 290, y: 365 }, out: { x: 160, y: 380 } }; // 방을 옮기면 문 앞에 나타나요
const seatOwner = {}; // seatId -> playerId
const players = new Map(); // playerId -> { id, uid, nick, avatar, x, y, seat, facing, client }
const history = []; // 최근 채팅
let nextPid = 1;

function pub(p) {
  return { id: p.id, nick: p.nick, avatar: p.avatar, x: p.x, y: p.y, seat: p.seat, facing: p.facing, held: p.held || null, room: p.room || 'in', uid: p.uid };
}
function broadcast(msg, except) {
  const s = JSON.stringify(msg);
  for (const p of players.values()) if (p.client !== except) p.client.sendRaw(s);
}
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function leaveSeat(p) {
  if (p.seat && seatOwner[p.seat] === p.id) delete seatOwner[p.seat];
  p.seat = null;
}
function pushHistory(entry) {
  history.push(entry);
  if (history.length > 60) history.shift();
}

// 방 공지 (케이크 같은 활동이 열리면 방 위쪽에 떠요)
function notice(kind, text) {
  broadcast({ t: 'notice', kind, text, ts: Date.now() });
}

const recentlyLeft = new Map(); // uid -> timer (잠깐 끊겼다 다시 들어오면 인사 메시지를 생략)

function enterRoom(client, user) {
  // 같은 계정이 다른 곳에서 접속해 있으면 이전 접속을 정리
  for (const p of players.values()) {
    if (p.uid === user.id) {
      p.client.send({ t: 'kicked', reason: '다른 곳에서 같은 계정으로 들어왔어요.' });
      p.client.close();
      removePlayer(p.client);
    }
  }
  const p = {
    id: nextPid++, uid: user.id, nick: user.nick, avatar: normAvatar(user.avatar),
    // 케이크 테이블(가운데)을 피해서 양옆에 나타나요
    x: Math.random() < 0.5 ? 320 + Math.random() * 70 : 610 + Math.random() * 70, y: 545 + Math.random() * 45, seat: null, facing: 1, client, room: 'in',
  };
  client.player = p;
  players.set(p.id, p);
  client.send({
    t: 'welcome', me: p.id, user: publicUser(user), admin: isAdmin(user), inv: Array.isArray(user.inv) ? user.inv : [],
    players: [...players.values()].map(pub), history, cake, tree: db.tree, gift: giftState(user), giftPool: db.gifts.pool.length,
    snowmen: db.snow.men, race: racePub(), fight: fightPub(), castle: db.castle.cells,
  });
  broadcast({ t: 'join', player: pub(p) }, client);
  if (recentlyLeft.has(user.id)) {
    clearTimeout(recentlyLeft.get(user.id));
    recentlyLeft.delete(user.id);
    return;
  }
  const sys = { kind: 'sys', text: `${p.nick} 님이 벽난로 곁에 왔어요 🔥`, ts: Date.now() };
  pushHistory(sys);
  broadcast({ t: 'sys', ...sys });
}

function removePlayer(client) {
  const p = client.player;
  if (!p || !players.has(p.id)) return;
  leaveSeat(p);
  players.delete(p.id);
  client.player = null;
  if (![...players.values()].some((q) => q.uid === p.uid)) { cakeOnLeave(p.uid); raceLeave(p.uid); fightLeave(p.uid); }
  broadcast({ t: 'leave', id: p.id });
  const nick = p.nick, uid = p.uid;
  clearTimeout(recentlyLeft.get(uid));
  recentlyLeft.set(uid, setTimeout(() => {
    recentlyLeft.delete(uid);
    const sys = { kind: 'sys', text: `${nick} 님이 집으로 돌아갔어요 ❄️`, ts: Date.now() };
    pushHistory(sys);
    broadcast({ t: 'sys', ...sys });
  }, 8000));
}

// ───────────────────────── 🎂 다 같이 케이크 만들기 ─────────────────────────
// 처음 누른 사람이 방장 → 다른 사람은 참여 → 방장이 시작. (서버가 잠들면 처음부터)
const INGR = ['flour', 'sugar', 'salt', 'egg', 'milk', 'butter', 'cocoa', 'matcha', 'berry', 'redvelvet', 'pumpkin', 'blueberry', 'banana', 'sesame', 'butterfly'];
const INGR_REQUIRED = ['flour', 'sugar', 'salt', 'egg', 'milk', 'butter'];
const INGR_KO = { flour: '밀가루', sugar: '설탕', salt: '소금', egg: '계란', milk: '우유', butter: '버터', cocoa: '코코아 가루', matcha: '말차 가루', berry: '딸기 가루',
  redvelvet: '레드벨벳 가루', pumpkin: '단호박 가루', blueberry: '블루베리 가루', banana: '바나나 가루', sesame: '흑임자 가루', butterfly: '버터플라이피 가루' };
const CREAM_FRUITS = ['strawberry', 'blueberry', 'mango', 'kiwi', 'tangerine', 'choco'];
const FRUIT_KO = { strawberry: '딸기', blueberry: '블루베리', mango: '망고', kiwi: '키위', tangerine: '귤', choco: '초콜릿' };
const CAKE_TOPPINGS = ['rosette', 'strawberry', 'cherry', 'blueberry', 'macaron', 'mint', 'chocoheart', 'sprinkle', 'holly', 'star', 'candle'];
const SPREAD_N = 14; // 크림 바르기 격자 (14x14)
const SPREAD_CELLS = (() => {
  const cells = [];
  for (let y = 0; y < SPREAD_N; y++) for (let x = 0; x < SPREAD_N; x++) {
    const u = ((x + 0.5) / SPREAD_N) * 2 - 1, v = ((y + 0.5) / SPREAD_N) * 2 - 1;
    if (u * u + v * v <= 0.93) cells.push(y * SPREAD_N + x);
  }
  return cells;
})();
function newCake() {
  return {
    id: Date.now(), stage: 'lobby', host: null, members: [],
    ingr: Object.fromEntries(INGR.map((k) => [k, 0])), mix: 0,
    cream: [], spread: '0'.repeat(SPREAD_N * SPREAD_N), spreadPct: 0,
    toppings: [], rim: false, blows: [], candlesOut: false, slices: Array(8).fill(null), log: [],
  };
}
let cake = newCake();
function cakeLog(text) { cake.log.push(text); if (cake.log.length > 8) cake.log.shift(); }
function cakeSys(text) { const sys = { kind: 'sys', text, ts: Date.now() }; pushHistory(sys); broadcast({ t: 'sys', ...sys }); }
function cakeBroadcast() { broadcast({ t: 'cake', cake }); }
const isMember = (uid) => cake.members.some((m) => m.uid === uid);
const online = (uid) => [...players.values()].some((q) => q.uid === uid);
function cakeOnLeave(uid) {
  if (!isMember(uid)) return;
  if (cake.stage === 'lobby') cake.members = cake.members.filter((m) => m.uid !== uid);
  if (cake.host === uid) {
    // 방장이 나가면 남아 있는 참여자에게 방장을 넘겨요
    const next = cake.members.find((m) => m.uid !== uid && online(m.uid));
    cake.host = next ? next.uid : null;
    if (next) cakeLog(`👑 ${next.nick} 님이 새 방장이 됐어요`);
  }
  cakeBroadcast();
}

function handleCake(client, p, msg) {
  const now = Date.now();
  client.cakeTimes = (client.cakeTimes || []).filter((t) => now - t < 2000);
  if (client.cakeTimes.length >= 16) return;
  client.cakeTimes.push(now);
  const a = msg.a;
  const member = isMember(p.uid);
  const open = ['blow', 'eat', 'join', 'host', 'reset'];
  if (!open.includes(a) && !member) return client.send({ t: 'toast', msg: '먼저 "참여하기"를 눌러 주세요 🎂' });

  switch (a) {
    case 'host':
      if (cake.stage !== 'lobby' || cake.host) return;
      cake.host = p.uid; cake.members = [{ uid: p.uid, nick: p.nick }];
      cakeLog(`${p.nick} 님이 케이크 만들기를 열었어요`);
      cakeSys(`🎂 ${p.nick} 님이 케이크를 만들재요! 테이블에서 "참여하기"를 눌러요`);
      notice('cake', `🎂 ${p.nick} 님이 케이크 만들기를 열었어요!`);
      break;
    case 'join':
      if (member || ['eating', 'finished'].includes(cake.stage) || (cake.stage === 'lobby' && !cake.host)) return;
      if (cake.members.length >= 12) return client.send({ t: 'toast', msg: '케이크 만들기는 12명까지예요' });
      cake.members.push({ uid: p.uid, nick: p.nick });
      cakeLog(`${p.nick} 님이 참여했어요`);
      break;
    case 'leave':
      if (cake.stage !== 'lobby') return;
      cakeOnLeave(p.uid);
      return;
    case 'quit': {
      // 중간에 그만두기: 나만 빠지고, 아무도 안 남으면 케이크도 정리돼요
      if (!member || cake.stage === 'lobby' || cake.stage === 'finished') return;
      cake.members = cake.members.filter((m) => m.uid !== p.uid);
      cakeLog(`${p.nick} 님이 그만뒀어요`);
      if (!cake.members.length) { cake = newCake(); cakeSys('🎂 케이크 만들기가 끝났어요 (모두 그만뒀어요)'); break; }
      if (cake.host === p.uid) {
        const next = cake.members.find((m) => online(m.uid)) || cake.members[0];
        cake.host = next.uid; cakeLog(`👑 ${next.nick} 님이 새 방장이 됐어요`);
      }
      break;
    }
    case 'start':
      if (cake.stage !== 'lobby' || cake.host !== p.uid) return;
      cake.stage = 'ingredients';
      cakeLog('재료를 그릇에 넣어요!');
      notice('cake', `🎂 케이크 만들기가 시작됐어요! (${cake.members.length}명) 중간에 참여할 수 있어요`);
      break;
    case 'ingr':
      if (cake.stage !== 'ingredients' || !INGR.includes(msg.v) || cake.ingr[msg.v] >= 3) return;
      cake.ingr[msg.v]++;
      cakeLog(`${p.nick} 님이 ${INGR_KO[msg.v]}을(를) 넣었어요`);
      break;
    case 'uningr':
      if (cake.stage !== 'ingredients' || !INGR.includes(msg.v) || cake.ingr[msg.v] <= 0) return;
      cake.ingr[msg.v]--;
      break;
    case 'mix': {
      if (cake.stage !== 'mixing') return;
      const d = Math.max(0, Math.min(Number(msg.d) || 0, Math.PI * 6)); // 한 번에 최대 세 바퀴
      cake.mix = Math.min(1, cake.mix + d / (Math.PI * 2 * 10)); // 다 같이 열 바퀴
      if (cake.mix >= 1) cakeLog('반죽이 매끈해졌어요 ✨');
      break;
    }
    case 'cream':
      if (cake.stage !== 'cream' || !CREAM_FRUITS.includes(msg.v) || cake.cream.length >= 8) return;
      cake.cream.push(msg.v);
      cakeLog(`${p.nick} 님이 크림에 ${FRUIT_KO[msg.v]}을(를) 넣었어요`);
      break;
    case 'uncream':
      if (cake.stage !== 'cream' || !cake.cream.length) return;
      cake.cream.pop();
      break;
    case 'spread': {
      if (cake.stage !== 'spread' || !Array.isArray(msg.c)) return;
      const arr = cake.spread.split('');
      for (const i of msg.c.slice(0, 60)) if (Number.isInteger(i) && i >= 0 && i < arr.length) arr[i] = '1';
      cake.spread = arr.join('');
      const done = SPREAD_CELLS.filter((i) => arr[i] === '1').length;
      cake.spreadPct = Math.round((done / SPREAD_CELLS.length) * 100);
      break;
    }
    case 'next': {
      if (cake.host !== p.uid) {
        if (cake.host && online(cake.host)) return client.send({ t: 'toast', msg: '다음 단계는 👑 방장이 넘길 수 있어요' });
        cake.host = p.uid; // 방장이 없으면 누른 사람이 방장
      }
      const st = cake.stage;
      if (st === 'ingredients') {
        const missing = INGR_REQUIRED.filter((k) => !cake.ingr[k]);
        if (missing.length) return client.send({ t: 'toast', msg: `${missing.map((k) => INGR_KO[k]).join(', ')}이(가) 아직 없어요` });
        cake.stage = 'mixing';
        cakeLog('거품기로 빙글빙글 섞어요!');
      } else if (st === 'mixing') {
        if (cake.mix < 1) return;
        cake.stage = 'baking';
        cakeLog(`${p.nick} 님이 오븐에 넣었어요 🔥`);
        const id = cake.id;
        setTimeout(() => {
          if (cake.id !== id || cake.stage !== 'baking') return;
          cake.stage = 'cream';
          cakeLog('띵! 케이크가 다 구워졌어요');
          cakeBroadcast();
        }, 4000);
      } else if (st === 'cream') {
        cake.stage = 'spread';
        cakeLog('스패출러로 크림을 발라요!');
      } else if (st === 'spread') {
        if (cake.spreadPct < 88) return;
        cake.stage = 'decorate';
        cakeLog('크림을 다 발랐어요 ✨');
      } else if (st === 'decorate') {
        cake.stage = 'done';
        cakeLog(`${p.nick} 님이 케이크를 완성했어요 ✨`);
        cakeSys('🎂 케이크가 완성됐어요! 테이블로 모여요');
        notice('cake', '🎂 케이크가 완성됐어요! 다 같이 촛불 불러 와요');
      } else if (st === 'done') {
        if (cake.toppings.some((t) => t.k === 'candle') && !cake.candlesOut) return;
        cake.stage = 'eating';
        cakeLog(`${p.nick} 님이 케이크를 8조각으로 잘랐어요 🔪`);
        notice('cake', '🍰 케이크를 잘랐어요! 한 조각씩 먹으러 와요');
      } else return;
      break;
    }
    case 'topping': {
      const u = Number(msg.u), v = Number(msg.v);
      if (cake.stage !== 'decorate' || !CAKE_TOPPINGS.includes(msg.k) || cake.toppings.length >= 50) return;
      if (!isFinite(u) || !isFinite(v) || u * u + v * v > 1.05) return;
      cake.toppings.push({ k: msg.k, u: Math.round(u * 1000) / 1000, v: Math.round(v * 1000) / 1000, by: p.uid });
      break;
    }
    case 'rim':
      if (cake.stage !== 'decorate') return;
      cake.rim = !cake.rim;
      cakeLog(`${p.nick} 님이 테두리 생크림을 ${cake.rim ? '짰어요' : '걷어냈어요'}`);
      break;
    case 'undo':
      if (cake.stage !== 'decorate') return;
      for (let i = cake.toppings.length - 1; i >= 0; i--) if (cake.toppings[i].by === p.uid) { cake.toppings.splice(i, 1); break; }
      break;
    case 'blow': {
      if (cake.stage !== 'done' || cake.candlesOut || !cake.toppings.some((t) => t.k === 'candle')) return;
      if (!cake.blows.includes(p.uid)) cake.blows.push(p.uid);
      broadcast({ t: 'cakeBlow', id: p.id });
      if (cake.blows.length >= Math.max(1, Math.ceil(players.size / 2))) {
        cake.candlesOut = true;
        cakeLog('후~ 촛불이 꺼졌어요 🎉');
        cakeSys('🕯️ 다 같이 촛불을 껐어요! 메리 크리스마스 🎉');
      }
      break;
    }
    case 'eat': {
      const i = Number(msg.i);
      if (cake.stage !== 'eating' || !(i >= 0 && i < 8) || cake.slices[i]) return;
      cake.slices[i] = p.nick;
      const taste = cake.ingr.salt >= 3 ? 'salty' : cake.ingr.sugar >= 3 ? 'sweet' : 'yum';
      cakeLog(`${p.nick} 님이 한 조각 먹었어요 ${taste === 'salty' ? '🥵 짜다!' : taste === 'sweet' ? '🤤 엄청 달다!' : '😋'}`);
      broadcast({ t: 'cakeEat', id: p.id, taste });
      if (cake.slices.every(Boolean)) { cake.stage = 'finished'; cakeSys('🍰 케이크를 다 먹었어요! 맛있었다~'); }
      break;
    }
    case 'reset':
      if (cake.stage !== 'finished' && !(msg.force && (member || cake.stage === 'lobby'))) return;
      cake = newCake();
      break;
    default:
      return;
  }
  cakeBroadcast();
}

// ───────────────────────── 🎒 인벤토리 · 주방 음식 ─────────────────────────
const INV_SIZE = 4;
const now0 = () => Date.now();
// cocoa: 핫초코 { t: 'plain'|'mallow'|'cream', d: 0~6 (코코아 스푼), m: 30~100 (우유 %) }
// mallow: 구운 마시멜로 { q: 'raw'|'golden'|'perfect'|'brown'|'burnt' }
function cleanItem(it) {
  if (!it || typeof it !== 'object') return null;
  if (it.k === 'cocoa') {
    const t = ['plain', 'mallow', 'cream'].includes(it.t) ? it.t : 'plain';
    const d = Math.max(0, Math.min(6, Math.round(Number(it.d) || 0)));
    const m = Math.max(30, Math.min(100, Math.round(Number(it.m) || 70)));
    return { k: 'cocoa', t, d, m };
  }
  if (it.k === 'mallow') {
    const q = ['raw', 'golden', 'perfect', 'brown', 'burnt'].includes(it.q) ? it.q : 'raw';
    return { k: 'mallow', q };
  }
  return null;
}
function cocoaTaste(it) {
  const r = (it.d || 0) / ((it.m || 70) / 70);
  return r < 0.5 ? '밍밍한 ' : r < 1.5 ? '연한 ' : r <= 3.2 ? '' : r <= 4.6 ? '진한 ' : '아주 진한 ';
}
function itemName(it) {
  if (it.k === 'cocoa') return cocoaTaste(it) + (it.t === 'mallow' ? '마시멜로 핫초코' : it.t === 'cream' ? '휘핑크림 핫초코' : '핫초코');
  return { raw: '말랑 마시멜로', golden: '노릇노릇 마시멜로', perfect: '완벽한 황금 마시멜로', brown: '바삭 마시멜로', burnt: '까맣게 탄 마시멜로' }[it.q] || '마시멜로';
}

// ───────────────────────── 🎄 다 같이 트리 꾸미기 (계정 저장소에 같이 저장) ─────────────────────────
const TREE = {
  orn: { ball: ['red', 'gold', 'blue', 'pink', 'white', 'purple', 'mint'], cane: [''], bell: [''], bow: [''], ginger: [''], snow: [''],
    star: [''], sock: [''], light: ['red', 'gold', 'blue', 'pink', 'mint'], wish: ['cream', 'pink', 'mint', 'sky'], gift: ['red', 'blue', 'pink', 'mint', 'gold'] },
  garland: ['tinsel', 'beads', 'lights', 'ribbon'],
  tops: ['star', 'bow', 'snow', 'moon'],
  MAX: 220, MINE: 24, MINE_G: 4, MINE_W: 3,
};
const treeBroadcast = () => broadcast({ t: 'tree', tree: db.tree });
const clampN = (v, a, b) => Math.max(a, Math.min(b, Math.round(Number(v) || 0)));
function handleTree(client, p, msg) {
  const tr = db.tree;
  const now = Date.now();
  if (now - (client.lastTree || 0) < 150) return;
  client.lastTree = now;
  const mine = tr.items.filter((o) => o.uid === p.uid);
  const toast = (m) => client.send({ t: 'toast', msg: m });
  if (msg.act === 'add') {
    const o = msg.o || {};
    if (tr.items.length >= TREE.MAX) return toast('트리가 꽉 찼어요! 다른 장식을 조금 떼어 봐요 🎄');
    let item;
    if (o.k === 'garland') {
      if (!TREE.garland.includes(o.c)) return;
      if (mine.filter((x) => x.k === 'garland').length >= TREE.MINE_G) return toast(`줄 장식은 한 사람당 ${TREE.MINE_G}개까지예요`);
      const pts = (Array.isArray(o.pts) ? o.pts : []).slice(0, 24).map((q) => [clampN(q && q[0], 0, 240), clampN(q && q[1], 0, 300)]);
      if (pts.length < 2) return;
      item = { k: 'garland', c: o.c, pts };
    } else {
      const cs = TREE.orn[o.k];
      if (!cs) return;
      const c = cs.includes(o.c) ? o.c : cs[0];
      if (mine.filter((x) => x.k !== 'garland').length >= TREE.MINE) return toast(`장식은 한 사람당 ${TREE.MINE}개까지 달 수 있어요`);
      item = { k: o.k, c, x: clampN(o.x, 0, 240), y: clampN(o.y, 0, 300), r: clampN(o.r, -30, 30) };
      if (o.k === 'wish') {
        if (mine.filter((x) => x.k === 'wish').length >= TREE.MINE_W) return toast(`소원 카드는 한 사람당 ${TREE.MINE_W}장까지예요`);
        const txt = String(o.txt || '').replace(/[\u0000-\u001f]/g, '').trim().slice(0, 40);
        if (!txt) return toast('소원을 적어 주세요 ✍️');
        item.txt = txt;
      }
    }
    item.id = tr.next++; item.uid = p.uid; item.nick = p.nick;
    tr.items.push(item);
    if (item.k === 'wish') {
      const sys = { kind: 'sys', text: `🎄 ${p.nick} 님이 트리에 소원 카드를 걸었어요`, ts: now };
      pushHistory(sys); broadcast({ t: 'sys', ...sys });
    }
  } else if (msg.act === 'move') {
    const o = tr.items.find((x) => x.id === Number(msg.id));
    if (!o || o.uid !== p.uid || o.k === 'garland') return;
    o.x = clampN(msg.x, 0, 240); o.y = clampN(msg.y, 0, 300);
  } else if (msg.act === 'del') {
    const i = tr.items.findIndex((x) => x.id === Number(msg.id));
    if (i < 0 || tr.items[i].uid !== p.uid) return;
    tr.items.splice(i, 1);
  } else if (msg.act === 'top') {
    if (!TREE.tops.includes(msg.v) || tr.top === msg.v) return;
    tr.top = msg.v;
  } else return;
  saveDb();
  treeBroadcast();
}

// ───────────────────────── 🎁 선물 랜덤 교환 (그림 선물) ─────────────────────────
// 그림은 용량이 커서 계정 저장소와 따로 저장해요 (Upstash: gimg:<id> 키 / 로컬: data/gifts/<id>)
const GIFT_DIR = path.join(path.dirname(DB_FILE), 'gifts');
const WRAPS = ['red', 'green', 'blue', 'pink', 'gold'];
const RIBS = ['gold', 'red', 'white', 'green'];
async function putImg(id, data) {
  if (USE_REDIS) {
    const r = await fetch(`${UP_URL}/set/gimg:${id}`, { method: 'POST', headers: { Authorization: `Bearer ${UP_TOKEN}` }, body: data });
    if (!r.ok) throw new Error('HTTP ' + r.status);
  } else {
    await fs.promises.mkdir(GIFT_DIR, { recursive: true });
    await fs.promises.writeFile(path.join(GIFT_DIR, id + '.txt'), data);
  }
}
const GIFT_KEEP = 5; // 받은 선물함 칸 수
function delImg(id) {
  const job = USE_REDIS
    ? fetch(`${UP_URL}/del/gimg:${id}`, { method: 'POST', headers: { Authorization: `Bearer ${UP_TOKEN}` } })
    : fs.promises.unlink(path.join(GIFT_DIR, id + '.txt'));
  Promise.resolve(job).catch(() => {});
}
async function getImg(id) {
  try {
    if (USE_REDIS) {
      const r = await fetch(`${UP_URL}/get/gimg:${id}`, { headers: { Authorization: `Bearer ${UP_TOKEN}` } });
      return (await r.json()).result || null;
    }
    return await fs.promises.readFile(path.join(GIFT_DIR, id + '.txt'), 'utf8');
  } catch (_) { return null; }
}
function giftState(user) {
  const box = (Array.isArray(user.gifts) ? user.gifts : []).map((g) => ({ id: g.id, from: g.opened ? g.from : null, wrap: g.wrap, rib: g.rib, ts: g.ts, opened: !!g.opened }));
  return { waiting: db.gifts.waiting.includes(user.id), box };
}
function clientsOf(uid) { return [...players.values()].filter((q) => q.uid === uid).map((q) => q.client); }
function sendGiftState(uid) {
  const u = db.users[uid]; if (!u) return;
  const st = giftState(u);
  clientsOf(uid).forEach((c) => c.send({ t: 'giftState', gift: st }));
}
function giftMatch() {
  // 기다리는 사람(먼저 온 순서)에게, 자기 것이 아닌 선물을 랜덤으로 하나씩 전해줘요
  const gd = db.gifts;
  for (let i = 0; i < gd.waiting.length; i++) {
    const uid = gd.waiting[i];
    const cands = gd.pool.filter((g) => g.from !== uid);
    if (!cands.length) continue;
    const g = cands[Math.floor(Math.random() * cands.length)];
    gd.pool.splice(gd.pool.indexOf(g), 1);
    gd.waiting.splice(i, 1); i--;
    const u = db.users[uid]; if (!u) continue;
    u.gifts = Array.isArray(u.gifts) ? u.gifts : [];
    u.gifts.unshift({ id: g.id, from: g.anon ? null : g.nick, wrap: g.wrap, rib: g.rib, ts: Date.now(), opened: false });
    while (u.gifts.length > GIFT_KEEP) {
      // 넘치면 이미 열어 본 것 중 가장 오래된 것부터 빼요 (안 연 선물은 최대한 지켜요)
      let k = -1;
      for (let j = u.gifts.length - 1; j >= 0; j--) if (u.gifts[j].opened) { k = j; break; }
      if (k < 0) k = u.gifts.length - 1;
      delImg(u.gifts.splice(k, 1)[0].id);
    }
    sendGiftState(uid);
    clientsOf(uid).forEach((c) => c.send({ t: 'giftArrived' }));
    clientsOf(g.from).forEach((c) => c.send({ t: 'toast', msg: '🎁 내가 넣은 선물이 누군가에게 도착했어요!' }));
    const sys = { kind: 'sys', text: `🎁 ${u.nick} 님에게 선물이 도착했어요!`, ts: Date.now() };
    pushHistory(sys); broadcast({ t: 'sys', ...sys });
  }
}
async function handleGift(client, p, msg) {
  const user = db.users[p.uid];
  if (!user) return;
  const gd = db.gifts;
  const toast = (m) => client.send({ t: 'toast', msg: m });
  if (msg.act === 'send') {
    if (gd.waiting.includes(p.uid)) return toast('먼저 넣은 선물의 교환을 기다리는 중이에요 🎁');
    const now = Date.now();
    if (now - (client.lastGift || 0) < 5000) return;
    const img = String(msg.img || '');
    if (!/^data:image\/(png|webp|jpeg);base64,[A-Za-z0-9+/=]+$/.test(img) || img.length > 450000) return toast('그림을 보내지 못했어요. 다시 해 봐요');
    client.lastGift = now;
    const id = 'g' + Date.now().toString(36) + (gd.next++);
    try { await putImg(id, img); } catch (e) { console.error('선물 저장 실패', e.message); return toast('선물을 저장하지 못했어요. 잠시 뒤에 다시 해 봐요'); }
    gd.pool.push({ id, from: p.uid, nick: p.nick, anon: !!msg.anon, wrap: WRAPS.includes(msg.wrap) ? msg.wrap : 'red', rib: RIBS.includes(msg.rib) ? msg.rib : 'gold', ts: now });
    gd.waiting.push(p.uid);
    const sys = { kind: 'sys', text: `🎁 ${p.nick} 님이 선물 교환 상자에 선물을 넣었어요`, ts: now };
    pushHistory(sys); broadcast({ t: 'sys', ...sys });
    giftMatch();
    saveDb();
    sendGiftState(p.uid);
    client.send({ t: 'giftSent', got: !gd.waiting.includes(p.uid) });
    broadcast({ t: 'giftPool', n: gd.pool.length });
  } else if (msg.act === 'open' || msg.act === 'view') {
    const g = (user.gifts || []).find((x) => x.id === msg.id);
    if (!g) return;
    if (!g.opened) { g.opened = true; saveDb(); sendGiftState(p.uid); }
    const img = await getImg(g.id);
    client.send({ t: 'giftOpen', id: g.id, img, from: g.from, wrap: g.wrap, rib: g.rib, first: msg.act === 'open' });
  } else if (msg.act === 'toss') {
    const i = (user.gifts || []).findIndex((x) => x.id === msg.id);
    if (i < 0) return;
    delImg(user.gifts.splice(i, 1)[0].id); saveDb(); sendGiftState(p.uid);
  }
}

// ───────────────────────── ⛄ 눈사람 (눈마당에 세워 두면 저장돼요) ─────────────────────────
const SNOW_SPOTS = [[72, 505], [575, 540], [700, 600], [795, 575], [965, 598], [300, 470]]; // 서로 겹치지 않게 마당 곳곳에
function snowRelayout() { // 자리 배치가 바뀌면 원래 있던 눈사람도 새 자리로 옮겨요
  const men = db.snow.men.slice(-SNOW_SPOTS.length);
  men.forEach((m, i) => { m.spot = i; [m.x, m.y] = SNOW_SPOTS[i]; });
  db.snow.men = men;
}
const SM = {
  hat: ['none', 'beanie', 'santa', 'top', 'bucket', 'muffs', 'bow'],
  scarf: ['none', 'red', 'green', 'blue', 'pink', 'stripe'],
  eyes: ['coal', 'sparkle', 'happy', 'sleepy', 'wink'],
  nose: ['carrot', 'round', 'button'],
  mouth: ['smile', 'coal', 'open', 'cat', 'tongue'],
  arms: ['twig', 'mitten', 'none'],
  buttons: ['coal', 'color', 'none'],
};
function cleanSnowman(o) {
  if (!o || typeof o !== 'object') return null;
  const pick = (k) => (SM[k].includes(o[k]) ? o[k] : SM[k][0]);
  const sz = Array.isArray(o.sz) ? o.sz : [];
  const lv = o.lv === 2 ? 2 : 3;
  const out = { lv, sz: [clampN(sz[0], 34, 52), clampN(sz[1], 24, 40), clampN(sz[2], 18, 58)] };
  for (const k of Object.keys(SM)) out[k] = pick(k);
  out.blush = !!o.blush;
  out.name = String(o.name || '').replace(/[\u0000-\u001f]/g, '').trim().slice(0, 10) || '눈사람';
  return out;
}
function handleSnowman(client, p, msg) {
  const sn = db.snow;
  const now = Date.now();
  if (now - (client.lastSnow || 0) < 1500) return;
  client.lastSnow = now;
  if (msg.act === 'build') {
    const sm = cleanSnowman(msg.sm);
    if (!sm) return;
    const mine = sn.men.find((m) => m.uid === p.uid);
    if (mine) Object.assign(mine, sm, { nick: p.nick }); // 내 눈사람은 하나 → 고쳐 세워요
    else {
      const used = new Set(sn.men.map((m) => m.spot));
      let spot = SNOW_SPOTS.findIndex((_, i) => !used.has(i));
      if (spot < 0) { const old = sn.men.shift(); spot = old.spot; } // 꽉 차면 가장 오래된 눈사람이 녹아요
      const [x, y] = SNOW_SPOTS[spot];
      sn.men.push({ ...sm, id: sn.next++, uid: p.uid, nick: p.nick, spot, x, y, ts: now });
      const sys = { kind: 'sys', text: `⛄ ${p.nick} 님이 눈마당에 눈사람 "${sm.name}"을(를) 세웠어요`, ts: now };
      pushHistory(sys); broadcast({ t: 'sys', ...sys });
    }
  } else if (msg.act === 'del') {
    const i = sn.men.findIndex((m) => m.uid === p.uid);
    if (i < 0) return;
    sn.men.splice(i, 1);
  } else return;
  saveDb();
  broadcast({ t: 'snowmen', men: sn.men });
}

// ───────────────────────── 🛷 썰매 경주 (연타 미니게임) ─────────────────────────
const RACE_MAX = 6, RACE_GOAL = 100, RACE_STEP = 1.25;
let race = { stage: 'idle', host: null, racers: [], bets: {}, startAt: 0, endAt: 0, results: [] };
let raceDirty = false, raceTick = null;
function racePub() {
  return {
    stage: race.stage, host: race.host, bets: race.bets, results: race.results,
    racers: race.racers.map((r) => ({ uid: r.uid, nick: r.nick, avatar: r.avatar, pos: Math.round(r.pos * 10) / 10, place: r.gaveUp ? 0 : r.place || 0, gaveUp: !!r.gaveUp })),
    cd: race.stage === 'count' ? Math.max(0, race.startAt - Date.now()) : 0,
  };
}
function raceSend() { broadcast({ t: 'race', race: racePub() }); }
function raceFlush() { if (raceDirty) { raceDirty = false; raceSend(); } }
function raceFinish() {
  if (race.stage !== 'run') return;
  race.stage = 'done';
  clearInterval(raceTick); raceTick = null;
  const ranked = race.racers.slice().sort((a, b) => (a.gaveUp ? 1 : 0) - (b.gaveUp ? 1 : 0) || (a.place || 99) - (b.place || 99) || b.pos - a.pos);
  race.results = ranked.map((r, i) => ({ uid: r.uid, nick: r.nick, place: i + 1, done: !!r.place && !r.gaveUp, gaveUp: !!r.gaveUp }));
  const win = ranked.find((r) => !r.gaveUp);
  if (win && race.racers.length > 1) {
    // 1등 + 1등을 맞힌 사람은 황금 마시멜로를 받아요 (인벤토리에 자리가 있으면)
    const lucky = [win.uid, ...Object.entries(race.bets).filter(([, v]) => v === win.uid).map(([k]) => k)];
    for (const uid of new Set(lucky)) {
      const u = db.users[uid];
      if (!u) continue;
      u.inv = Array.isArray(u.inv) ? u.inv : [];
      if (u.inv.length >= INV_SIZE) continue;
      const item = { k: 'mallow', q: 'perfect' };
      u.inv.push(item);
      clientsOf(uid).forEach((c) => { c.send({ t: 'inv', inv: u.inv, added: item }); c.send({ t: 'toast', msg: uid === win.uid ? '🏆 1등 상품! 황금 마시멜로를 받았어요' : '🎯 내기 성공! 황금 마시멜로를 받았어요' }); });
    }
    saveDb();
    const right = Object.entries(race.bets).filter(([, v]) => v === win.uid).length;
    const sys = { kind: 'sys', text: `🛷 썰매 경주 1등은 ${win.nick} 님! 🏆${right ? ` (맞힌 사람 ${right}명)` : ''}`, ts: Date.now() };
    pushHistory(sys); broadcast({ t: 'sys', ...sys });
    notice('race', `🏆 썰매 경주 1등은 ${win.nick} 님이에요!`);
  }
  raceSend();
}
function raceLeave(uid) {
  if (race.stage !== 'lobby' && race.stage !== 'count') return;
  const i = race.racers.findIndex((r) => r.uid === uid);
  if (i >= 0) race.racers.splice(i, 1);
  delete race.bets[uid];
  for (const [k, v] of Object.entries(race.bets)) if (v === uid) delete race.bets[k];
  if (!race.racers.length) { race = { stage: 'idle', host: null, racers: [], bets: {}, startAt: 0, endAt: 0, results: [] }; }
  else if (race.host === uid) race.host = race.racers[0].uid;
  raceSend();
}
function handleRace(client, p, msg) {
  const now = Date.now();
  const toast = (m) => client.send({ t: 'toast', msg: m });
  const me = race.racers.find((r) => r.uid === p.uid);
  switch (msg.act) {
    case 'open':
      if (race.stage === 'lobby' || race.stage === 'count' || race.stage === 'run') return toast('이미 경주가 열려 있어요');
      race = { stage: 'lobby', host: p.uid, racers: [{ uid: p.uid, nick: p.nick, avatar: p.avatar, pos: 0 }], bets: {}, startAt: 0, endAt: 0, results: [] };
      notice('race', `🛷 ${p.nick} 님이 썰매 경주를 열었어요! 같이 달리거나 1등을 맞혀 봐요`);
      break;
    case 'join':
      if (race.stage !== 'lobby' || me) return;
      if (race.racers.length >= RACE_MAX) return toast(`썰매는 ${RACE_MAX}대까지예요`);
      delete race.bets[p.uid];
      race.racers.push({ uid: p.uid, nick: p.nick, avatar: p.avatar, pos: 0 });
      break;
    case 'leave': return raceLeave(p.uid);
    case 'giveup': {
      if (race.stage !== 'run' || !me || me.place) return;
      me.gaveUp = true; me.place = 99;
      if (race.racers.every((r) => r.place)) { raceFinish(); return; }
      break;
    }
    case 'bet': {
      if ((race.stage !== 'lobby' && race.stage !== 'count') || me) return;
      if (!race.racers.some((r) => r.uid === msg.uid)) return;
      race.bets[p.uid] = msg.uid;
      break;
    }
    case 'start':
      if (race.stage !== 'lobby' || race.host !== p.uid) return;
      race.stage = 'count'; race.startAt = now + 3200;
      race.racers.forEach((r) => { r.pos = 0; r.place = 0; });
      setTimeout(() => {
        if (race.stage !== 'count') return;
        race.stage = 'run'; race.endAt = Date.now() + 45000; race.places = 0;
        raceTick = setInterval(() => {
          raceFlush();
          if (race.stage === 'run' && Date.now() > race.endAt) raceFinish();
        }, 100);
        raceSend();
      }, 3200);
      break;
    case 'tap': {
      if (race.stage !== 'run' || !me || me.place) return;
      client.taps = (client.taps || []).filter((t) => now - t < 1000);
      if (client.taps.length >= 14) return; // 1초에 14번까지만 쳐요 (자동 연타 방지)
      client.taps.push(now);
      me.pos = Math.min(RACE_GOAL, me.pos + RACE_STEP);
      if (me.pos >= RACE_GOAL) {
        me.place = ++race.places;
        if (me.place === 1) race.endAt = Math.min(race.endAt, now + 8000); // 1등이 들어오면 8초 뒤 끝나요
        if (race.racers.every((r) => r.place)) { raceFlush(); raceDirty = true; raceFinish(); return; }
      }
      raceDirty = true;
      return;
    }
    case 'reset':
      if (race.stage !== 'done') return;
      race = { stage: 'idle', host: null, racers: [], bets: {}, startAt: 0, endAt: 0, results: [] };
      break;
    default: return;
  }
  raceSend();
}

// ───────────────────────── ❄️ 눈싸움 팀전 ─────────────────────────
const FIGHT_TIME = 60000, FIGHT_MAX = 8;
const newFight = () => ({ stage: 'idle', host: null, red: [], blue: [], score: { red: 0, blue: 0 }, hits: {}, endAt: 0, winner: null, mvp: null });
let fight = newFight(), fightTimer = null;
function fightPub() {
  return { stage: fight.stage, host: fight.host, red: fight.red, blue: fight.blue, score: fight.score, hits: fight.hits,
    left: fight.stage === 'run' ? Math.max(0, fight.endAt - Date.now()) : 0, winner: fight.winner, mvp: fight.mvp };
}
const fightSend = () => broadcast({ t: 'fight', fight: fightPub() });
const teamOf = (uid) => (fight.red.some((m) => m.uid === uid) ? 'red' : fight.blue.some((m) => m.uid === uid) ? 'blue' : null);
function fightLeave(uid) {
  if (fight.stage !== 'lobby') return;
  fight.red = fight.red.filter((m) => m.uid !== uid);
  fight.blue = fight.blue.filter((m) => m.uid !== uid);
  if (!fight.red.length && !fight.blue.length) fight = newFight();
  else if (fight.host === uid) fight.host = (fight.red[0] || fight.blue[0]).uid;
  fightSend();
}
function fightHit(p, target) {
  if (fight.stage !== 'run' || p.room !== 'out' || target.room !== 'out') return;
  const a = teamOf(p.uid), b = teamOf(target.uid);
  if (!a || !b || a === b) return;
  fight.score[a]++;
  fight.hits[p.uid] = (fight.hits[p.uid] || 0) + 1;
  broadcast({ t: 'fightHit', from: p.id, to: target.id, team: a });
  fightSend();
}
function fightEnd() {
  if (fight.stage !== 'run') return;
  clearTimeout(fightTimer);
  fight.stage = 'done';
  const { red, blue } = fight.score;
  fight.winner = red > blue ? 'red' : blue > red ? 'blue' : 'draw';
  const all = [...fight.red, ...fight.blue];
  const best = all.reduce((a, m) => ((fight.hits[m.uid] || 0) > (a ? fight.hits[a.uid] || 0 : -1) ? m : a), null);
  fight.mvp = best && fight.hits[best.uid] ? { uid: best.uid, nick: best.nick, hits: fight.hits[best.uid] } : null;
  const txt = fight.winner === 'draw' ? `❄️ 눈싸움 끝! ${red} : ${blue} 무승부예요` : `❄️ 눈싸움 끝! ${fight.winner === 'red' ? '🔴 빨강팀' : '🔵 파랑팀'} 승리 (${red} : ${blue})`;
  const sys = { kind: 'sys', text: txt + (fight.mvp ? ` · MVP ${fight.mvp.nick} 님 (${fight.mvp.hits}번 명중)` : ''), ts: Date.now() };
  pushHistory(sys); broadcast({ t: 'sys', ...sys });
  notice('fight', txt);
  fightSend();
}
function handleFight(client, p, msg) {
  const toast = (m) => client.send({ t: 'toast', msg: m });
  switch (msg.act) {
    case 'open':
      if (fight.stage === 'lobby' || fight.stage === 'run') return toast('이미 눈싸움이 열려 있어요');
      fight = newFight(); fight.stage = 'lobby'; fight.host = p.uid; fight.red.push({ uid: p.uid, nick: p.nick });
      notice('fight', `❄️ ${p.nick} 님이 눈싸움 팀전을 열었어요! 눈마당에서 팀을 골라요`);
      break;
    case 'join': {
      if (fight.stage !== 'lobby') return;
      const team = msg.team === 'blue' ? 'blue' : 'red';
      if (teamOf(p.uid) === team) return;
      if (fight[team].length >= FIGHT_MAX) return toast('그 팀은 꽉 찼어요');
      fight.red = fight.red.filter((m) => m.uid !== p.uid); fight.blue = fight.blue.filter((m) => m.uid !== p.uid);
      fight[team].push({ uid: p.uid, nick: p.nick });
      break;
    }
    case 'leave': return fightLeave(p.uid);
    case 'giveup': {
      if (fight.stage !== 'run' || !teamOf(p.uid)) return;
      fight.red = fight.red.filter((m) => m.uid !== p.uid); fight.blue = fight.blue.filter((m) => m.uid !== p.uid);
      const sys = { kind: 'sys', text: `❄️ ${p.nick} 님이 눈싸움에서 빠졌어요`, ts: Date.now() };
      pushHistory(sys); broadcast({ t: 'sys', ...sys });
      if (!fight.red.length || !fight.blue.length) { fightEnd(); return; }
      break;
    }
    case 'shuffle': {
      if (fight.stage !== 'lobby' || fight.host !== p.uid) return;
      const all = [...fight.red, ...fight.blue].sort(() => Math.random() - 0.5);
      fight.red = all.filter((_, i) => i % 2 === 0); fight.blue = all.filter((_, i) => i % 2 === 1);
      break;
    }
    case 'start':
      if (fight.stage !== 'lobby' || fight.host !== p.uid) return;
      if (!fight.red.length || !fight.blue.length) return toast('양쪽 팀에 한 명씩은 있어야 해요');
      fight.stage = 'run'; fight.endAt = Date.now() + FIGHT_TIME; fight.score = { red: 0, blue: 0 }; fight.hits = {};
      fightTimer = setTimeout(fightEnd, FIGHT_TIME);
      notice('fight', '❄️ 눈싸움 시작! 상대 팀 친구를 눌러서 눈덩이를 던져요');
      break;
    case 'reset':
      if (fight.stage !== 'done') return;
      fight = newFight();
      break;
    default: return;
  }
  fightSend();
}

// ───────────────────────── 🏰 다 같이 눈성 쌓기 (16칸 × 8층, 저장돼요) ─────────────────────────
const CASTLE_W = 16, CASTLE_H = 8, CASTLE_MINE = 24;
const CASTLE_K = { brick: [''], ice: [''], crenel: [''], arch: [''], window: [''], stair: ['l', 'r'], roof: ['red', 'blue', 'purple'], flag: ['red', 'blue', 'gold', 'pink'], icicle: [''], flake: [''] };
const SOLID = new Set(['brick', 'ice', 'crenel', 'arch', 'window', 'stair']);
function handleCastle(client, p, msg) {
  const cells = db.castle.cells;
  const now = Date.now();
  if (now - (client.lastCastle || 0) < 120) return;
  client.lastCastle = now;
  const c = Number(msg.c), r = Number(msg.r);
  if (!(c >= 0 && c < CASTLE_W && r >= 0 && r < CASTLE_H) || !Number.isInteger(c) || !Number.isInteger(r)) return;
  const key = `${c},${r}`, below = cells[`${c},${r - 1}`], above = cells[`${c},${r + 1}`];
  const toast = (m) => client.send({ t: 'toast', msg: m });
  if (msg.act === 'place') {
    const opts = CASTLE_K[msg.k];
    if (!opts || cells[key]) return;
    if (Object.values(cells).filter((x) => x.uid === p.uid).length >= CASTLE_MINE) return toast(`블록은 한 사람당 ${CASTLE_MINE}개까지예요`);
    if (msg.k === 'icicle') { if (!above || !SOLID.has(above.k)) return toast('고드름은 블록 아래에 매달아요'); }
    else if (r > 0 && (!below || !SOLID.has(below.k))) return toast('바닥이나 블록 위에 쌓아요 🧱');
    cells[key] = { k: msg.k, v: opts.includes(msg.v) ? msg.v : opts[0], uid: p.uid, nick: p.nick };
  } else if (msg.act === 'remove') {
    const o = cells[key];
    if (!o || o.uid !== p.uid) return;
    if ((above && above.k !== 'icicle' && SOLID.has(o.k)) || (above && above.k === 'icicle' && false)) return toast('위에 쌓인 블록부터 치워야 해요');
    const under = cells[`${c},${r - 1}`];
    if (under && under.k === 'icicle' && SOLID.has(o.k)) delete cells[`${c},${r - 1}`]; // 매달린 고드름은 같이 떨어져요
    delete cells[key];
  } else return;
  saveDb();
  broadcast({ t: 'castle', cells });
}

// ───────────────────────── 🛠️ 개발자 모드 ─────────────────────────
function isAdmin(user) { return !!(user && user.admin && user.nick.toLowerCase() === ADMIN_NICK && ADMIN_PW); }
function handleAdmin(client, p, msg) {
  const user = db.users[p.uid];
  if (!isAdmin(user)) return;
  const done = (m) => client.send({ t: 'toast', msg: '🛠️ ' + m });
  switch (msg.act) {
    case 'tree': db.tree = { items: [], top: 'star', next: 1 }; broadcast({ t: 'tree', tree: db.tree }); done('트리를 처음 상태로 돌렸어요'); break;
    case 'snowmen': db.snow = { men: [], next: db.snow.next || 1 }; broadcast({ t: 'snowmen', men: [] }); done('눈사람을 모두 녹였어요'); break;
    case 'castle': db.castle = { cells: {} }; broadcast({ t: 'castle', cells: {} }); done('눈성을 허물었어요'); break;
    case 'gifts':
      db.gifts.pool.forEach((g) => delImg(g.id)); db.gifts.pool = []; db.gifts.waiting = [];
      broadcast({ t: 'giftPool', n: 0 }); players.forEach((q) => sendGiftState(q.uid)); done('선물 교환 상자를 비웠어요'); break;
    case 'cake': cake = newCake(); cakeBroadcast(); done('케이크를 처음 상태로 돌렸어요'); break;
    case 'games':
      clearInterval(raceTick); raceTick = null; race = { stage: 'idle', host: null, racers: [], bets: {}, startAt: 0, endAt: 0, results: [] }; raceSend();
      clearTimeout(fightTimer); fight = newFight(); fightSend();
      if (typeof resetExtraGames === 'function') resetExtraGames();
      done('진행 중인 미니게임을 모두 멈췄어요'); break;
    case 'chat': history.length = 0; broadcast({ t: 'clearChat' }); done('채팅 기록을 지웠어요'); break;
    default: return;
  }
  const sys = { kind: 'sys', text: '🛠️ 개발자가 정리했어요', ts: Date.now() };
  if (msg.act !== 'chat') { pushHistory(sys); broadcast({ t: 'sys', ...sys }); }
  saveDb();
}

// ───────────────────────── 메시지 처리 ─────────────────────────
function handle(client, msg) {
  if (!msg || typeof msg.t !== 'string') return;
  const p = client.player;

  switch (msg.t) {
    case 'signup': {
      const nick = String(msg.nick || '').trim();
      if (!validNick(nick)) return client.send({ t: 'authErr', msg: '닉네임은 공백 없이 2~12자로 지어주세요.' });
      if (!validPw(msg.pw)) return client.send({ t: 'authErr', msg: '비밀번호는 4자 이상이에요.' });
      if (findUserByNick(nick)) return client.send({ t: 'authErr', msg: '이미 누가 쓰고 있는 닉네임이에요 🥲' });
      const isAdminNick = nick.toLowerCase() === ADMIN_NICK;
      if (isAdminNick && !adminPwOk(msg.pw)) return client.send({ t: 'authErr', msg: '이 닉네임은 쓸 수 없어요 🙅' });
      const salt = crypto.randomBytes(16).toString('hex');
      const user = {
        id: crypto.randomUUID(), nick, salt, hash: hashPw(msg.pw, salt),
        avatar: randomAvatar(), created: Date.now(),
      };
      if (isAdminNick) user.admin = true;
      db.users[user.id] = user;
      saveDb();
      client.send({ t: 'authOk', token: newToken(user.id), isNew: true });
      return enterRoom(client, user);
    }
    case 'login': {
      const user = findUserByNick(String(msg.nick || '').trim());
      if (user && user.nick.toLowerCase() === ADMIN_NICK) {
        // 개발자 계정은 서버에 정해 둔 비밀번호로만 들어와요
        if (!adminPwOk(msg.pw)) return client.send({ t: 'authErr', msg: '닉네임이나 비밀번호가 달라요.' });
        if (!user.admin || !checkPw(user, msg.pw)) { user.admin = true; user.salt = crypto.randomBytes(16).toString('hex'); user.hash = hashPw(msg.pw, user.salt); saveDb(); }
      } else if (!user || !validPw(msg.pw) || !checkPw(user, msg.pw))
        return client.send({ t: 'authErr', msg: '닉네임이나 비밀번호가 달라요.' });
      client.send({ t: 'authOk', token: newToken(user.id) });
      return enterRoom(client, user);
    }
    case 'auth': {
      const uid = db.tokens[msg.token];
      const user = uid && db.users[uid];
      if (!user) return client.send({ t: 'authFail' });
      client.token = msg.token;
      return enterRoom(client, user);
    }
  }

  if (!p) return; // 아래부터는 로그인한 사람만

  switch (msg.t) {
    case 'move': {
      const x = clamp(Number(msg.x) || 0, ROOM.minX, ROOM.maxX);
      const y = clamp(Number(msg.y) || 0, ROOM.minY, ROOM.maxY);
      if (x !== p.x) p.facing = x < p.x ? -1 : 1;
      p.x = x; p.y = y;
      leaveSeat(p);
      broadcast({ t: 'move', id: p.id, x, y, facing: p.facing, mode: msg.mode === 'step' ? 'step' : 'walk' }, client);
      break;
    }
    case 'sit': {
      const seat = SEATS[msg.seat];
      if (!seat || seatRoom(msg.seat) !== (p.room || 'in')) return;
      const owner = seatOwner[msg.seat];
      if (owner && owner !== p.id) return client.send({ t: 'toast', msg: '거긴 이미 누가 앉아 있어요 🙈' });
      leaveSeat(p);
      seatOwner[msg.seat] = p.id;
      if (seat.x !== p.x) p.facing = seat.x < p.x ? -1 : 1;
      p.seat = msg.seat; p.x = seat.x; p.y = seat.y;
      broadcast({ t: 'sit', id: p.id, seat: msg.seat, x: p.x, y: p.y, facing: p.facing });
      break;
    }
    case 'stand': {
      if (!p.seat) return;
      leaveSeat(p);
      p.y = clamp(p.y + 30, ROOM.minY, ROOM.maxY);
      broadcast({ t: 'stand', id: p.id, x: p.x, y: p.y });
      break;
    }
    case 'chat': {
      const text = String(msg.text || '').replace(/\s+/g, ' ').trim().slice(0, 120);
      if (!text) return;
      const now = Date.now();
      client.chatTimes = (client.chatTimes || []).filter((t) => now - t < 5000);
      if (client.chatTimes.length >= 6) return client.send({ t: 'toast', msg: '조금 천천히 말해줘요 ☃️' });
      client.chatTimes.push(now);
      const entry = { kind: 'chat', id: p.id, nick: p.nick, avatar: p.avatar, text, ts: now };
      pushHistory(entry);
      broadcast({ t: 'chat', ...entry });
      break;
    }
    case 'emote': {
      const e = ['❤️', '🎄', '⛄', '😆', '🎁', '✨'].includes(msg.e) ? msg.e : null;
      if (e) broadcast({ t: 'emote', id: p.id, e });
      break;
    }
    case 'profile': {
      const user = db.users[p.uid];
      if (!user) return;
      if (msg.avatar !== undefined) {
        const a = cleanAvatar(msg.avatar);
        if (!a) return client.send({ t: 'profileErr', msg: '캐릭터 정보가 이상해요.' });
        user.avatar = a;
      }
      if (msg.nick !== undefined && msg.nick.trim() !== user.nick) {
        const nick = String(msg.nick).trim();
        if (!validNick(nick)) return client.send({ t: 'profileErr', msg: '닉네임은 공백 없이 2~12자로 지어주세요.' });
        const other = findUserByNick(nick);
        if (other && other.id !== user.id) return client.send({ t: 'profileErr', msg: '이미 누가 쓰고 있는 닉네임이에요.' });
        user.nick = nick;
      }
      if (msg.newPw !== undefined) {
        if (!validPw(msg.oldPw) || !checkPw(user, msg.oldPw)) return client.send({ t: 'profileErr', msg: '지금 비밀번호가 맞지 않아요.' });
        if (!validPw(msg.newPw)) return client.send({ t: 'profileErr', msg: '새 비밀번호는 4자 이상이에요.' });
        user.salt = crypto.randomBytes(16).toString('hex');
        user.hash = hashPw(msg.newPw, user.salt);
      }
      saveDb();
      p.nick = user.nick; p.avatar = normAvatar(user.avatar);
      client.send({ t: 'profileOk', user: publicUser(user) });
      broadcast({ t: 'pupdate', id: p.id, nick: p.nick, avatar: p.avatar });
      break;
    }
    case 'jump':
    case 'snow':
    case 'angel':
    case 'fw':
    case 'throw': {
      // 너무 자주 못 하게: 3초에 8번까지
      const now = Date.now();
      client.fxTimes = (client.fxTimes || []).filter((t) => now - t < 3000);
      if (client.fxTimes.length >= 8) return;
      client.fxTimes.push(now);
      if (msg.t === 'throw') {
        const target = players.get(Number(msg.to));
        if (!target || target.id === p.id || target.room !== p.room) return;
        p.facing = target.x < p.x ? -1 : 1;
        broadcast({ t: 'throw', from: p.id, to: target.id });
        fightHit(p, target);
      } else {
        broadcast({ t: msg.t, id: p.id });
      }
      break;
    }
    case 'go': {
      // 거실 ↔ 눈마당
      const room = msg.room === 'out' ? 'out' : 'in';
      if (room === p.room) return;
      leaveSeat(p);
      p.room = room;
      const d = DOOR[room];
      p.x = d.x + Math.round(Math.random() * 40 - 20); p.y = d.y + Math.round(Math.random() * 20);
      broadcast({ t: 'go', id: p.id, room, x: p.x, y: p.y });
      break;
    }
    case 'snowman': handleSnowman(client, p, msg); break;
    case 'race': handleRace(client, p, msg); break;
    case 'fight': handleFight(client, p, msg); break;
    case 'castle': handleCastle(client, p, msg); break;
    case 'admin': handleAdmin(client, p, msg); break;
    case 'cake': handleCake(client, p, msg); break;
    case 'tree': handleTree(client, p, msg); break;
    case 'gift': handleGift(client, p, msg).catch((e) => console.error(e)); break;
    case 'craft': {
      // 주방에서 만든 음식 → 인벤토리 (4칸)
      const user = db.users[p.uid];
      if (!user) return;
      const now = Date.now();
      if (now - (client.lastCraft || 0) < 2500) return;
      const item = cleanItem(msg.item);
      if (!item) return;
      user.inv = Array.isArray(user.inv) ? user.inv : [];
      if (user.inv.length >= INV_SIZE) return client.send({ t: 'toast', msg: '인벤토리가 꽉 찼어요! 먼저 하나 먹거나 버려요 🎒' });
      client.lastCraft = now;
      user.inv.push(item);
      saveDb();
      client.send({ t: 'inv', inv: user.inv, added: item });
      break;
    }
    case 'useItem': {
      const user = db.users[p.uid];
      const i = Number(msg.slot);
      if (!user || !Array.isArray(user.inv) || !(i >= 0 && i < user.inv.length)) return;
      const [item] = user.inv.splice(i, 1);
      saveDb();
      client.send({ t: 'inv', inv: user.inv });
      if (p.heldSlot === i) {
        p.held = null; p.heldSlot = -1;
        if (msg.how !== 'eat') broadcast({ t: 'hold', id: p.id, item: null });
      } else if (p.heldSlot > i) p.heldSlot--;
      if (msg.how === 'eat') {
        broadcast({ t: 'eatItem', id: p.id, item });
        const sys = { kind: 'sys', text: `${p.nick} 님이 ${itemName(item)}을(를) ${item.k === 'cocoa' ? '마셨어요 ☕' : '먹었어요 😋'}`, ts: now0() };
        pushHistory(sys);
        broadcast({ t: 'sys', ...sys });
      }
      break;
    }
    case 'hold': {
      // 인벤토리 음식을 손에 들기 / 내려놓기 (모두에게 보여요)
      const user = db.users[p.uid];
      const i = Number(msg.slot);
      if (!user || !Array.isArray(user.inv)) return;
      if (i >= 0 && i < user.inv.length) { p.held = user.inv[i]; p.heldSlot = i; }
      else { p.held = null; p.heldSlot = -1; }
      broadcast({ t: 'hold', id: p.id, item: p.held });
      client.send({ t: 'heldSlot', slot: p.heldSlot });
      break;
    }
    case 'hb': break; // 연결 유지용
    case 'logout': {
      if (client.token) { delete db.tokens[client.token]; saveDb(); }
      removePlayer(client);
      break;
    }
  }
}

// ───────────────────────── 아주 작은 WebSocket 구현 ─────────────────────────
class Client {
  constructor(socket) {
    this.socket = socket;
    this.buf = Buffer.alloc(0);
    this.frags = [];
    this.alive = true;
    socket.on('data', (d) => this.onData(d));
    socket.on('close', () => this.onClose());
    socket.on('error', () => this.onClose());
  }
  onData(d) {
    this.buf = Buffer.concat([this.buf, d]);
    if (this.buf.length > 1 << 20) return this.close();
    while (this.buf.length >= 2) {
      const b0 = this.buf[0], b1 = this.buf[1];
      const fin = (b0 & 0x80) !== 0;
      const op = b0 & 0x0f;
      const masked = (b1 & 0x80) !== 0;
      let len = b1 & 0x7f, off = 2;
      if (len === 126) { if (this.buf.length < 4) return; len = this.buf.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (this.buf.length < 10) return; len = Number(this.buf.readBigUInt64BE(2)); off = 10; }
      if (len > 600000) return this.close(); // 선물 그림 때문에 조금 넉넉하게
      const need = off + (masked ? 4 : 0) + len;
      if (this.buf.length < need) return;
      let payload = this.buf.subarray(off + (masked ? 4 : 0), need);
      if (masked) {
        const mask = this.buf.subarray(off, off + 4);
        payload = Buffer.from(payload);
        for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i & 3];
      }
      this.buf = this.buf.subarray(need);

      if (op === 0x8) return this.close();
      if (op === 0x9) { this.frame(0xA, payload); continue; }
      if (op === 0xA) { this.alive = true; continue; }
      if (op === 0x1 || op === 0x0) {
        this.frags.push(payload);
        if (fin) {
          const text = Buffer.concat(this.frags).toString('utf8');
          this.frags = [];
          let msg; try { msg = JSON.parse(text); } catch (_) { continue; }
          try { handle(this, msg); } catch (e) { console.error(e); }
        }
      }
    }
  }
  frame(op, payload) {
    if (this.closed) return;
    const len = payload.length;
    let head;
    if (len < 126) head = Buffer.from([0x80 | op, len]);
    else if (len < 65536) { head = Buffer.alloc(4); head[0] = 0x80 | op; head[1] = 126; head.writeUInt16BE(len, 2); }
    else { head = Buffer.alloc(10); head[0] = 0x80 | op; head[1] = 127; head.writeBigUInt64BE(BigInt(len), 2); }
    this.socket.write(Buffer.concat([head, payload]));
  }
  sendRaw(s) { this.frame(0x1, Buffer.from(s, 'utf8')); }
  send(obj) { this.sendRaw(JSON.stringify(obj)); }
  close() {
    if (this.closed) return;
    try { this.frame(0x8, Buffer.alloc(0)); } catch (_) {}
    this.closed = true;
    this.socket.end();
    this.onClose();
  }
  onClose() {
    this.closed = true;
    removePlayer(this);
  }
}

// ───────────────────────── 캐롤 BGM (무료 음원을 서버가 내려받아 제공) ─────────────────────────
// 모두 OpenGameArt.org 에서 자유 이용 라이선스로 공개된 곡이에요. 출처는 화면과 README에 표시해요.
const MUSIC = [
  { id: 'jingle-bells', title: 'Jingle Bells', artist: 'ChristmasSongs', license: 'CC0',
    page: 'https://opengameart.org/content/jingle-bells', src: 'https://opengameart.org/sites/default/files/JingleBells_0.mp3', ext: 'mp3' },
  { id: 'deck-the-halls', title: 'Deck the Halls', artist: 'Dizzy Crow (Daniel Michel)', license: 'CC-BY 4.0',
    page: 'https://opengameart.org/node/87526', src: 'https://opengameart.org/sites/default/files/Deck%20the%20Halls_0.ogg', ext: 'ogg' },
  { id: 'we-three-kings', title: 'We Three Kings', artist: 'ChristmasSongs', license: 'CC0',
    page: 'https://opengameart.org/content/we-three-kings', src: 'https://opengameart.org/sites/default/files/WeThreeKings.mp3', ext: 'mp3' },
  { id: 'tchaikovsky-december', title: '12월: 크리스마스 (차이콥스키, 오르골 편곡)', artist: 'Gregor Quendel (악보: Bernd Krueger)', license: 'CC-BY-SA 4.0',
    page: 'https://opengameart.org/content/tchaikovsky-the-seasons-arranged-for-music-box',
    src: 'https://opengameart.org/sites/default/files/tchaikovsky_-_the_seasons_-_december_-_christmas_-_opus_37a_arr._for_music_box.mp3', ext: 'mp3' },
];
const MUSIC_DIR = process.env.MUSIC_DIR || path.join(__dirname, 'music');
const MUSIC_MIME = { mp3: 'audio/mpeg', ogg: 'audio/ogg' };
const musicReady = new Set();

async function prepareMusic() {
  try { fs.mkdirSync(MUSIC_DIR, { recursive: true }); } catch (_) {}
  for (const m of MUSIC) {
    const file = path.join(MUSIC_DIR, `${m.id}.${m.ext}`);
    try {
      if (fs.existsSync(file) && fs.statSync(file).size > 100000) { musicReady.add(m.id); continue; }
      const r = await fetch(m.src, { headers: { 'User-Agent': 'christmas-playroom' } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const buf = Buffer.from(await r.arrayBuffer());
      await fs.promises.writeFile(file + '.part', buf);
      await fs.promises.rename(file + '.part', file);
      musicReady.add(m.id);
    } catch (e) {
      console.log(`   🎵 "${m.title}" 음원을 받지 못했어요 (${e.message})`);
    }
  }
  console.log(`   🎵 캐롤 ${musicReady.size}/${MUSIC.length}곡 준비 완료`);
}

function serveMusic(req, res, id) {
  const m = MUSIC.find((x) => x.id === id);
  if (!m || !musicReady.has(id)) { res.writeHead(404); return res.end(); }
  const file = path.join(MUSIC_DIR, `${m.id}.${m.ext}`);
  let size;
  try { size = fs.statSync(file).size; } catch (_) { res.writeHead(404); return res.end(); }
  const headers = { 'Content-Type': MUSIC_MIME[m.ext], 'Accept-Ranges': 'bytes', 'Cache-Control': 'public, max-age=86400' };
  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
  if (range) {
    let start = range[1] ? parseInt(range[1], 10) : size - parseInt(range[2], 10);
    let end = range[1] && range[2] ? parseInt(range[2], 10) : size - 1;
    if (isNaN(start) || start < 0 || start >= size || end >= size || start > end) {
      res.writeHead(416, { 'Content-Range': `bytes */${size}` }); return res.end();
    }
    res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 });
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { ...headers, 'Content-Length': size });
  fs.createReadStream(file).pipe(res);
}

// ───────────────────────── HTTP (정적 파일) ─────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.json': 'application/json',
};
function lanUrls() {
  const out = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const n of list || []) if (n.family === 'IPv4' && !n.internal) out.push(`http://${n.address}:${PORT}`);
  }
  return out;
}

const server = http.createServer((req, res) => {
  if (req.url === '/healthz') { res.writeHead(200); return res.end('ok'); }
  if (req.url === '/api/music') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(JSON.stringify(MUSIC.filter((m) => musicReady.has(m.id)).map((m) => ({
      id: m.id, title: m.title, artist: m.artist, license: m.license, page: m.page, ext: m.ext, url: `/music/${m.id}.${m.ext}`,
    }))));
  }
  const mm = /^\/music\/([a-z0-9-]+)\.(mp3|ogg)$/.exec((req.url || '').split('?')[0]);
  if (mm) return serveMusic(req, res, mm[1]);
  if (req.url === '/api/share') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(JSON.stringify({ publicUrl, tunnel: tunnelState, lan: lanUrls() }));
  }
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const file = path.normalize(path.join(PUBLIC_DIR, urlPath));
  if (!file.startsWith(PUBLIC_DIR)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
});

server.on('upgrade', (req, socket) => {
  const key = req.headers['sec-websocket-key'];
  if (!key || String(req.headers.upgrade).toLowerCase() !== 'websocket') return socket.destroy();
  const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n' +
    `Sec-WebSocket-Accept: ${accept}\r\n\r\n`
  );
  socket.setNoDelay(true);
  new Client(socket);
});

// 끊긴 연결 정리용 ping
setInterval(() => {
  for (const p of players.values()) {
    const c = p.client;
    if (!c.alive) { c.close(); continue; }
    c.alive = false;
    c.frame(0x9, Buffer.alloc(0));
  }
}, 30000);

// ───────────────────────── 외부 공개 주소 (Cloudflare 빠른 터널) ─────────────────────────
// cloudflared가 있으면 https://xxxx.trycloudflare.com 주소를 자동으로 만들어요.
// 다른 와이파이·LTE에서도 이 주소로 들어올 수 있어요. (서버를 껐다 켜면 주소가 바뀌어요)
let publicUrl = null;
let tunnelState = 'off'; // off | starting | on | failed
let tunnelProc = null;

function findCloudflared() {
  const local = path.join(__dirname, process.platform === 'win32' ? 'cloudflared.exe' : 'cloudflared');
  if (fs.existsSync(local)) return local;
  return 'cloudflared'; // PATH에 설치돼 있으면 사용
}

function printQr(text) {
  try {
    const qrcode = require('./public/vendor/qrcode.js');
    const qr = qrcode(0, 'L');
    qr.addData(text);
    qr.make();
    const n = qr.getModuleCount();
    const dark = (r, c) => r >= 0 && c >= 0 && r < n && c < n && qr.isDark(r, c);
    const lines = [];
    for (let r = -2; r < n + 2; r += 2) {
      let line = '   ';
      for (let c = -2; c < n + 2; c++) {
        const top = dark(r, c), bot = dark(r + 1, c);
        // 어두운 터미널 기준: 밝은 칸을 채워서 그려요
        line += !top && !bot ? '█' : !top ? '▀' : !bot ? '▄' : ' ';
      }
      lines.push(line);
    }
    console.log(lines.join('\n'));
  } catch (_) {}
}

function startTunnel() {
  tunnelState = 'starting';
  console.log('   🌍 외부 공개 주소를 만드는 중… (10초쯤 걸려요)');
  try {
    tunnelProc = spawn(findCloudflared(), ['tunnel', '--url', `http://localhost:${PORT}`, '--no-autoupdate'], {
      stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
    });
  } catch (e) {
    tunnelState = 'failed';
    return;
  }
  const onData = (d) => {
    const m = String(d).match(/https:\/\/(?!api\.)[a-z0-9]+(?:-[a-z0-9]+)+\.trycloudflare\.com/);
    if (m && !publicUrl) {
      publicUrl = m[0];
      tunnelState = 'on';
      console.log('\n   ✨ 어디서든 들어오는 주소:  ' + publicUrl);
      console.log('      (친구한테 이 링크를 보내거나, 아래 QR을 찍게 하면 돼요)\n');
      printQr(publicUrl);
      console.log('\n   끄려면 Ctrl + C\n');
    }
  };
  tunnelProc.stdout.on('data', onData);
  tunnelProc.stderr.on('data', onData);
  tunnelProc.on('error', () => {
    tunnelState = 'failed';
    console.log('   ⚠️  cloudflared를 찾지 못해서 외부 주소는 못 만들었어요. (같은 와이파이에서는 접속 돼요)');
  });
  tunnelProc.on('exit', () => {
    if (tunnelState !== 'failed') console.log('   ⚠️  외부 공개 주소가 닫혔어요. 서버를 다시 켜 주세요.');
    publicUrl = null;
    tunnelState = 'failed';
  });
}
function stopTunnel() { if (tunnelProc) try { tunnelProc.kill(); } catch (_) {} }
process.on('exit', stopTunnel);
process.on('SIGINT', () => { stopTunnel(); process.exit(0); });
process.on('SIGTERM', () => { stopTunnel(); process.exit(0); });

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log(`\n⚠️  ${PORT}번 포트를 이미 다른 프로그램이 쓰고 있어요.`);
    console.log('   놀이방 서버 창이 이미 켜져 있으면 그 창을 쓰거나, 그 창을 닫고 다시 실행해 주세요.\n');
  } else {
    console.log('\n⚠️  서버를 켜지 못했어요:', e.message, '\n');
  }
  stopTunnel();
  process.exitCode = 1;
});

loadDb().then(() => server.listen(PORT, '0.0.0.0', () => {
  console.log('\n🎄  크리스마스 놀이방이 열렸어요!');
  console.log(`   이 컴퓨터에서:   http://localhost:${PORT}`);
  for (const u of lanUrls()) console.log(`   같은 와이파이:   ${u}`);
  console.log(`   계정 저장소:     ${USE_REDIS ? 'Upstash Redis' : 'data/users.json'}  (가입자 ${Object.keys(db.users).length}명)`);
  prepareMusic();
  if (process.argv.includes('--tunnel')) startTunnel();
  else console.log('   끄려면 Ctrl + C\n');
})).catch((e) => {
  console.error('\n⚠️  계정 저장소를 불러오지 못했어요:', e.message);
  process.exit(1);
});
