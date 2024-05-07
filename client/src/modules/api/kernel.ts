import {AbstractModule} from '../../../../server/modules/abstract-module';
import {RoutesKernel} from '../../../../server/routes/routes';

export default class Kernel extends AbstractModule {
  public async init(): Promise<void> {
  }

  public async version(): Promise<string> {
    return (await window.electronAPI.invoke(RoutesKernel.VERSION));
  }

  public async run(cmd: string): Promise<any> {
    return (await window.electronAPI.invoke(RoutesKernel.RUN, cmd));
  }
}