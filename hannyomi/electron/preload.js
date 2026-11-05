// 게임 화면(index.html)에 필요한 기능만 안전하게 노출
//  세이브(슬롯 A/B/C) · 버전과 테스트용 여부 · 오류 기록 · 버그 신고
const { contextBridge, ipcRenderer } = require('electron');

let info = { version: '', dev: false };
try { info = ipcRenderer.sendSync('app:info') || info; } catch (e) { /* 기본값 */ }

contextBridge.exposeInMainWorld('electronAPI', {
  info,
  saveGame: (slot, data) => ipcRenderer.invoke('save:write', slot, data),
  loadGame: slot => ipcRenderer.invoke('save:read', slot),
  deleteGame: slot => ipcRenderer.invoke('save:delete', slot),
  backupGame: (slot, data) => ipcRenderer.invoke('save:backup', slot, data),
  writeErrors: lines => ipcRenderer.send('log:errors', lines),
  bugCapture: () => ipcRenderer.invoke('bug:capture'),
  bugWrite: report => ipcRenderer.invoke('bug:write', report),
});
