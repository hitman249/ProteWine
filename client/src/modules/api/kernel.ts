import {AbstractModule} from '../../../../server/modules/abstract-module';
import {ApiKernel} from '../../../../server/routes/modules/kernel';

export default class Kernel extends AbstractModule {
  public async init(): Promise<void> {
  }

  public async version(): Promise<string> {
    return (await window.electronAPI.invoke(ApiKernel.VERSION));
  }
}