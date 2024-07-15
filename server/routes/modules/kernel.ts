import {AbstractRouteModule} from './abstract-route-module';
import type {IpcMainInvokeEvent} from 'electron';
import {type FileType, KernelOperation, SessionType} from '../../modules/kernels/abstract-kernel';
import {RoutesKernel} from '../routes';
import type WatchProcess from '../../helpers/watch-process';


export default class KernelRoutes extends AbstractRouteModule {
  public async init(): Promise<any> {
    this.bindVersion();
    this.bindLauncher();
    this.bindRun();
    this.bindInstall();
    this.bindWinetricks();
    this.bindCreatePrefix();
    this.bindConfig();
  }

  private bindVersion(): void {
    this.ipc.handle(
      RoutesKernel.VERSION,
      async (): Promise<any> => this.app.getKernels().getKernel().version(),
    );
  }

  private bindRun(): void {
    this.ipc.handle(
      RoutesKernel.RUN,
      async (event: IpcMainInvokeEvent, cmd: string): Promise<any> =>
        this.app.getTasks()
          .kernel(cmd, KernelOperation.RUN)
          .then(() => undefined),
    );
  }

  private bindInstall(): void {
    this.ipc.handle(
      RoutesKernel.INSTALL,
      async (event: IpcMainInvokeEvent, cmd: string): Promise<any> =>
        this.app.getTasks()
          .kernel(cmd, KernelOperation.INSTALL)
          .then(() => undefined),
    );
  }

  private bindWinetricks(): void {
    this.ipc.handle(
      RoutesKernel.WINETRICKS,
      async (event: IpcMainInvokeEvent, cmd: string): Promise<any> =>
        this.app.getTasks()
          .kernel(cmd, KernelOperation.WINETRICKS)
          .then(() => undefined),
    );
  }

  private bindCreatePrefix(): void {
    this.ipc.handle(
      RoutesKernel.CREATE_PREFIX,
      async (event: IpcMainInvokeEvent): Promise<any> =>
        this.app.getTasks()
          .kernel('', KernelOperation.CREATE_PREFIX)
          .then(() => undefined),
    );
  }

  private bindLauncher(): void {
    this.ipc.handle(
      RoutesKernel.LAUNCHER,
      async (event: IpcMainInvokeEvent, type: FileType): Promise<string> => this.app.getKernels().getKernel().getLauncherByFileType(type),
    );
  }

  private bindConfig(): void {
    this.ipc.handle(
      RoutesKernel.CONFIG,
      async (event: IpcMainInvokeEvent): Promise<void> => this.app.getTasks()
        .kernel('winecfg', KernelOperation.RUN, SessionType.RUN_IN_PREFIX)
        .then(() => undefined),
    );
  }
}