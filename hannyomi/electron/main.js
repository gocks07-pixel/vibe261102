// Electron 메인 프로세스: 창 생성, 전체화면(F11), 세이브 파일 입출력 (슬롯 A/B/C)
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const saveDir = () => path.join(app.getPath('documents'), 'Hannyomi');
const SLOTS = ['A', 'B', 'C'];
const slotFile = s => path.join(saveDir(), `save_${s}.json`);
const checkSlot = s => { if (!SLOTS.includes(s)) throw new Error('잘못된 슬롯: ' + s); return s; };

// 1.3 이전 세이브(save.json)를 슬롯 A로 옮긴다 (슬롯 A가 비어 있을 때만)
function migrate() {
  const old = path.join(saveDir(), 'save.json');
  try {
    if (fs.existsSync(old) && !fs.existsSync(slotFile('A'))) fs.renameSync(old, slotFile('A'));
  } catch (e) { /* 옮기기 실패 시 기존 파일 유지 */ }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 720, useContentSize: true, minWidth: 960, minHeight: 540,
    backgroundColor: '#07090f', autoHideMenuBar: true, title: '한요미의 대모험',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false },
  });
  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, '..', 'index.html'));
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
  });
}

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

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
