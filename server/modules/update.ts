import process from 'process';
import child_process, {type ChildProcessWithoutNullStreams} from 'child_process';
import _ from 'lodash';
import Utils from '../helpers/utils';
import {AbstractModule} from './abstract-module';
import type AppFolders from './app-folders';
import type FileSystem from './file-system';
import type Network from './network';
import type {Progress} from './archiver';
import type Command from './command';
import type {App} from '../app';
import packageInfo from '../../package.json';
import {RoutesTaskEvent} from '../routes/routes';

export default class Update extends AbstractModule {

  private readonly version: string = packageInfo.version;
  private readonly api: string = 'https://api.github.com/repos/hitman249/ProteWine/releases';
  private readonly appFolders: AppFolders;
  private readonly fs: FileSystem;
  private readonly network: Network;
  private readonly command: Command;
  private readonly app: App;

  private data: any[];

  constructor(appFolders: AppFolders, fs: FileSystem, network: Network, command: Command, app: App) {
    super();

    this.appFolders = appFolders;
    this.fs = fs;
    this.network = network;
    this.command = command;
    this.app = app;
  }

  public async init(): Promise<any> {
    const bins: string[] = ['unzstd', 'zstd', 'unzip', 'wrestool', 'icotool', 'diff'];

    for await (const bin of bins) {
      const path: string = `${await this.appFolders.getBinDir()}/${bin}`;

      if (!await this.fs.exists(path)) {
        const binPath: string = await this.command.exec(`command -v ${bin}`);

        if (binPath) {
          await this.fs.cp(binPath, path, {follow: true});

          if (await this.fs.exists(path)) {
            await this.fs.chmod(path);
          }
        } else {
          await this.downloadRepoFile(bin);
        }
      } else {
        await this.fs.chmod(path);
      }
    }
  }

  public async downloadWineTricks(progress?: (value: Progress) => void): Promise<void> {
    const url: string = 'https://raw.githubusercontent.com/Winetricks/winetricks/master/src/winetricks';
    const path: string = await this.appFolders.getWineTricksFile();

    if (await this.fs.exists(path)) {
      const createAt: Date = await this.fs.getCreateDate(path);
      const currentAt: Date = new Date();

      if (createAt && ((currentAt.getTime() - createAt.getTime()) / 1000) > 86400) {
        await this.network.download(url, path, progress);

        if (await this.fs.exists(path)) {
          await this.fs.chmod(path);
        }
      }
    } else {
      await this.network.download(url, path, progress);

      if (await this.fs.exists(path)) {
        await this.fs.chmod(path);
      }
    }
  }

  public async downloadSquashFuse(progress: (value: Progress) => void): Promise<void> {
    const url: string = this.network.getRepo('/bin/squashfuse');
    const path: string = await this.appFolders.getSquashFuseFile();

    if (!(await this.fs.exists(path)) || (await this.fs.size(path)) !== 548328) {
      await this.network.download(url, path, progress);

      if (await this.fs.exists(path)) {
        await this.fs.chmod(path);
      }
    }
  }

  public async downloadDosbox(progress: (value: Progress) => void): Promise<void> {
    const url: string = this.network.getRepo('/bin/dosbox');
    const path: string = await this.appFolders.getDosboxFile();

    if (!(await this.fs.exists(path)) || (await this.fs.size(path)) !== 2776552) {
      await this.network.download(url, path, progress);

      if (await this.fs.exists(path)) {
        await this.fs.chmod(path);
      }
    }
  }

  public async downloadFuseIso(progress: (value: Progress) => void): Promise<void> {
    return this.downloadRepoFile('fuseiso', progress);
  }

  public async downloadCabExtract(progress?: (value: Progress) => void): Promise<void> {
    return this.downloadRepoFile('cabextract', progress);
  }

  public async downloadBar(progress?: (value: Progress) => void): Promise<void> {
    return this.downloadRepoFile('bar', progress);
  }

  public async downloadLinkInfo(progress?: (value: Progress) => void): Promise<void> {
    return this.downloadRepoFile('lnkinfo', progress);
  }

  public async downloadRepoFile(file: string, progress?: (value: Progress) => void): Promise<void> {
    const url: string = this.network.getRepo(`/bin/${file}`);
    const path: string = `${await this.appFolders.getBinDir()}/${file}`;

    if (!await this.fs.exists(path)) {
      await this.network.download(url, path, progress);

      if (await this.fs.exists(path)) {
        await this.fs.chmod(path);
      }
    }
  }

  public getVersion(): string {
    return this.version;
  }

  public async getRemoteVersion(): Promise<string> {
    const data: any = this.data
      ? this.data
      : await this.network.getJSON(this.api);

    if (this.data !== data) {
      this.data = data;
    }

    const last: any = _.head(data);

    if (!last) {
      return '';
    }

    return _.trimStart(last.tag_name, 'v');
  }

  private getAsset(): any {
    return _.head(_.head(this.data)?.assets);
  }

  public async updateSelf(): Promise<void> {
    this.fireEvent(RoutesTaskEvent.RUN, 'Start self updating..');

    const startFile: string = await this.appFolders.getStartFile();
    const updateFile: string = `${await this.appFolders.getCacheDir()}/${await this.appFolders.getStartFilename()}`;
    const scriptFile: string = `${await this.appFolders.getCacheDir()}/update.sh`;
    const logFile: string = `${await this.appFolders.getCacheDir()}/update.log`;

    if (!await this.fs.exists(startFile)) {
      this.fireEvent(RoutesTaskEvent.LOG, 'File "start" not found.');
      this.fireEvent(RoutesTaskEvent.EXIT);
      return;
    }

    if (await this.fs.exists(updateFile)) {
      await this.fs.rm(updateFile);
    }

    if (await this.fs.exists(scriptFile)) {
      await this.fs.rm(scriptFile);
    }

    const remoteVersion: string = await this.getRemoteVersion();

    if ((this.getVersion() === remoteVersion) || !remoteVersion) {
      this.fireEvent(RoutesTaskEvent.LOG, 'The latest version is installed, no update required.');
      this.fireEvent(RoutesTaskEvent.EXIT);
      return;
    }

    const asset: any = this.getAsset();

    if (!asset) {
      this.fireEvent(RoutesTaskEvent.LOG, 'No updates found.');
      this.fireEvent(RoutesTaskEvent.EXIT);
      return;
    }

    const progress: (value: Progress) => void = (value: Progress) => this.fireEvent(RoutesTaskEvent.PROGRESS, value);
    await this.network.download(asset.browser_download_url, updateFile, progress);

    if (!await this.fs.exists(updateFile)) {
      this.fireEvent(RoutesTaskEvent.LOG, 'Failed to download update.');
      this.fireEvent(RoutesTaskEvent.EXIT);
      return;
    }

    const scriptText: string = `#!/usr/bin/env sh

processPid=${process.pid}
startFile="${startFile}"
updateFile="${updateFile}"
iterator=0

echo "Start to update"

while [ "$(ps -p $processPid -o comm=)" != "" ]; do
  sleep 1
  iterator=$((iterator + 1))

  if [ $iterator -gt 120 ]; then
    echo "Error update, exit."
    exit
  fi

  echo "Waiting for process (PID: $processPid) to complete"
done

echo "Remove $startFile"
rm -rf "$startFile"

echo "Move $updateFile -> $startFile"
mv "$updateFile" "$startFile"

chmod +x "$startFile"

echo "Start $startFile"
"$startFile" &

echo "Clean ${scriptFile}"
rm -rf "${scriptFile}"`;

    await this.fs.filePutContents(scriptFile, scriptText);
    await this.fs.chmod(scriptFile);

    if (!await this.fs.exists(scriptFile)) {
      this.fireEvent(RoutesTaskEvent.LOG, 'Failed create update script.');
      this.fireEvent(RoutesTaskEvent.EXIT);
      return;
    }

    this.fireEvent(RoutesTaskEvent.LOG, 'Success.');
    this.fireEvent(RoutesTaskEvent.LOG, 'Restart ProteWine.');

    const child: ChildProcessWithoutNullStreams = child_process.spawn(scriptFile, [], {detached: true, stdio: 'ignore'});
    child.unref();

    this.fireEvent(RoutesTaskEvent.EXIT);

    this.app.getServer().quit();
  }
}