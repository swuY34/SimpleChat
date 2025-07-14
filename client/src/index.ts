import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
import path from 'path';
import { promises as fs } from 'fs';



declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

// 处理类型安全的 IPC 通信
const setupIPC = () => {
  ipcMain.handle('read-file', async (_: IpcMainInvokeEvent, path: string) => {
    return fs.readFile(path, 'utf-8');
  });

  ipcMain.on('message', (event, message: string) => {
    console.log('Received:', message);
    event.sender.send('reply', `Reply to ${message}`);
  });
};

app.whenReady().then(() => {
  setupIPC();

  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      sandbox: false,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});





