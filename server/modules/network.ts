import Utils from '../helpers/utils';
import _ from 'lodash';
import cookieParser from 'cookie';
import dns from 'dns';
import fetch, {type RequestInit, type Response} from 'node-fetch';
import fs from 'fs';
import path from 'path';
import process from 'process';
import Command from './command';
import type WatchProcess from '../helpers/watch-process';
import {AbstractModule} from './abstract-module';
import type {Progress} from './archiver';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

type KeyValue = {[key: string]: string};
type KeyValueAny = {[key: string]: any};
export default class Network extends AbstractModule {
  private readonly repository: string = 'https://raw.githubusercontent.com/hitman249/ProteWine/main';
  private connected: boolean;

  private readonly fileSettings: KeyValueAny = {
    flags: 'w',
    encoding: 'utf8',
    fd: null,
    mode: 0o755,
    autoClose: false,
  };

  private readonly options: RequestInit = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/71.0.3578.80 Chrome/71.0.3578.80 Safari/537.36',
    },
  };

  public async init(): Promise<any> {
  }

  public async isConnected(): Promise<void> {
    return new Promise((resolve: () => void, reject: () => void) => {
      if (undefined !== this.connected) {
        return this.connected ? resolve() : reject();
      }

      dns.lookupService('8.8.8.8', 53, (err: NodeJS.ErrnoException) => {
        this.connected = !err;
        return this.connected ? resolve() : reject();
      });
    });
  }

  private cookieParse(cookie: string | string[]): KeyValue {
    let result: KeyValue = {};

    if (Array.isArray(cookie)) {
      _.forEach(cookie, (line: string) => {
        result = Object.assign(result, cookieParser.parse(line));
      });

      return result;
    }

    return cookieParser.parse(cookie);
  }

  public cookieStringify(cookie: KeyValue): string {
    return _.map(cookie, (value: string, name: string) => cookieParser.serialize(name, value)).join('; ');
  }

  public headersParse(headers: KeyValue): KeyValue {
    const result: KeyValue = {};

    _.forEach(headers, (value: string, key: string) => {
      result[key] = value;
    });

    return result;
  }

  public async get(url: string): Promise<string> {
    return this.isConnected()
      .then(() => fetch(url, this.options))
      .then((response: Response) => response.text());
  }

  public async getJSON(url: string): Promise<Object> {
    return this.isConnected()
      .then(() => fetch(url, this.options))
      .then((response: Response) => response.json());
  }

  public async download(url: string, filepath: string, progress?: (value: Progress) => void): Promise<void> {
    return this.isConnected()
      .then(() => fetch(url, this.options))
      .then((response: Response) => {
        const contentLength: number = Utils.toInt(response.headers.get('content-length'));
        let downloadedLength: number = 0;

        progress?.({
          success: false,
          progress: 0,
          totalBytes: contentLength,
          transferredBytes: downloadedLength,
          totalBytesFormatted: Utils.convertBytes(0),
          transferredBytesFormatted: Utils.convertBytes(0),
          path: url,
          name: path.basename(url),
          itemsComplete: 1,
          itemsCount: 1,
          event: 'download',
        });

        return new Promise((resolve: () => void, reject: () => void) => {
          const fileStream: fs.WriteStream = fs.createWriteStream(
            filepath, {mode: this.fileSettings.mode, autoClose: true},
          );
          fileStream.on('error', reject);

          response.body.pipe(fileStream);
          response.body.on('end', () => {
            progress?.(Utils.getFullProgress('download'));
            resolve();
          });
          response.body.on('error', () => {
            progress?.(Utils.getFullProgress('download'));
            reject();
          });

          if (contentLength > 0) {
            response.body.on('data', (chunk: Buffer) => {
              downloadedLength += chunk.byteLength;

              progress?.({
                success: contentLength > 0,
                progress: 100 / contentLength * downloadedLength,
                totalBytes: contentLength,
                transferredBytes: downloadedLength,
                totalBytesFormatted: Utils.convertBytes(contentLength),
                transferredBytesFormatted: Utils.convertBytes(downloadedLength),
                path: url,
                name: path.basename(url),
                itemsComplete: 1,
                itemsCount: 1,
                event: 'download',
              });
            });
          }
        });
      });
  }

  public getRepo(postfix: string = ''): string {
    return this.repository + postfix;
  }

  private async exists(path: string): Promise<boolean> {
    return await new Promise((resolve: (exists: boolean) => void): void => {
      fs.access(_.trimEnd(path, '/'), (err: NodeJS.ErrnoException): void => resolve(!err));
    });
  }

  private async exec(cmd: string): Promise<string> {
    return Command.create().exec(cmd);
  }

  private async watch(cmd: string): Promise<WatchProcess> {
    return Command.create().watch(cmd);
  }

  public async downloadTarGz(url: string, filepath: string, progress: (value: Progress) => void): Promise<void> {
    return this.download(url, filepath, progress)
      .then(() => this.exists(filepath).then((exist: boolean) => {
        if (!exist) {
          return Promise.reject();
        }

        return this.exec(`tar -xzf "${filepath}" -C "${path.dirname(filepath)}"`);
      }))
      .then(() => this.exists(filepath).then((exist: boolean) => {
        if (exist) {
          return new Promise((resolve: () => void) => fs.unlink(filepath, () => resolve()));
        }
      }));
  }

  public async downloadTarZst(url: string, filepath: string, progress: (value: Progress) => void): Promise<void> {
    return this.download(url, filepath, progress)
      .then(() => this.exists(filepath).then((exist: boolean) => {
        if (!exist) {
          return Promise.reject();
        }

        return this.exec(`tar -I zstd -xf "${filepath}" -C "${path.dirname(filepath)}"`);
      }))
      .then(() => this.exists(filepath).then((exist: boolean) => {
        if (exist) {
          return new Promise((resolve: () => void) => fs.unlink(filepath, () => resolve()));
        }
      }));
  }
}