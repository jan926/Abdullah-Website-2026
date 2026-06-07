import { contextBridge, ipcRenderer } from 'electron';

export type DownloadProgressPayload = {
  id: string;
  path: string;
  percent: number;
  downloadedBytes: number;
  totalBytes: number;
  speedMbps: number;
  status: 'downloading' | 'complete' | 'error';
};

contextBridge.exposeInMainWorld('electronAPI', {
  downloadGame: (payload: { id: string; url: string; fileName: string }) => ipcRenderer.invoke('download-game', payload),
  launchGame: (executablePath: string) => ipcRenderer.invoke('launch-game', executablePath),
  getInstalledGames: () => ipcRenderer.invoke('get-installed-games'),
  onDownloadProgress: (callback: (payload: DownloadProgressPayload) => void) => {
    ipcRenderer.on('download-progress', (_event, payload) => callback(payload));
  },
});
