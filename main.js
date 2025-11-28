// main.js — Electron main process
const { autoUpdater } = require("electron-updater");
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    icon: path.join(__dirname, "assets/icon.ico"),   // ✔ correct icon placement + comma
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  autoUpdater.checkForUpdatesAndNotify();

  // mainWindow.webContents.openDevTools(); // optional
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Folder Picker
ipcMain.handle('show-folder-picker', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory']
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

// Save File
ipcMain.handle('save-file', async (_, { folderPath, filename, dataURL }) => {
  try {
    const base64 = dataURL.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64, 'base64');
    const savePath = path.join(folderPath, filename);

    await fs.writeFile(savePath, buffer);
    return { ok: true, path: savePath };

  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
});
