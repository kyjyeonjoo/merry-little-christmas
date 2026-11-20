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

const ANIMALS = ['bear', 'bunny', 'cat', 'hamster', 'puppy', 'fox', 'sheep', 'penguin'];
const COLORS = ['#ffffff', '#fff1d6', '#ffd6e0', '#ffd9b8', '#d4f2e1', '#d6ebff', '#e6dcff', '#d9b99b', '#d8d8de'];
const ACCS = ['santa', 'scarf', 'antlers', 'ribbon', 'glasses', 'star', 'earmuffs', 'bell', 'mittens'];
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
  armL: { x: 200, y: 395 },
  armR: { x: 800, y: 395 },
  sofa1: { x: 360, y: 578 },
  sofa2: { x: 500, y: 578 },
  sofa3: { x: 640, y: 578 },
  cush1: { x: 380, y: 470 },
  cush2: { x: 620, y: 470 },
  cush3: { x: 500, y: 438 },
  poufL: { x: 105, y: 520 },
  poufR: { x: 895, y: 520 },
};
const seatOwner = {}; // seatId -> playerId
const players = new Map(); // playerId -> { id, uid, nick, avatar, x, y, seat, facing, client }
const history = []; // 최근 채팅
let nextPid = 1;

function pub(p) {
  return { id: p.id, nick: p.nick, avatar: p.avatar, x: p.x, y: p.y, seat: p.seat, facing: p.facing };
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
    x: 380 + Math.random() * 240, y: 520 + Math.random() * 40, seat: null, facing: 1, client,
  };
  client.player = p;
  players.set(p.id, p);
  client.send({
    t: 'welcome', me: p.id, user: publicUser(user),
    players: [...players.values()].map(pub), history,
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
      const salt = crypto.randomBytes(16).toString('hex');
      const user = {
        id: crypto.randomUUID(), nick, salt, hash: hashPw(msg.pw, salt),
        avatar: randomAvatar(), created: Date.now(),
      };
      db.users[user.id] = user;
      saveDb();
      client.send({ t: 'authOk', token: newToken(user.id), isNew: true });
      return enterRoom(client, user);
    }
    case 'login': {
      const user = findUserByNick(String(msg.nick || '').trim());
      if (!user || !validPw(msg.pw) || !checkPw(user, msg.pw))
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
      if (!seat) return;
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
      if (len > 65536) return this.close();
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
  if (process.argv.includes('--tunnel')) startTunnel();
  else console.log('   끄려면 Ctrl + C\n');
})).catch((e) => {
  console.error('\n⚠️  계정 저장소를 불러오지 못했어요:', e.message);
  process.exit(1);
});
