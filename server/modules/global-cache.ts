import Utils from '../helpers/utils';
import type FileSystem from './file-system';
import type AppFolders from './app-folders';
import {AbstractModule} from './abstract-module';
import Memory from '../helpers/memory';

export default class GlobalCache extends AbstractModule {
  private memory: Memory = new Memory();
  private path: string;

  private appFolders: AppFolders;
  private fs: FileSystem;

  constructor(appFolders: AppFolders) {
    super();
    this.appFolders = appFolders;
  }

  public async init(): Promise<any> {
    this.fs = this.appFolders.getFileSystem();
    this.path = (await this.appFolders.getCacheDir()) + '/cache.json';
    await this.read();
  }

  public async read(): Promise<void> {
    if (this.memory.isEmpty()) {
      if (await this.fs.exists(this.path)) {
        this.memory.setState(Utils.jsonDecode(await this.fs.fileGetContents(this.path)));
      }

      this.memory.set('_loaded_', true);
    }
  }

  private async save(): Promise<void> {
    const dir: string = await this.appFolders.getCacheDir();

    if (!await this.fs.exists(dir)) {
      await this.fs.mkdir(dir);
    }

    await this.fs.filePutContents(this.path, this.memory.toJson());
  }

  public async get(key: string): Promise<any> {
    return this.memory.get(key);
  }

  public async set(key: string, value: any): Promise<any> {
    this.memory.set(key, value);
    await this.save();

    return value;
  }

  public async has(key: string): Promise<boolean> {
    return this.memory.has(key);
  }

  public async reset(key?: string): Promise<void> {
    if (undefined === key) {
      this.memory.clear();
    } else {
      this.memory.unset(key);
    }

    await this.save();
  }
}