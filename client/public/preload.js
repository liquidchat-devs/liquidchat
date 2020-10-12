const { remote, ipcRenderer  } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
    window.minimizeWindow = minimizeWindow;
    window.unmaximizeWindow = unmaximizeWindow;
    window.maxUnmaxWindow = maxUnmaxWindow;
    window.isWindowMaximized = isWindowMaximized;
    window.closeWindow = closeWindow;
    window.setIcon = setIcon;
});

function getCurrentWindow() {
  return remote.getCurrentWindow();
}

function setIcon(type, mainWindow = getCurrentWindow()) {
  if(type === true) {
    mainWindow.setOverlayIcon(require("path").join(__dirname, "../logo192_notif.png"), "New Message")
    mainWindow.flashFrame(true);
  } else {
    mainWindow.setOverlayIcon(null, "")
    mainWindow.flashFrame(false);
  }
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