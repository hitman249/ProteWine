import {AbstractModule} from '../../../../../server/modules/abstract-module';
import {RoutesGames} from '../../../../../server/routes/routes';
import type {ConfigType} from '../../../../../server/modules/games/config';
import type {LinkInfoData} from '../../../../../server/modules/link-info';
import Config from '../../../models/config';
import type {ImageType} from '../../../../../server/modules/gallery';

export default class Games extends AbstractModule {
  public async init(): Promise<void> {
  }

  public async getList(): Promise<Config[]> {
    const list: ConfigType[] = (await window.electronAPI.invoke(RoutesGames.LIST));
    return list.map((config: ConfigType) => new Config(config));
  }

  public async getById(id: number | string): Promise<Config> {
    const configs: Config[] = await this.getList();
    id = String(id);

    return configs.find((config: Config) => config.id === id);
  }

  public async create(data: ConfigType['game']): Promise<ConfigType[]> {
    return (await window.electronAPI.invoke(RoutesGames.CREATE, data));
  }

  public async removeById(id: string | number): Promise<void> {
    return (await window.electronAPI.invoke(RoutesGames.REMOVE, id));
  }

  public async runById(id: string | number): Promise<void> {
    return (await window.electronAPI.invoke(RoutesGames.RUN, id));
  }

  public async debugById(id: string | number): Promise<void> {
    return (await window.electronAPI.invoke(RoutesGames.DEBUG, id));
  }

  public async kill(): Promise<void> {
    return (await window.electronAPI.invoke(RoutesGames.KILL));
  }

  public async getRunningGame(): Promise<Config | undefined> {
    const config: ConfigType = (await window.electronAPI.invoke(RoutesGames.RUNNING_GAME));

    if (config) {
      return new Config(config);
    }
  }

  public async updateImage(image: ImageType, id: string, type: 'poster' | 'icon'): Promise<void> {
    return (await window.electronAPI.invoke(RoutesGames.UPDATE_IMAGE, image, id, type));
  }

  public async updateExe(id: string, path: string): Promise<void> {
    return (await window.electronAPI.invoke(RoutesGames.UPDATE_EXE, id, path));
  }

  public async updateArguments(id: string, cmd: string): Promise<void> {
    return (await window.electronAPI.invoke(RoutesGames.UPDATE_ARGUMENTS, id, cmd));
  }

  public async updateTitle(id: string, title: string): Promise<void> {
    return (await window.electronAPI.invoke(RoutesGames.UPDATE_TITLE, id, title));
  }

  public async findLinks(): Promise<LinkInfoData[]> {
    return (await window.electronAPI.invoke(RoutesGames.FIND_LINKS));
  }
}