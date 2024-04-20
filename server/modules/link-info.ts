import type Command from './command';
import type AppFolders from './app-folders';
import type FileSystem from './file-system';
import _ from 'lodash';
import {AbstractModule} from './abstract-module';

export type LinkInfoData = {
  title: string,
  filename: string,
  arguments: string,
  path: string,
  work: string,
};

export default class LinkInfo extends AbstractModule {
  private readonly command: Command;
  private readonly appFolders: AppFolders;
  private readonly fs: FileSystem;

  constructor(appFolders: AppFolders, command: Command, fs: FileSystem) {
    super();

    this.command = command;
    this.appFolders = appFolders;
    this.fs = fs;
  }

  public async init(): Promise<any> {
  }

  public async parseFile(path: string): Promise<LinkInfoData> {
    const result: LinkInfoData = {
      title: '',
      filename: '',
      arguments: '',
      path: '',
      work: '',
    };

    const start: string = 'Link information:';
    const local: string = 'Local path';
    const working: string = 'Working directory';
    const args: string = 'Command line arguments';

    const output: string[] = (await this.command.exec(`"${await this.appFolders.getLinkInfoFile()}" "${path}"`)).split('\n');

    let isStarted: boolean = false;

    for (const line of output) {
      const fixLine: string = _.trim(line, ' \t');

      if (!isStarted) {
        if (-1 !== fixLine.indexOf(start)) {
          isStarted = true;
        }

        continue;
      }

      if (0 === fixLine.indexOf(local)) {
        result.path = _.trim(fixLine.split(':').slice(1).join(':'), ' \t');
        result.filename = this.fs.basename(result.path);
        continue;
      }

      if (0 === fixLine.indexOf(working)) {
        result.work = _.trim(fixLine.split(':').slice(1).join(':'), ' \t');
        continue;
      }

      if (0 === fixLine.indexOf(args)) {
        result.arguments = _.trim(fixLine.split(':').slice(1).join(':'), ' \t');
        continue;
      }

      if ('' === fixLine) {
        break;
      }
    }

    result.title = this.fs.basename(path).split('.').slice(0, -1).join('.');

    return result;
  }
}