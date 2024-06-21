import {app, BrowserWindow, protocol, net, ipcMain} from 'electron';
import process from 'process';
import path from 'path';
import $app from './app';
import Routes from './routes';

let routes: Routes;

function registerHandlers(): void {
  protocol.handle('local', (request: Request) =>
    net.fetch('file://' + request.url.slice('local://'.length).split('?')[0]));
}

function createWindow(): void {
  const win: BrowserWindow = new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    width: 1280,
    height: 720,
    icon: path.join(__dirname, 'icons/512.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      allowRunningInsecureContent: true,
      webSecurity: false,
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      backgroundThrottling: true,
      sandbox: false,
    },
  });

  win.removeMenu();

  $app.init()
    .then(() => {
      routes = new Routes(ipcMain, win, $app);
      return routes.init();
    })
    .then(() => {
      win.loadFile('cache/client/loader.html');

      if (process.env.debug === '1') {
        // Open the DevTools.
        win.webContents.openDevTools();
      }

      const quit: () => void = (): void => {
        win.destroy();
        app.quit();
      };

      win.on('close', (e) => {
        $app.getSystem().closeApp().then(quit, quit);
        e.preventDefault();
        return false;
      });
    });
}

app.whenReady().then((): void => {
  registerHandlers();
  createWindow();
});