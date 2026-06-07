import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream';
import { promisify } from 'node:util';
import axios from 'axios';
import { startApiServer } from './api-server';
import { getInstalledGames, saveInstalledGame } from './db';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const streamPipeline = promisify(pipeline);
const isDev = process.env.NODE_ENV !== 'production';

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 760,
    backgroundColor: '#06101a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../index.html'));
  }

  return mainWindow;
}

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
}

ipcMain.handle('get-installed-games', async () => {
  return getInstalledGames();
});

ipcMain.handle('download-game', async (_, payload: { id: string; url: string; fileName: string }) => {
  const downloadsDir = path.join(app.getPath('userData'), 'games');
  fs.mkdirSync(downloadsDir, { recursive: true });

  const safeName = sanitizeFilename(payload.fileName);
  const destinationPath = path.join(downloadsDir, safeName);

  if (!payload.url.startsWith('http://') && !payload.url.startsWith('https://')) {
    throw new Error('Invalid download URL.');
  }

  const response = await axios.get(payload.url, {
    responseType: 'stream',
    headers: {
      'User-Agent': 'SteamFree Desktop Client',
    },
  });

  const totalBytes = Number(response.headers['content-length'] || 0);
  let downloadedBytes = 0;
  let lastSent = Date.now();

  response.data.on('data', (chunk: Buffer) => {
    downloadedBytes += chunk.length;
    const now = Date.now();
    if (now - lastSent > 250) {
      const percent = totalBytes ? Math.round((downloadedBytes / totalBytes) * 100) : 0;
      const speedMbps = +(downloadedBytes / 1024 / 1024 / ((now - lastSent) / 1000)).toFixed(2);
      lastSent = now;
      BrowserWindow.getAllWindows().forEach((window) => {
        window.webContents.send('download-progress', {
          id: payload.id,
          path: destinationPath,
          percent,
          downloadedBytes,
          totalBytes,
          speedMbps,
          status: 'downloading',
        });
      });
    }
  });

  const fileStream = createWriteStream(destinationPath);
  await streamPipeline(response.data, fileStream);

  const installedGame = {
    id: payload.id,
    title: payload.fileName,
    path: destinationPath,
    installedAt: Date.now(),
    status: 'installed',
  };
  saveInstalledGame(installedGame);

  BrowserWindow.getAllWindows().forEach((window) => {
    window.webContents.send('download-progress', {
      id: payload.id,
      path: destinationPath,
      percent: 100,
      downloadedBytes: totalBytes,
      totalBytes,
      speedMbps: 0,
      status: 'complete',
    });
  });

  return installedGame;
});

ipcMain.handle('launch-game', async (_, executablePath: string) => {
  if (!executablePath || typeof executablePath !== 'string') {
    throw new Error('Missing executable path.');
  }

  if (!executablePath.toLowerCase().endsWith('.exe')) {
    throw new Error('Only .exe launch targets are allowed.');
  }

  const { spawn } = await import('node:child_process');
  const child = spawn(executablePath, { detached: true, stdio: 'ignore' });
  child.unref();

  return {
    pid: child.pid,
    path: executablePath,
  };
});

app.whenReady().then(async () => {
  await startApiServer();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
