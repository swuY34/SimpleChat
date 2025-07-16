// src/preload.ts
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// 类型安全的 API 暴露
export type ElectronAPI = {
  sendMessage: (message: string) => void;
  onReply: (callback: (event: IpcRendererEvent, reply: string) => void) => void;
  readFile: (path: string) => Promise<string>;
  getPlatform: () => NodeJS.Platform;

  windowControl: (action: 'close') => void;  // ✅ 只保留 close
};

// 实现 API
const api: ElectronAPI = {
  sendMessage: (message) => ipcRenderer.send('message', message),

  onReply: (callback) => {
    ipcRenderer.on('reply', (event, ...args) => callback(event, args[0]));
  },

  readFile: (path) => ipcRenderer.invoke('read-file', path),

  getPlatform: () => process.platform,

  windowControl: (action) => {
    ipcRenderer.send('window-control', action); // 只允许传 'close'
  },
};

// 安全暴露到渲染进程
contextBridge.exposeInMainWorld('electronAPI', api);

// 错误处理（防止未处理的 promise 被吞掉）
process.on('unhandledRejection', (error: Error) => {
  console.error('Preload Error:', error);
});
