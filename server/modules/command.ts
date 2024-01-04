import _ from 'lodash';
import process from 'process';
import child_process from 'child_process';
import type {ExecException} from 'child_process';
import {AbstractModule} from './abstract-module';
import Memory from '../helpers/memory';

type ArgumentsType = {[key: string]: string | string[]};

export default class Command extends AbstractModule {
  private memory: Memory = new Memory();
  private declare locale: string;

  constructor() {
    super();

    this.memory
      .setContext(this)
      .declareVariables(
        'locale',
      );
  }

  public async init(): Promise<any> {
  }

  public async exec(cmd: string): Promise<string> {
    return await new Promise<string>((resolve: (value: string) => void): void => {
      child_process.exec(cmd, (error: ExecException, stdout: string): void => resolve(String(stdout).trim()));
    });
  }

  public async execOfBuffer(cmd: string): Promise<Buffer> {
    return await new Promise<Buffer>((resolve: (value: Buffer) => void): void => {
      child_process.exec(cmd, {encoding: 'buffer'}, (error: ExecException, stdout: Buffer): void => resolve(stdout));
    });
  }

  public async getLocale(): Promise<string> {
    if (undefined !== this.locale) {
      return this.locale;
    }

    const locale: string = process.env.LC_ALL;

    if (locale) {
      this.locale = locale;
      return this.locale;
    }

    const counts: {[locale: string]: number} = {};

    (await this.exec('locale'))
      .split('\n')
      .map((s: string) => s.trim())
      .forEach((line: string) => {
        const [, value]: string[] = line.split('=').map((s: string) => _.trim(s.trim(), '"'));

        if (!value) {
          return;
        }

        if (undefined === counts[value]) {
          counts[value] = 0;
        } else {
          counts[value] += 1;
        }
      });

    const findLocale: {locale: string, c: number} = _.maxBy(
      Object.keys(counts)
        .map((locale: string): any => ({ locale, c: counts[locale] })),
      'c',
    );

    if (findLocale) {
      this.locale = findLocale.locale;
    }

    return this.locale;
  }

  public addSlashes(cmd: string): string {
    return cmd.split('\\').join('\\\\').split('"').join('\\"');
  }

  public getArguments(): ArgumentsType {
    const args: string[] = process.argv.slice();
    args.shift();

    const params: ArgumentsType = {};

    const append = (field: string, value: string): void => {
      const prepareValue: string | string[] = value
        ? value.split(',').map((s: string) => s.trim())
        : undefined;

      params[field] = (undefined === prepareValue) || (prepareValue.length > 1) ? prepareValue : prepareValue[0];
    };

    args.forEach((arg: string) => {
      if ('' === _.trim(arg, '.')) {
        return;
      }

      const line: string = arg.startsWith('-') ? _.trim(arg, '-') : arg;
      const [field, value]: string[] = line.split('=');

      append(field, value);
    });

    return params;
  }
}