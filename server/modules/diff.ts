import _ from 'lodash';
import Utils from '../helpers/utils';
import FileSystem from './file-system';
import Command from './command';

enum Change {
  UNMODIFIED,
  DELETED,
  INSERTED,
}

type Changes = {
  [Change.INSERTED]: {[index: number]: string},
  [Change.DELETED]: {[index: number]: string},
  [Change.UNMODIFIED]?: {[index: number]: string},
};

export default class Diff {
  private readonly fs: FileSystem;

  private file1Data: string[] = [];
  private file2Data: string[] = [];

  constructor(fs: FileSystem) {
    this.fs = fs;
  }

  public parse(diff: string): Changes {
    const result: Changes = {
      [Change.DELETED]: {},
      [Change.INSERTED]: {},
    };

    let from: string = '0';
    let sectionType: Change = Change.DELETED;

    diff.split('\n').forEach((line: string) => {
      if (line.includes('*** ') && false === line.includes(' ****')) {
        return;
      }
      if (line.includes('--- ') && false === line.includes(' ----')) {
        return;
      }
      if (line.includes('***************')) {
        sectionType = Change.DELETED;
        return;
      }

      if (line.includes('--- ') && line.includes(' ----')) {
        sectionType = Change.INSERTED;
        [from] = _.trim(line, '-* \t\n\r\0\x0B').split(',');
        return;
      }
      if (line.includes('*** ') && line.includes(' ****')) {
        sectionType = Change.DELETED;
        [from] = _.trim(line, '-* \t\n\r\0\x0B').split(',');
        return;
      }

      if (_.startsWith(line, '+') || _.startsWith(line, '-') || _.startsWith(line, '!')) {
        const index: number = Utils.toInt(from) - 1;

        if (sectionType === Change.DELETED) {
          result[Change.DELETED][index] = this.file1Data[index];
        } else if (sectionType === Change.INSERTED) {
          result[Change.INSERTED][index] = this.file2Data[index];
        }
      }

      from = String(Utils.toInt(from) + 1);
    });

    return result;
  }

  public async diff(file1: string, file2: string, encoding: BufferEncoding = 'utf-8'): Promise<Changes> {
    this.file1Data = (await this.fs.fileGetContentsByEncoding(file1, encoding)).split(/\n|\r\n?/);
    this.file2Data = (await this.fs.fileGetContentsByEncoding(file2, encoding)).split(/\n|\r\n?/);

    return this.parse(await Command.create().exec(`diff --text -c "${file1}" "${file2}"`));
  }

  public getFile1Data(): string[] {
    return this.file1Data;
  }

  public getFile2Data(): string[] {
    return this.file2Data;
  }
}