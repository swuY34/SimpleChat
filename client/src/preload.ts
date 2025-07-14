// src/preload.ts
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { readFileSync } from 'fs';

// 类型安全的 API 暴露
export type ElectronAPI = {
  sendMessage: (message: string) => void;
  onReply: (callback: (event: IpcRendererEvent, reply: string) => void) => void;
  readFile: (path: string) => Promise<string>;
  getPlatform: () => NodeJS.Platform;
};

const api: ElectronAPI = {
  sendMessage: (message) => ipcRenderer.send('message', message),
  
  onReply: (callback) => {
    // 注意类型转换
    ipcRenderer.on('reply', (event: IpcRendererEvent, ...args: [string]) => 
      callback(event, args[0])
    );
  },

  readFile: (path) => ipcRenderer.invoke('read-file', path),

  getPlatform: () => process.platform
};

// 安全暴露 API
contextBridge.exposeInMainWorld('electronAPI', api);

// 错误处理
process.on('unhandledRejection', (error: Error) => {
  console.error('Preload Error:', error);
});