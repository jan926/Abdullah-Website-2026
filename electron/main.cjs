const { app, BrowserWindow, ipcMain, nativeTheme, shell } = require("electron");
const path = require("node:path");

const isDev = !app.isPackaged;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1360,
    height: 840,
    minWidth: 1120,
    minHeight: 720,
    show: false,
    frame: false,
    transparent: false,
    backgroundColor: "#0a0a0a",
    title: "AQ Gaming Hub",
    icon: path.join(__dirname, "assets", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.once("ready-to-show", () => win.show());

  const startUrl =
    process.env.ELECTRON_START_URL ||
    `file://${path.join(__dirname, "..", "dist", "index.html")}`;

  win.loadURL(startUrl);

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (isDev) {
    win.webContents.openDevTools({ mode: "detach" });
  }
};

app.whenReady().then(() => {
  nativeTheme.themeSource = "dark";
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("window:minimize", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.minimize();
});

ipcMain.handle("window:maximize", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (!win) return;
  if (win.isMaximized()) win.unmaximize();
  else win.maximize();
});

ipcMain.handle("window:close", () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.close();
});
