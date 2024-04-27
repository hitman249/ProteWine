import FileSystem from './file-system';
import Kernel from './kernel';
import {AbstractModule} from '../../../../server/modules/abstract-module';

export default class Api extends AbstractModule {
  private readonly FILE_SYSTEM: FileSystem = new FileSystem();
  private readonly KERNEL: Kernel = new Kernel();

  private readonly modules: AbstractModule[] = [
    this.FILE_SYSTEM,
    this.KERNEL,
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