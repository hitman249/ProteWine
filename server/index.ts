import {app, BrowserWindow} from 'electron';

const createWindow: () => void = (): void => {
  const win: BrowserWindow = new BrowserWindow({
    width: 800,
    height: 600,
  });

  win.loadFile('index.html');
};

app.whenReady().then((): void => {
  createWindow();
});