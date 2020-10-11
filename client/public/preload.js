const { remote, ipcRenderer  } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
    window.minimizeWindow = minimizeWindow;
    window.unmaximizeWindow = unmaximizeWindow;
    window.maxUnmaxWindow = maxUnmaxWindow;
    window.isWindowMaximized = isWindowMaximized;
    window.closeWindow = closeWindow;
});

function getCurrentWindow() {
  return remote.getCurrentWindow();
}

function minimizeWindow(mainWindow = getCurrentWindow()) {
  if (mainWindow.minimizable) {
    mainWindow.minimize();
  }
}

function maximizeWindow(mainWindow = getCurrentWindow()) {
  if (mainWindow.maximizable) {
    mainWindow.maximize();
  }
}

function unmaximizeWindow(mainWindow = getCurrentWindow()) {
  mainWindow.unmaximize();
}

function maxUnmaxWindow(mainWindow = getCurrentWindow()) {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
}

function closeWindow(mainWindow = getCurrentWindow()) {
  mainWindow.close();
}

function isWindowMaximized(mainWindow = getCurrentWindow()) {
  return mainWindow.isMaximized();
}