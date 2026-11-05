// Electron 메인 프로세스: 창 생성, 전체화면(F11), 세이브 파일 입출력 (슬롯 A/B/C), 오류 기록, 버그 신고
//
// EXE 두 가지 (같은 원본, 빌드 명령만 다름)
//  - 플레이어용 (npm run build:player): src/dev.js 를 넣지 않는다 → 테스트 모드 없음
//  - 테스트용  (npm run build:dev)   : src/dev.js 포함 → 테스트 모드 있음
//  dev.js 파일이 있는지로 구분한다 (npm start 로 원본을 실행하면 테스트용)
//
// 저장 위치 (EXE 를 새 버전으로 바꿔도 그대로 남는다)
//  문서/RPG Adventure/Save Data/save_A·B·C.json        ← 플레이어용
//  문서/RPG Adventure/Save Data (DEV)/save_A·B·C.json  ← 테스트용 (테스트 모드가 슬롯을 덮어써도 실제 세이브는 안전)
//  문서/RPG Adventure/오류기록.txt                     ← 오류 자동 기록 (최근 200줄)
//  문서/RPG Adventure/버그신고/날짜_시간/               ← 🐞 버그 신고 (F9)
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const DEV = fs.existsSync(path.join(__dirname, '..', 'src', 'dev.js'));
const TITLE = 'RPG 대모험_HC' + (DEV ? ' (DEV)' : '');
const root = () => path.join(app.getPath('documents'), 'RPG Adventure');
const saveDir = () => path.join(root(), DEV ? 'Save Data (DEV)' : 'Save Data');
const errFile = () => path.join(root(), '오류기록.txt');
const SLOTS = ['A', 'B', 'C'];
const slotFile = s => path.join(saveDir(), `save_${s}.json`);
const checkSlot = s => { if (!SLOTS.includes(s)) throw new Error('잘못된 슬롯: ' + s); return s; };
let win = null;

// 옛 저장 위치(문서/Hannyomi)에 세이브가 있으면 새 위치로 한 번 복사한다 (플레이어용만, 옛 폴더는 지우지 않음)
// 1.3 이전 세이브(save.json)는 슬롯 A로 (슬롯 A가 비어 있을 때만)
let migrated = false;
function migrate() {
  if (migrated) return;
  migrated = true;
  try {
    fs.mkdirSync(saveDir(), { recursive: true });
    if (!DEV) {
      const old = path.join(app.getPath('documents'), 'Hannyomi');
      if (fs.existsSync(old)) {
        for (const f of ['save_A.json', 'save_B.json', 'save_C.json', 'save_A.backup.json', 'save_B.backup.json', 'save_C.backup.json', 'save.json']) {
          const from = path.join(old, f), to = path.join(saveDir(), f);
          if (fs.existsSync(from) && !fs.existsSync(to)) fs.copyFileSync(from, to);
        }
      }
    }
    const legacy = path.join(saveDir(), 'save.json');
    if (fs.existsSync(legacy) && !fs.existsSync(slotFile('A'))) fs.renameSync(legacy, slotFile('A'));
  } catch (e) { /* 옮기기 실패 시 기존 파일 유지 */ }
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 720, useContentSize: true, minWidth: 960, minHeight: 540,
    backgroundColor: '#07090f', autoHideMenuBar: true, title: TITLE,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false },
  });
  win.setMenuBarVisibility(false);
  win.on('page-title-updated', e => e.preventDefault());   // 창 제목은 항상 TITLE
  win.loadFile(path.join(__dirname, '..', 'index.html'));
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
  });
}

// 게임 화면이 시작할 때 한 번 묻는다: 버전 · 테스트용 여부
ipcMain.on('app:info', e => { e.returnValue = { version: app.getVersion(), dev: DEV }; });

ipcMain.handle('save:write', (e, slot, data) => {
  const f = slotFile(checkSlot(slot));
  fs.mkdirSync(saveDir(), { recursive: true });
  const tmp = f + '.tmp';
  fs.writeFileSync(tmp, data, 'utf8');
  fs.renameSync(tmp, f);
  return true;
});
ipcMain.handle('save:read', (e, slot) => {
  migrate();
  try { return fs.readFileSync(slotFile(checkSlot(slot)), 'utf8'); } catch (err) { return null; }
});
ipcMain.handle('save:backup', (e, slot, data) => {
  const f = path.join(saveDir(), `save_${checkSlot(slot)}.backup.json`);
  fs.mkdirSync(saveDir(), { recursive: true });
  fs.writeFileSync(f, data, 'utf8');
  return true;
});
ipcMain.handle('save:delete', (e, slot) => {
  try { fs.unlinkSync(slotFile(checkSlot(slot))); } catch (err) { /* 이미 없음 */ }
  return true;
});

// ---------- 오류 기록: 지난 실행 기록 + 이번 실행 기록, 최근 200줄 ----------
const ERR_MAX = 200;
let errBefore = null;   // 이번 실행 전에 파일에 있던 줄
ipcMain.on('log:errors', (e, lines) => {
  try {
    if (!Array.isArray(lines)) return;
    if (errBefore === null) {
      try { errBefore = fs.readFileSync(errFile(), 'utf8').split(/\r?\n/).filter(Boolean); } catch (err) { errBefore = []; }
    }
    const all = errBefore.concat(lines.map(x => String(x).slice(0, 600))).slice(-ERR_MAX);
    fs.mkdirSync(root(), { recursive: true });
    fs.writeFileSync(errFile(), all.join('\r\n') + '\r\n', 'utf8');
  } catch (err) { /* 기록 실패해도 게임은 계속 */ }
});

// ---------- 🐞 버그 신고 ----------
let lastShot = null;
ipcMain.handle('bug:capture', async () => {
  try { lastShot = (await win.webContents.capturePage()).toPNG(); } catch (err) { lastShot = null; }
  return !!lastShot;
});
ipcMain.handle('bug:write', async (e, r) => {
  const z = n => String(n).padStart(2, '0'), d = new Date();
  const name = `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}_${z(d.getHours())}-${z(d.getMinutes())}-${z(d.getSeconds())}`;
  const dir = path.join(root(), '버그신고', name);
  fs.mkdirSync(dir, { recursive: true });
  const w = (f, s) => fs.writeFileSync(path.join(dir, f), String(s || '').replace(/\r?\n/g, '\r\n'), 'utf8');
  w('신고내용.txt', r.note || '(적지 않음)');
  w('게임정보.txt', r.info);
  let errs = r.errors || '';
  try { errs += '\n\n[오류기록.txt — 지난 실행 포함]\n' + fs.readFileSync(errFile(), 'utf8'); } catch (err) { /* 파일 없음 */ }
  w('오류기록.txt', errs);
  if (lastShot) fs.writeFileSync(path.join(dir, '화면.png'), lastShot);
  if (r.save && SLOTS.includes(r.slot)) fs.writeFileSync(path.join(dir, `save_${r.slot}.json`), r.save, 'utf8');
  lastShot = null;
  shell.openPath(dir);
  return { where: `문서/RPG Adventure/버그신고/${name}` };
});

app.whenReady().then(() => { migrate(); createWindow(); });
app.on('window-all-closed', () => app.quit());
