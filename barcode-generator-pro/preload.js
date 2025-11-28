// preload.js — exposes a small safe API to renderer
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  chooseFolder: () => ipcRenderer.invoke('show-folder-picker'),
  saveFile: (args) => ipcRenderer.invoke('save-file', args)
});
