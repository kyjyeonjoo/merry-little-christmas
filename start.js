// 🎄 실행 도우미: cloudflared 준비 → 서버 켜기 → 브라우저 열기
// 실행하기.bat 이 이 파일을 실행해요. (직접 실행: node start.js)
const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');

process.chdir(__dirname);
const PORT = Number(process.env.PORT) || 3000;
const isWin = process.platform === 'win32';
const EXE = path.join(__dirname, isWin ? 'cloudflared.exe' : 'cloudflared');

function assetUrl() {
  const base = 'https://github.com/cloudflare/cloudflared/releases/latest/download/';
  if (isWin) return base + (process.arch === 'ia32' ? 'cloudflared-windows-386.exe' : 'cloudflared-windows-amd64.exe');
  if (process.platform === 'linux') return base + (process.arch === 'arm64' ? 'cloudflared-linux-arm64' : 'cloudflared-linux-amd64');
  return null; // macOS 는 brew install cloudflared 로 설치해 주세요
}

function download(url, dest, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 8) return reject(new Error('리다이렉트가 너무 많아요'));
    https.get(url, { headers: { 'User-Agent': 'christmas-playroom' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return resolve(download(new URL(res.headers.location, url).toString(), dest, redirects + 1));
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode)); }
      const total = Number(res.headers['content-length']) || 0;
      let got = 0, lastPct = -1;
      const tmp = dest + '.part';
      const out = fs.createWriteStream(tmp);
      res.on('data', (c) => {
        got += c.length;
        const pct = total ? Math.floor((got / total) * 100) : 0;
        if (pct !== lastPct && pct % 10 === 0) { lastPct = pct; process.stdout.write(`   … ${pct}%\r`); }
      });
      res.pipe(out);
      out.on('finish', () => out.close(() => {
        try {
          fs.renameSync(tmp, dest);
          if (!isWin) fs.chmodSync(dest, 0o755);
          resolve();
        } catch (e) { reject(e); }
      }));
      out.on('error', reject);
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function ensureCloudflared() {
  try {
    if (fs.statSync(EXE).size > 5 * 1024 * 1024) return true; // 이미 있음
  } catch (_) {}
  const url = assetUrl();
  if (!url) return false;
  console.log('\n📦 친구 초대용 공개 주소 도구(cloudflared)를 처음 한 번만 내려받아요. (약 60MB)');
  try {
    await download(url, EXE);
    console.log('   다 받았어요!          ');
    return true;
  } catch (e) {
    console.log('   ⚠️  내려받지 못했어요 (' + e.message + '). 지금은 같은 와이파이에서만 들어올 수 있어요.');
    return false;
  }
}

function openBrowser(url) {
  const cmd = isWin ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
  exec(cmd, () => {});
}

(async () => {
  await ensureCloudflared();
  if (!process.argv.includes('--tunnel')) process.argv.push('--tunnel');
  require('./server.js');
  if (!process.argv.includes('--no-open')) setTimeout(() => openBrowser(`http://localhost:${PORT}`), 1200);
})();
