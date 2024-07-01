import {app, BrowserWindow, protocol, net, ipcMain, Menu, Tray, MenuItemConstructorOptions, MenuItem} from 'electron';
import path from 'path';
import $app from './app';
import Routes from './routes';
import Arguments from './arguments';
import {GamesEvent} from './modules/games';

export default class Server {
  private readonly arguments: Arguments = new Arguments();
  private routes: Routes;
  private tray: Tray;
  private menu: Electron.Menu;
  private window: BrowserWindow;
  private quitProcessing: boolean = false;
  public noQuit: boolean = false;

  public async init(): Promise<void> {
    await this.registerHandlers();
    await $app.init();
    $app.setServer(this);
    await this.createTray();

    const gameId: string = this.arguments.getGameId();

    if (gameId) {
      $app.getGames().on(GamesEvent.EXIT, () => {
        this.quit();
      });

      if (!await $app.getGames().runById(gameId)) {
        this.quit();
      }
    } else if (this.arguments.isHeadless()) {
      this.quit();
    }

    if (!this.arguments.isHeadless()) {
      await this.createWindow();
    } else {
      this.updateMenu();
    }
  }

  public getArguments(): Arguments {
    return this.arguments;
  }

  private async registerHandlers(): Promise<void> {
    protocol.handle(
      'local',
      (request: Request) => net.fetch('file://' + request.url.slice('local://'.length).split('?')[0]),
    );
  }

  public quit(): void {
    if (!this.quitProcessing) {
      this.quitProcessing = true;
    }

    this.noQuit = false;

    const quit: () => void = (): void => {
      if (this.window) {
        this.window.destroy();
      }

      app.quit();
    };

    $app.getSystem().closeApp().then(quit, quit);
  }

  public async createWindow(): Promise<void> {
    this.window = new BrowserWindow({
      title: 'ProteWine',
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

    this.updateMenu();

    this.window.removeMenu();
    await this.window.loadFile('cache/client/loader.html');

    if (this.arguments.isDebug()) {
      // Open the DevTools.
      this.window.webContents.openDevTools();
    }

    this.window.on('close', (e) => {
      if (this.noQuit) {
        return;
      }

      this.quit();
      e.preventDefault();
      return false;
    });

    await this.createRoutes();
  }

  public getWindow(): BrowserWindow {
    return this.window;
  }

  public removeWindow(): void {
    this.noQuit = true;
    this.window.destroy();
    this.window = undefined;
    this.noQuit = false;

    this.updateMenu();
  }

  private async createTray(): Promise<void> {
    this.tray = new Tray(path.join(__dirname, 'icons/512.png'));
    this.tray.setToolTip('ProteWine');
  }

  public updateMenu(): void {
    const items: Array<(MenuItemConstructorOptions) | (MenuItem)> = [];

    if (this.window) {
      items.push({
        label: 'Hide',
        type: 'normal',
        click: (item: Electron.MenuItem, window: Electron.BrowserWindow, key: Electron.KeyboardEvent): void => this.removeWindow(),
      });
    } else {
      items.push({
        label: 'Open',
        type: 'normal',
        click: (item: Electron.MenuItem, window: Electron.BrowserWindow, key: Electron.KeyboardEvent): Promise<void> => this.createWindow(),
      });
    }

    items.push(
      {type: 'separator'},
      {
        label: 'Quit ProteWine',
        type: 'normal',
        click: (item: Electron.MenuItem, window: Electron.BrowserWindow, key: Electron.KeyboardEvent): void => this.quit(),
      },
    );

    this.menu = Menu.buildFromTemplate(items);

    this.tray.setContextMenu(this.menu);
  }

  public async createRoutes(): Promise<void> {
    if (this.routes) {
      this.routes.setWindow(this.window);
    } else {
      this.routes = new Routes(ipcMain, this.window, $app);
      await this.routes.init();
    }
  }
}

const server: Server = new Server();

app.whenReady().then(async (): Promise<void> => {
  await server.init();
});

app.on('before-quit', (event) => {
  if (server.noQuit) {
    event.preventDefault();
    return false;
  }
});