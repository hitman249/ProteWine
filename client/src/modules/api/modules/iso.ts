import {AbstractModule} from '../../../../../server/modules/abstract-module';
import {RoutesGames, RoutesIso} from '../../../../../server/routes/routes';
import type {ConfigType} from '../../../../../server/modules/games/config';

export default class Iso extends AbstractModule {
  public async init(): Promise<void> {
  }

  public async mount(path: string): Promise<string> {
    return (await window.electronAPI.invoke(RoutesIso.MOUNT, path));
  }

  public async unmount(): Promise<void> {
    return (await window.electronAPI.invoke(RoutesIso.UNMOUNT));
  }
}