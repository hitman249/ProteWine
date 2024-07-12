import _ from 'lodash';
import Utils from '../helpers/utils';
import type FileSystem from './file-system';
import type Command from './command';

export enum DiffChange {
  UNMODIFIED,
  DELETED,
  INSERTED,
}

export type Section = {[index: number]: string};

export type DiffChanges = {
  [DiffChange.INSERTED]: Section,
  [DiffChange.DELETED]: Section,
  [DiffChange.UNMODIFIED]?: Section,
};

export default class Diff {
  private readonly fs: FileSystem;
  private readonly command: Command;

  private file1Data: string[] = [];
  private file2Data: string[] = [];

  constructor(fs: FileSystem, command: Command) {
    this.fs = fs;
    this.command = command;
  }

  public parse(diff: string): DiffChanges {
    const result: DiffChanges = {
      [DiffChange.DELETED]: {},
      [DiffChange.INSERTED]: {},
    };

    let from: string = '0';
    let sectionType: DiffChange = DiffChange.DELETED;

    diff.split('\n').forEach((line: string) => {
      if (line.includes('*** ') && false === line.includes(' ****')) {
        return;
      }
      if (line.includes('--- ') && false === line.includes(' ----')) {
        return;
      }
      if (line.includes('***************')) {
        sectionType = DiffChange.DELETED;
        return;
      }

      if (line.includes('--- ') && line.includes(' ----')) {
        sectionType = DiffChange.INSERTED;
        [from] = _.trim(line, '-* \t\n\r\0\x0B').split(',');
        return;
      }
      if (line.includes('*** ') && line.includes(' ****')) {
        sectionType = DiffChange.DELETED;
        [from] = _.trim(line, '-* \t\n\r\0\x0B').split(',');
        return;
      }

      if (_.startsWith(line, '+') || _.startsWith(line, '-') || _.startsWith(line, '!')) {
        const index: number = Utils.toInt(from) - 1;

        if (sectionType === DiffChange.DELETED) {
          result[DiffChange.DELETED][index] = this.file1Data[index];
        } else if (sectionType === DiffChange.INSERTED) {
          result[DiffChange.INSERTED][index] = this.file2Data[index];
        }
      }

      from = String(Utils.toInt(from) + 1);
    });

    return result;
  }

  public async diff(file1: string, file2: string, encoding: BufferEncoding = 'utf-8'): Promise<DiffChanges> {
    this.file1Data = (await this.fs.fileGetContentsByEncoding(file1, encoding)).split(/\n|\r\n?/);
    this.file2Data = (await this.fs.fileGetContentsByEncoding(file2, encoding)).split(/\n|\r\n?/);

    return this.parse(await this.command.exec(`diff --text -c "${file1}" "${file2}"`));
  }

  public getFile1Data(): string[] {
    return this.file1Data;
  }

  public getFile2Data(): string[] {
    return this.file2Data;
  }
}