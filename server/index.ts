import {app, BrowserWindow} from 'electron';

const createWindow: () => void = (): void => {
  const win: BrowserWindow = new BrowserWindow({
    icon: __dirname + '/icons/512.png',
    minWidth: 800,
    minHeight: 600,
    width: 800,
    height: 600,
    webPreferences: {
      sandbox: true,
      allowRunningInsecureContent: true,
      webSecurity: true,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      backgroundThrottling: true,
    },
  });

  win.removeMenu();
  win.loadFile('cache/client/index.html');
  win.webContents.openDevTools();
};

app.whenReady().then((): void => {
  createWindow();
});