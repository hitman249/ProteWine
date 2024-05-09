export type FileInfo = {
  basename: string,
  directory: boolean,
  dirname: string,
  extension: string,
  path: string,
  size: number,
  sizeFormat: string,
};

export enum FileType {
  IMAGE = 'image',
  MUSIC = 'music',
  VIDEO = 'video',
  TEXT = 'text',
  FILE = 'file',
  ARCHIVE = 'archive',
  EXECUTABLE = 'executable',
  DIRECTORY = 'directory',
  DISK_IMAGE = 'disk-image',
  HOME = 'home',
  STORAGE = 'storage',
  ROOT = 'root',
}

const ARCHIVE: string[] = [
  '7z',
  'bz',
  'bz2',
  'gz',
  'jar',
  'pol',
  'rar',
  'tar',
  'tar.bz2',
  'tar.gz',
  'tar.xz',
  'tar.zst',
  'tbz2',
  'tgz',
  'xz',
  'zip',
  'zst',
];

const IMAGE: string[] = [
  'gif',
  'ico',
  'jpeg',
  'jpg',
  'png',
  'svg',
  'webp',
];

const MUSIC: string[] = [
  'flac',
  'm3u8',
  'mp3',
  'ogg',
  'wav',
];

const DISK_IMAGE: string[] = [
  'iso',
  'nrg',
  'mdf',
  'img',
];

const VIDEO: string[] = [
  'avi',
  'flv',
  'mkv',
  'mp4',
  'mpeg',
  'mpg',
  'mts',
  'webm',
];

const TEXT: string[] = [
  'c',
  'cfg',
  'conf',
  'cpp',
  'crt',
  'doc',
  'docx',
  'dsc',
  'h',
  'html',
  'ino',
  'js',
  'json',
  'jsx',
  'key',
  'key',
  'log',
  'log',
  'odt',
  'ts',
  'tsx',
  'txt',
  'xls',
  'xml',
  'yaml',
  'ini',
  'info',
  'desktop',
];

const EXECUTION: string[] = [
  'AppImage',
  'bat',
  'com',
  'deb',
  'exe',
  'msi',
  'pkg',
  'rpm',
  'sh',
];

export default class File {
  public readonly basename: string;
  public readonly directory: boolean;
  public readonly dirname: string;
  private readonly extension: string;
  public readonly path: string;
  private readonly size: number;
  public readonly sizeFormat: string;
  private storage: boolean = false;
  private type: FileType;

  constructor(params: FileInfo) {
    this.basename = params.basename;
    this.directory = params.directory;
    this.dirname = params.dirname;
    this.extension = params.extension;
    this.path = params.path;
    this.size = params.size;
    this.sizeFormat = params.sizeFormat;

    if (this.directory) {
      this.type = FileType.DIRECTORY;
    } else if (-1 !== ARCHIVE.indexOf(this.extension)) {
      this.type = FileType.ARCHIVE;
    } else if (-1 !== IMAGE.indexOf(this.extension)) {
      this.type = FileType.IMAGE;
    } else if (-1 !== MUSIC.indexOf(this.extension)) {
      this.type = FileType.MUSIC;
    } else if (-1 !== VIDEO.indexOf(this.extension)) {
      this.type = FileType.VIDEO;
    } else if (-1 !== TEXT.indexOf(this.extension)) {
      this.type = FileType.TEXT;
    } else if (-1 !== EXECUTION.indexOf(this.extension)) {
      this.type = FileType.EXECUTABLE;
    } else if (-1 !== DISK_IMAGE.indexOf(this.extension)) {
      this.type = FileType.DISK_IMAGE;
    } else {
      this.type = FileType.FILE;
    }
  }

  public async getSize(): Promise<number> {
    return this.size;
  }

  public isDirectory(): boolean {
    return this.directory;
  }

  public isExecutable(): boolean {
    return FileType.EXECUTABLE === this.type;
  }

  public isDiskImage(): boolean {
    return FileType.DISK_IMAGE === this.type;
  }

  public getExtension(): string {
    return this.extension;
  }

  public getPath(): string {
    return this.path;
  }

  public setType(type: FileType): void {
    this.type = type;
  }

  public getType(): FileType {
    return this.type;
  }

  public setStorage(storage: boolean): void {
    this.storage = storage;
  }

  public isStorage(): boolean {
    return Boolean(this.storage);
  }
}