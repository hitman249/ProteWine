import {AbstractModule} from '../../../../server/modules/abstract-module';
import FileSystem from './modules/file-system';
import Kernel from './modules/kernel';
import Tasks from './modules/tasks';
import Games from './modules/games';
import Iso from './modules/iso';

export default class Api extends AbstractModule {
  private readonly FILE_SYSTEM: FileSystem = new FileSystem();
  private readonly KERNEL: Kernel = new Kernel();
  private readonly TASKS: Tasks = new Tasks();
  private readonly GAMES: Games = new Games();
  private readonly ISO: Iso = new Iso();

  private readonly modules: AbstractModule[] = [
    this.FILE_SYSTEM,
    this.KERNEL,
    this.TASKS,
    this.GAMES,
    this.ISO,
  ];

  public async init(): Promise<any> {
    for await (const module of this.modules) {
      await module.init();
    }
  }

  public getFileSystem(): FileSystem {
    return this.FILE_SYSTEM;
  }

  public getKernel(): Kernel {
    return this.KERNEL;
  }

  public getTasks(): Tasks {
    return this.TASKS;
  }

  public getGames(): Games {
    return this.GAMES;
  }

  public getIso(): Iso {
    return this.ISO;
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