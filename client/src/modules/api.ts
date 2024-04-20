import File, {type FileInfo, FileType} from '../models/file';
import {ApiFileSystem} from '../../../server/routes/rules';

export default class Api {
  public async getFileSystemLs(path: string): Promise<File[]> {
    return (await window.electronAPI.invoke(ApiFileSystem.LS, path)).map((file: FileInfo) => new File(file));
  }

  public async getFileSystemStorages(): Promise<File[]> {
    return (await window.electronAPI.invoke(ApiFileSystem.STORAGES)).map((file: FileInfo) => {
      const storage: File = new File(file);
      storage.setStorage(true);

      if ('/' === storage.path) {
        storage.setType(FileType.ROOT);
      } else if (0 === storage.path.indexOf('/home/')) {
        storage.setType(FileType.HOME);
      } else {
        storage.setType(FileType.STORAGE);
      }

      return storage;
    });
  }
}

declare global {
  interface Window {
    electronAPI: {
      invoke: (channel: string, ...args: any[]) => Promise<any>,
      receive: (channel: string, listener: (...args: any[]) => void) => void,
      send: (channel: string, ...args: any[]) => void,
    };
  }
}