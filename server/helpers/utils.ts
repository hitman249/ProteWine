import _ from 'lodash';
import array_filter from 'locutus/php/array/array_filter';
import crypto from 'crypto';
import fs from 'fs';
import iconv from 'iconv-lite';
import type {ReadStream} from 'fs';
import type {Progress} from '../modules/archiver';

type CounterType = {count: number, codepage: string, str: string};

const SYMBOLS: string[] = (
  '0123456789' +
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' +
  'абвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'
).split('');

const CODEPAGES: string[] = ['utf-8', 'cp1251', 'cp866', 'koi8-r'];

export default class Utils {
  private static readonly objectPrototype: any = Object.getPrototypeOf({});

  /**
   * Empty values:
   * null, undefined, NaN, '', {}, []
   */
  public static isEmpty(value: any): boolean {
    return Object.is(value, NaN) || '' === value || null === value || undefined === value ||
      (Array.isArray(value) && 0 === value.length) ||
      ('object' === typeof value && !Array.isArray(value) && 0 === Object.keys(value).length && Object.getPrototypeOf(value) === Utils.objectPrototype);
  }

  public static jsonEncode(object: Object): string {
    return JSON.stringify(object, null, 4);
  }
  public static jsonDecode(text: string): any {
    if (!text || 'string' !== typeof text || '' === text.trim()) {
      return undefined;
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      return undefined;
    }
  }

  public static toArray(value: any): any[] {
    return Array.prototype.slice.call(value);
  }

  public static quote(...items: string[]): string {
    const unpack = (values: string[]): string[] => {
      let args: any[] = Utils.toArray(values);

      if (args.length === 1 && (Array.isArray(args[0]) || (!Array.isArray(args[0]) && 'object' === typeof args[0]))) {
        args = args[0];

        if (!Array.isArray(args) && 'object' === typeof args) {
          args = Utils.toArray(values);
        }
      }

      return args;
    };

    return unpack(unpack(items)).map((s: string) => `"${s}"`).join(' ');
  }

  public static findVersion(str: string = ''): string {
    let version: RegExpMatchArray = str.match('([0-9]{1,}.[0-9]{1,}.[0-9]{1,})');

    if (version) {
      return version[1];
    }

    version = str.match('([0-9]{1,}.[0-9]{1,})');

    if (version) {
      return version[1];
    }
  }

  public static natsort(value: string[] = [], reverse: boolean = false): string[] {
    const result: string[] = value.sort((new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'})).compare);

    if (reverse) {
      return _.reverse(result);
    }

    return result;
  }

  public static isUtf16(buffer: Buffer): boolean {
    const str: string = buffer.toString();

    // eslint-disable-next-line
    return (str.match(/\x00/g) || []).length / str.length > 0.1;
  }

  public static normalize(buffer: Buffer): string {
    if (Utils.isUtf16(buffer)) {
      return _.trim(iconv.decode(buffer, 'utf-16'), '\r\n\t ');
    }

    const result: CounterType[] = [];

    for (const codepage of CODEPAGES) {
      const str: string = iconv.decode(buffer, codepage).toString();
      const counter: CounterType = {
        codepage,
        count: 0,
        str,
      };

      for (const char of SYMBOLS) {
        counter.count += str.split(char).length;
      }

      result.push(counter);
    }

    result.sort((a: CounterType, b: CounterType): number => {
      if (a.count < b.count) {
        return 1;
      }

      if (a.count > b.count) {
        return -1;
      }

      return 0;
    });

    return _.trim(result[0].str.split('\r').join(''), '\r\n\t ');
  }

  public static encode(buffer: Buffer | string, encoding: string = 'utf-8'): Buffer {
    return iconv.encode('object' === typeof buffer ? buffer.toString() : buffer, encoding);
  }

  public static decode(buffer: Buffer, encoding: string = 'utf-8'): string {
    return iconv.decode(buffer, encoding);
  }

  public static md5(str: string): string {
    return crypto.createHash('md5').update(str).digest('hex');
  }

  public static rand(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public static toInt(value: string | number, _default: number = 0): number {
    value = Math.trunc(value as number);

    if (value === 0 || isNaN(value) || Object.is(value, NaN)) {
      return _default;
    }

    return value;
  }

  public static hashCode(str: string): number {
    return str.split('').reduce((a: number, b: string): number => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
  }

  public static array_filter(arr: {} | any[], func: Function): any[] {
    return array_filter(arr, func);
  }

  public static async sleep(ms: number): Promise<void> {
    return new Promise((resolve: () => void) => setTimeout(resolve, ms));
  }

  public static async base64FileEncode(path: string): Promise<string> {
    return new Promise((resolve: (value: any) => void, reject: (value: any) => void) => {
      fs.readFile(path, (err: NodeJS.ErrnoException, data: Buffer): void => {
        if (err) {
          reject(err);
        } else {
          resolve((new Buffer(data)).toString('base64'));
        }
      });
    });
  }

  public static async base64FileDecode(base64: string, path: string): Promise<void> {
    return new Promise((resolve: () => void, reject: (value: any) => void) => {
      fs.writeFile(path, new Buffer(base64, 'base64'), (err: NodeJS.ErrnoException): void => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public static startTruncate(str: string, len: number): string {
    const reverse: string = str.split('').reverse().join('');
    const trunc: string = _.truncate(reverse, {length: len});

    if (reverse === trunc) {
      return str;
    }

    return trunc.split('').reverse().join('');
  }

  public static async formDataFile(path: string): Promise<ReadStream> {
    return new Promise<ReadStream>((resolve: (value: ReadStream) => void, reject: (value: any) => void) => {
      fs.access(_.trimEnd(path, '/'), (err: NodeJS.ErrnoException) => {
        if (err) {
          reject(err);
        } else {
          resolve(fs.createReadStream(path));
        }
      });
    });
  }

  public static async isMsDos(path: string): Promise<boolean> {
    return new Promise((resolve: (value: boolean) => void, reject: (value: any) => void): void => {
      fs.access(_.trimEnd(path, '/'), (err: NodeJS.ErrnoException): void => {
        if (err) {
          return reject(err);
        } else {
          const buffer: Buffer = Buffer.alloc(80);

          fs.open(path, 'r', path, (err: NodeJS.ErrnoException, fd: number): void => {
            if (err) {
              return reject(err);
            }

            fs.read(fd, buffer, 0, 80, 0, (err: NodeJS.ErrnoException, bytesRead: number, buffer: Buffer): void => {
              if (err) {
                return reject(err);
              }

              const head: string = buffer.toString('hex', 0, 2);
              const sign: string = buffer.toString('hex', 69, 78);
              const sign2: string = buffer.toString('hex', 2, 5);

              resolve(['4d5a', '5a4d'].includes(head) && 'b409cd21b8014ccd21' !== sign && !['900003', '500002', '400001'].includes(sign2));
            });
          });
        }
      });
    });
  }

  public static endsWith(str: string, targets: string | string[]): boolean {
    if (Array.isArray(targets)) {
      for (const target of targets) {
        if (target && _.endsWith(str, target)) {
          return true;
        }
      }
    } else if (_.endsWith(str, targets)) {
      return true;
    }

    return false;
  }

  public static findAssetArchive(assets: any[] = []): any {
    assets = _.sortBy(assets, 'size')
      .filter((item: any) => Utils.endsWith(item.name, ['.tar.gz', '.tar.xz', '.zip', '.tgz']));

    return _.last(assets);
  }

  public static convertBytes(bytes: number): string {
    const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    if (bytes === 0) {
      return 'n/a';
    }

    const i: number = parseInt(String(Math.floor(Math.log(bytes) / Math.log(1024))));

    if (i === 0) {
      return bytes + ' ' + sizes[i];
    }

    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
  }

  public static getFormattedDate(): string {
    const date: Date = new Date();

    const yyyy: number = date.getFullYear();
    const mm: string = _.padStart((date.getMonth() + 1).toString(), 2, '0');
    const dd: string = _.padStart(date.getDate().toString(), 2, '0');

    const timePart: string = [
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
    ]
      .map((n: number) => _.padStart(n.toString(), 2, '0'))
      .join(':');

    return `${dd}.${mm}.${yyyy} ${timePart}`;
  }

  public static getFullProgress(event: Progress['event']): Progress {
    return {
      success: true,
      progress: 100,
      totalBytes: 0,
      transferredBytes: 0,
      totalBytesFormatted: '',
      transferredBytesFormatted: '',
      itemsCount: 0,
      itemsComplete: 0,
      path: '',
      name: '',
      event,
    } as Progress;
  }
}