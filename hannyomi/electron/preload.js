// 게임 화면(index.html)에 세이브 기능만 안전하게 노출 (슬롯 A/B/C)
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveGame: (slot, data) => ipcRenderer.invoke('save:write', slot, data),
  loadGame: slot => ipcRenderer.invoke('save:read', slot),
  deleteGame: slot => ipcRenderer.invoke('save:delete', slot),
  backupGame: (slot, data) => ipcRenderer.invoke('save:backup', slot, data),
});
