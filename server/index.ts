import {app, BrowserWindow, protocol, net} from 'electron';
import $app from './app';
import Proton from './modules/kernels/proton';
import {KernelEvent} from './modules/kernels/abstract-kernel';
// import Archiver, {ArchiverEvent, Progress} from './modules/archiver';
// import process from 'process';
// import CopyDir, {CopyDirEvent} from './helpers/copy-dir';

function registerHandlers(): void {
  protocol.handle('local', (request: Request) =>
    net.fetch('file://' + request.url.slice('local://'.length)));
}

function createWindow(): void {
  const win: BrowserWindow = new BrowserWindow({
    icon: __dirname + '/icons/512.png',
    minWidth: 800,
    minHeight: 600,
    width: 1280,
    height: 720,
    webPreferences: {
      sandbox: true,
      allowRunningInsecureContent: true,
      webSecurity: false,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      backgroundThrottling: true,
    },
  });

  win.removeMenu();
  win.loadFile('cache/client/index.html');
  win.webContents.openDevTools();
}

app.whenReady().then((): void => {
  registerHandlers();
  createWindow();
});

$app.init().then(() => {

  const kernel: Proton = $app.getKernels().getKernel();
  kernel.on(KernelEvent.LOG, (event: KernelEvent.LOG, line: string) => {
    console.log(line);
  });
  kernel.on(KernelEvent.EXIT, (event: KernelEvent.EXIT, line: string) => {
    console.log('Wine EXIT');
  });

  // kernel.createPrefix();

  kernel.version().then((version: string) => {
    console.log('Version:', version);
  });

  // const cpDir: CopyDir = new CopyDir(
  //   $app.getFileSystem(),
  //   '/media/neiron/6_STORAGE_2730/Games/LineAge2_Interlude/prefix/',
  //   '/media/neiron/6_STORAGE_2730/Soft/test/prefix',
  // );
  //
  // cpDir.on(CopyDirEvent.PROGRESS, (event: CopyDirEvent.PROGRESS, progress: Progress) => {
  //   console.log(`Progress: ${progress.progress}, ${progress.itemsComplete}/${progress.itemsCount}, ${progress.transferredBytes}/${progress.totalBytes}`);
  // });
  //
  // cpDir.copy().then(() => {
  //   app.exit();
  // });

  // const archiver: Archiver = new Archiver(
  //   $app.getFileSystem(),
  //   '/media/neiron/6_STORAGE_2730/Soft/dbForgeMySQL',
  //   // '/media/neiron/6_STORAGE_2730/Soft/test/test2/',
  // );
  //
  // archiver.on(ArchiverEvent.PROGRESS, (event: ArchiverEvent.PROGRESS, progress: Progress) => {
  //   console.log(`Progress: ${progress.progress}`);
  // });
  //
  // return archiver.packSquashfs(true).then(() => {
  //   app.exit();
  // });
});