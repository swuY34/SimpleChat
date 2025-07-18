import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent, session } from 'electron';
import path from 'path';
import { promises as fs } from 'fs';
import { spawn } from 'child_process';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const SHADOW_MARGIN = 5;

if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

// 配置 CSP 以允许连接到 localhost:8888
const configureCSP = () => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          // 核心策略
          "default-src 'self'; " +
          // 允许连接和 WebSocket
          "connect-src 'self' http://localhost:8888 ws://localhost:8888; " +
          // 允许内联样式和脚本（开发时可能需要）
          "style-src 'self' 'unsafe-inline'; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
          // 允许图片和数据 URI
          "img-src 'self' data: http://localhost:8888; " +
          // 允许字体
          "font-src 'self' data:;"
        ]
      }
    })
  });
};

const setupIPC = () => {
  ipcMain.handle('read-file', async (_: IpcMainInvokeEvent, path: string) => {
    return fs.readFile(path, 'utf-8');
  });

  ipcMain.on('message', (event, message: string) => {
    console.log('Received:', message);
    event.sender.send('reply', `Reply to ${message}`);
  });

  ipcMain.on('window-control', (event, action) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;

    if (action === 'close') {
      win.close();
    }
  });
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1100 + SHADOW_MARGIN * 2,
    height: 700 + SHADOW_MARGIN * 2,
    minWidth: 600 + SHADOW_MARGIN * 2,
    minHeight: 670 + SHADOW_MARGIN * 2,
    frame: false,
    transparent: true,
    hasShadow: true,
    backgroundColor: '#00000000', // 完全透明
    show: false,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      sandbox: false,
      webSecurity: true, // 保持安全启用
      allowRunningInsecureContent: false, // 禁用不安全内容
      devTools: process.env.NODE_ENV === 'development' // 开发时开启DevTools
    },
  });

  mainWindow.setTitle('Simple Chat');

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.once('ready-to-show', () => {
    mainWindow?.center();
    mainWindow?.show();
    
    // 开发模式下自动打开DevTools
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  });
};

app.whenReady().then(() => {
  configureCSP(); // 配置CSP策略
  setupIPC();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});



















import os from 'os';
import { mkdirSync, readdirSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';

const MAX_INSTANCES = 2;
const INSTANCE_DIR = join(os.tmpdir(), 'simple-chat-instances');

// 确保目录存在
mkdirSync(INSTANCE_DIR, { recursive: true });

// 清理无效的 pid 文件
const cleanDeadInstances = () => {
  const files = readdirSync(INSTANCE_DIR);
  for (const file of files) {
    const pid = parseInt(file.replace('.lock', ''));
    if (!isNaN(pid)) {
      try {
        process.kill(pid, 0); // 检查是否活着
      } catch {
        try {
          unlinkSync(join(INSTANCE_DIR, file));
        } catch {}
      }
    }
  }
};

cleanDeadInstances();
const existingInstances = readdirSync(INSTANCE_DIR).length;

// 注册当前实例
const pidFile = join(INSTANCE_DIR, `${process.pid}.lock`);
if (!existsSync(pidFile)) {
  writeFileSync(pidFile, '');
  process.on('exit', () => {
    try {
      unlinkSync(pidFile);
    } catch {}
  });
}

// 如果实例数少于 3，就再启动一个新实例
if (existingInstances < MAX_INSTANCES - 1) {
  spawn(process.execPath, [app.getAppPath()], {
    detached: true,
    stdio: 'ignore'
  }).unref();
}