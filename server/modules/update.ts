import _ from 'lodash';
import AppFolders from './app-folders';
import FileSystem from './file-system';
import Network from './network';
import {AbstractModule} from './abstract-module';
import type {Progress} from './archiver';
import Command from './command';

// import child_process from 'child_process';
// import fs from 'fs';

export default class Update extends AbstractModule {

  private readonly version: string = '1.0.0';
  private readonly api: string = 'https://api.github.com/repos/hitman249/wine-launcher/releases';
  private readonly appFolders: AppFolders;
  private readonly fs: FileSystem;
  private readonly network: Network;
  private readonly command: Command;

  private data: Object[];

  constructor(appFolders: AppFolders, fs: FileSystem, network: Network, command: Command) {
    super();

    this.appFolders = appFolders;
    this.fs = fs;
    this.network = network;
    this.command = command;
  }

  public async init(): Promise<any> {
    const bins: string[] = ['unzstd', 'zstd', 'unzip'];

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

    return _.trimStart(last.tag_name, 'v');
  }

  /*
    /!**
     * @return {Promise<void>}
     *!/
    updateSelf() {
      let startFile        = this.appFolder.getBinDir() + '/start';
      const updateFile       = this.appFolder.getCacheDir() + '/start';
      const updateScriptFile = this.appFolder.getCacheDir() + '/update.sh';
      const log              = this.appFolder.getCacheDir() + '/update.log';

      if (!this.fs.exists(startFile)) {
        startFile = this.appFolder.getRootDir() + '/start';
      }

      if (!this.fs.exists(startFile)) {
        return Promise.resolve();
      }

      if (this.fs.exists(updateFile)) {
        this.fs.rm(updateFile);
      }

      if (this.fs.exists(updateScriptFile)) {
        this.fs.rm(updateScriptFile);
      }

      if (this.fs.exists(log)) {
        this.fs.rm(log);
      }

      const updateScript = `#!/usr/bin/env sh

  processPid=${window.process.pid}
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

    echo "Waiting for process to complete"
  done

  rm -rf "$startFile"
  mv "$updateFile" "$startFile"
  chmod +x "$startFile"

  "$startFile" &
  rm -rf "${updateScriptFile}"`;

      const promise = this.getRemoteVersion().then(() => this.data);

      return promise.then((data) => {
        let last = _.head(data);
        last     = _.head(last.assets);

        return this.network.download(last.browser_download_url, updateFile)
          .then(() => {
            this.fs.filePutContents(updateScriptFile, updateScript);
            this.fs.chmod(updateScriptFile);

            return new Promise((resolve) => {
              try {
                let isNext = false;
                const next = () => {
                  if (!isNext) {
                    isNext = true;
                    resolve();
                  }
                };

                const out = fs.openSync(log, 'a');
                const err = fs.openSync(log, 'a');

                const child = child_process.spawn(updateScriptFile, [], {
                  detached: true,
                  stdio:    [ 'ignore', out, err ],
                });

                child.unref();
                child.stdout.on('data', (log) => next(log));
                child.stderr.on('data', (log) => next(log));
              } catch (e) {
                resolve();
              }
            });
          })
          .then(() => window.app.getSystem().closeApp());
      });
    }

    moveSelf() {
      const startFile        = this.appFolder.getBinDir() + '/' + this.appFolder.getStartFilename();
      const updateFile       = this.appFolder.getStartFile();
      const updateScriptFile = this.appFolder.getCacheDir() + '/update.sh';
      const log              = this.appFolder.getCacheDir() + '/update.log';

      if (startFile === updateFile || !this.fs.exists(updateFile) || this.fs.exists(startFile)) {
        return Promise.resolve();
      }

      if (this.fs.exists(updateScriptFile)) {
        this.fs.rm(updateScriptFile);
      }

      if (this.fs.exists(log)) {
        this.fs.rm(log);
      }

      const updateScript = `#!/usr/bin/env sh

  processPid=${window.process.pid}
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

    echo "Waiting for process to complete"
  done

  rm -rf "$startFile"
  mv "$updateFile" "$startFile"
  chmod +x "$startFile"

  "$startFile" &
  rm -rf "${updateScriptFile}"`;

      return Promise.resolve()
        .then(() => {
          this.fs.filePutContents(updateScriptFile, updateScript);
          this.fs.chmod(updateScriptFile);

          return new Promise((resolve) => {
            try {
              let isNext = false;
              const next = () => {
                if (!isNext) {
                  isNext = true;
                  resolve();
                }
              };

              const out = fs.openSync(log, 'a');
              const err = fs.openSync(log, 'a');

              const child = child_process.spawn(updateScriptFile, [], {
                detached: true,
                stdio:    [ 'ignore', out, err ],
              });

              child.unref();
              child.stdout.on('data', (log) => next(log));
              child.stderr.on('data', (log) => next(log));
            } catch (e) {
              resolve();
            }
          });
        })
        .then(() => window.app.getSystem().closeApp());
    }*/
}