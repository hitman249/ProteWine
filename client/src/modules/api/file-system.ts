import {AbstractModule} from '../../../../server/modules/abstract-module';
import File, {type FileInfo, FileType} from '../../models/file';
import {ApiFileSystem} from '../../../../server/routes/modules/file-system';

export default class FileSystem extends AbstractModule {
  public async init(): Promise<void> {
  }

  public async ls(path: string): Promise<File[]> {
    return (await window.electronAPI.invoke(ApiFileSystem.LS, path)).map((file: FileInfo) => new File(file));
  }

  public async getStorages(): Promise<File[]> {
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