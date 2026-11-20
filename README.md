# 🎄 메리 리틀 크리스마스

벽난로 앞에 옹기종기 모여서 이야기하는 크리스마스 놀이방이에요.

## 실행하는 법

1. [Node.js](https://nodejs.org) 설치 (LTS 버전, 한 번만 하면 돼요)
2. `실행하기.bat` 더블클릭 (또는 이 폴더에서 `node start.js`)
3. 브라우저에서 **http://localhost:3000** 접속

외부 패키지가 없어서 `npm install` 없이 바로 돌아가요.

## 친구 초대 (다른 와이파이 · LTE · 노트북 · 폰)

`실행하기.bat`으로 켜면 **어디서든 들어올 수 있는 주소**(`https://○○○.trycloudflare.com`)가 자동으로 만들어져요.

- 서버 창에 주소와 QR코드가 떠요
- 사이트 위쪽 **🔗 친구 초대** 버튼을 누르면 QR이랑 복사 버튼이 나와요
- 친구는 QR을 찍거나 링크를 눌러서 → 닉네임·비밀번호로 가입하면 바로 들어와요

알아둘 것
- 처음 실행할 때 Cloudflare의 무료 터널 도구 `cloudflared.exe`(약 60MB)를 이 폴더에 한 번 내려받아요
- **내 컴퓨터에서 서버 창이 켜져 있는 동안만** 열려 있어요. 컴퓨터가 잠자기 모드로 들어가면 끊겨요
- 서버를 껐다 켜면 주소가 바뀌어요 → 새 QR을 다시 공유해 주세요
- 링크를 가진 사람은 누구나 들어올 수 있으니, 아는 사람한테만 보내 주세요
- 주소가 안 만들어지면 `cloudflared.exe`를 지우고 다시 실행해 보세요. 그래도 안 되면 같은 와이파이 주소(`http://192.168.x.x:3000`)로는 계속 들어올 수 있어요
- 처음 실행할 때 Windows 방화벽 창이 뜨면 "허용"을 눌러주세요 (같은 와이파이 접속용)

## 🌍 고정 주소

**https://merry-little-christmas.onrender.com**

코드를 고친 뒤 GitHub에 올리면 → Render 대시보드에서 **Manual Deploy → Deploy latest commit** 을 눌러야 새 버전이 반영돼요.
(공개 저장소 주소로 연결해서 자동 배포는 꺼져 있어요)

## 고정 주소로 올리기 (컴퓨터를 꺼도 열려 있게)

무료 서비스 3개를 써요. 셋 다 GitHub 계정으로 가입할 수 있어요.

| 서비스 | 하는 일 |
|---|---|
| GitHub | 코드 보관 |
| Render | 서버 실행 → `https://이름.onrender.com` 주소 |
| Upstash | 가입한 계정 정보 저장 (Render 무료 서버는 재시작하면 파일이 지워져요) |

1. **GitHub**: 새 저장소(repository) 만들기 → "uploading an existing file" → `public` 폴더, `server.js`, `package.json`, `.gitignore`, `README.md` 를 끌어다 놓고 Commit
   (`cloudflared.exe`, `data`, `config.yml`, `실행하기.bat`, `start.js` 는 올리지 않아요)
2. **Upstash** (console.upstash.com): Redis 데이터베이스 만들기 → 화면의 **REST** 칸에서 `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` 두 값을 복사
3. **Render** (render.com): New → Web Service → 1번 저장소 선택
   - Build Command: `npm install` / Start Command: `node server.js` / Instance Type: **Free**
   - Environment Variables 에 2번의 두 값을 그대로 추가
   - Deploy → 몇 분 뒤 `https://○○○.onrender.com` 주소가 생겨요

무료 서버의 특징
- 15분 동안 아무도 없으면 잠들어요. 다음 사람이 들어올 때 깨어나는 데 1분쯤 걸려요 (그동안 Render 로딩 화면이 보여요)
- 접속 중일 때는 연결이 잠깐 끊겨도 자동으로 다시 붙어요
- 가입한 계정은 Upstash에 저장돼서 사라지지 않아요. 채팅 기록과 방 안 위치는 서버가 잠들면 초기화돼요
- 지금 설정: Render · Upstash 모두 싱가포르, 무료 플랜

## 지금 되는 것 (1단계: 벽난로 채팅방)

- 닉네임 + 비밀번호만으로 회원가입·로그인 (로그인 유지)
- 캐릭터 꾸미기: 동물 8종(곰돌이·토끼·고양이·햄찌·멍멍이·여우·양·펭귄) · 색 9가지 · 장식 9가지 중 최대 3개 겹쳐 쓰기
  (산타 모자, 목도리, 사슴뿔, 리본, 동글 안경, 별 머리핀, 귀마개, 방울 목걸이, 벙어리장갑)
- 닉네임 · 비밀번호 바꾸기, 로그아웃
- 바닥 클릭 또는 방향키/WASD로 이동
- 앉을 곳 10개 (안락의자 2, 3인용 소파, 방석 3, 동그란 푸프 2): 누르면 앉고, 한 번 더 누르거나 움직이면 일어나요
- 캐릭터 머리 위 말풍선 + 오른쪽 채팅 기록
- 이모티콘 반응 ❤️🎄⛄😆🎁✨

## 다음에 만들 것

- 🎂 케이크 투표 · 만들기 · 같이 먹기
- 🎁 그림 그려서 선물 / 쪽지 나눔
- 🎄 다 같이 트리 꾸미기 + 산타 할아버지께 소원 쓰기
- 🎅 산타 마피아

## 파일 구조

```
크리스마스/
├─ server.js        서버 (웹 + 실시간 채팅, 계정 저장, 공개 주소 만들기)
├─ 실행하기.bat      더블클릭 실행 (내 컴퓨터용)
├─ start.js         실행 도우미 (cloudflared 준비 → 서버 → 브라우저)
├─ public/
│  ├─ index.html    화면 구성
│  ├─ style.css     디자인
│  ├─ avatar.js     캐릭터 그림(SVG)
│  └─ app.js        화면 동작
└─ data/users.json  계정 정보 (실행하면 자동 생성, 비밀번호는 암호화해서 저장)
```
