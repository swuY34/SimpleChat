export {};
declare global {
  interface Window {
    electronAPI: import('../preload').ElectronAPI;
  }
}
