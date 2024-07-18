export enum GameOperation {
  INSTALL_FILE = 'install-file',
  INSTALL_DISK_IMAGE = 'install-disk-image',
  COPY_GAME = 'copy-game',
  MOVE_GAME = 'move-game',
  SYMLINK_GAME = 'symlink-game',
  IMPORT_LINK = 'import-link',
  WINETRICKS = 'winetricks',
  PREFIX = 'prefix',
  SELECT_IMAGE = 'select-image',
  SELECT_EXE = 'select-exe',
  DEBUG = 'debug',
  RUNNER_INSTALL = 'runner-install',
}

export enum FileManagerMode {
  EXECUTABLE = 'executable',
  DISK_IMAGE = 'disk-image',
  IMAGE = 'image',
  DIRECTORY = 'directory',
}

export default class FormData<T> {
  public operation: GameOperation;
  public path: string;
  public data: T;
  public additionalData: any;
  public fileManagerMode: FileManagerMode;
  public fileManagerRootPath: string;
  public fileManagerExecutable: boolean = false;
  public fileManagerImage: boolean = false;
  public fileManagerMountImage: boolean = false;
  public extension: string;
  public callback: (result?: any) => void;
  public rejectCallback: (result?: any) => void;

  constructor(data?: T) {
    this.data = data;
  }

  public getAdditionalData(): any {
    return this.additionalData;
  }

  public getData(): any {
    return this.data;
  }

  public setAdditionalData(data: any): any {
    this.additionalData = data;
  }

  public setCallback(func: (result?: any) => void): any {
    this.callback = func;
  }

  public setRejectCallback(func: (result?: any) => void): any {
    this.rejectCallback = func;
  }

  public runCallback(result?: any): void {
    this.callback?.(result);
  }

  public runRejectCallback(result?: any): void {
    this.rejectCallback?.(result);
  }

  public setOperation(operation: GameOperation): this {
    this.operation = operation;

    if (GameOperation.INSTALL_FILE === operation || GameOperation.DEBUG === operation || GameOperation.SELECT_EXE === operation) {
      this.fileManagerMode = FileManagerMode.EXECUTABLE;
    } else if (GameOperation.INSTALL_DISK_IMAGE === operation) {
      this.fileManagerMode = FileManagerMode.DISK_IMAGE;
    } else if (GameOperation.SELECT_IMAGE === operation) {
      this.fileManagerMode = FileManagerMode.IMAGE;
    } else if (GameOperation.COPY_GAME === operation || GameOperation.MOVE_GAME === operation || GameOperation.SYMLINK_GAME === operation) {
      this.fileManagerMode = FileManagerMode.DIRECTORY;
    } else {
      this.fileManagerMode = undefined;
    }

    return this;
  }

  public getOperation(): GameOperation {
    return this.operation;
  }

  public setExtension(ext: string): void {
    this.extension = ext;
  }

  public getExtension(): string {
    return this.extension;
  }

  public setPath(path: string): this {
    this.path = path;
    return this;
  }

  public getPath(): string {
    return this.path;
  }

  public getFileManagerMode(): FileManagerMode {
    return this.fileManagerMode;
  }

  public getFileManagerRootPath(): string {
    return this.fileManagerRootPath;
  }

  public setFileManagerRootPath(path: string): this {
    this.fileManagerRootPath = path;
    return this;
  }

  public setFileManagerExecutable(value: boolean): this {
    this.fileManagerExecutable = Boolean(value);
    return this;
  }

  public isFileManagerExecutable(): boolean {
    return this.fileManagerExecutable;
  }

  public setFileManagerImage(value: boolean): this {
    this.fileManagerImage = Boolean(value);
    return this;
  }

  public isFileManagerImage(): boolean {
    return this.fileManagerImage;
  }

  public setFileManagerMountImage(value: boolean): this {
    this.fileManagerMountImage = Boolean(value);
    return this;
  }

  public isFileManagerMountImage(): boolean {
    return this.fileManagerMountImage;
  }
}