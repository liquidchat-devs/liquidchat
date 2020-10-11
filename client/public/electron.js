const electron = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');

let app = electron.app;
let mainWindow;
let tray;

function createWindow() {
  mainWindow = new electron.BrowserWindow({ width: 900, height: 680, webPreferences: { preload: path.join(__dirname, "preload.js"), zoomFactor: 0.8 }, frame: false });
  mainWindow.setMenu(null);
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `https://nekonetwork.net`);

  mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', () => {
  tray = new electron.Tray(`${path.join(__dirname, '../logo192_.png')}`)
  const contextMenu = new electron.Menu();
  contextMenu.append(new electron.MenuItem({ label: "LiquidChat", type: "normal" }))
  contextMenu.append(new electron.MenuItem({ type: "separator" }))
  contextMenu.append(new electron.MenuItem({ label: "Quit LiquidChat", type: "normal", role: "quit" }))
  tray.setToolTip('LiquidChat')
  tray.setContextMenu(contextMenu)
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});