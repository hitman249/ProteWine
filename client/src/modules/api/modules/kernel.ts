import {AbstractModule} from '../../../../../server/modules/abstract-module';
import {RoutesKernel} from '../../../../../server/routes/routes';
import type {FileType} from '../../../../../server/modules/kernels/abstract-kernel';

export default class Kernel extends AbstractModule {
  public async init(): Promise<void> {
  }

  public async version(): Promise<string> {
    return (await window.electronAPI.invoke(RoutesKernel.VERSION));
  }

  public async getLauncherByFileType(type?: FileType | string): Promise<string> {
    return (await window.electronAPI.invoke(RoutesKernel.LAUNCHER, type));
  }

  public async run(cmd: string): Promise<any> {
    return (await window.electronAPI.invoke(RoutesKernel.RUN, cmd));
  }

  public async install(cmd: string): Promise<any> {
    return (await window.electronAPI.invoke(RoutesKernel.INSTALL, cmd));
  }

  public async winetricks(cmd: string): Promise<any> {
    return (await window.electronAPI.invoke(RoutesKernel.WINETRICKS, cmd));
  }
}