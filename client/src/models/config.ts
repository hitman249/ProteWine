import type {ConfigType} from '../../../server/modules/games/config';
import type {MenuItemType} from '../modules/menu';

export default class Config {
  private readonly config: ConfigType;

  constructor(config: ConfigType) {
    this.config = config;
  }

  public get id(): string {
    return String(this.config.createAt);
  }

  public get title(): string {
    return this.config.game.name;
  }

  public get time(): number {
    return this.config.game.time;
  }

  public get poster(): string {
    return this.config.poster;
  }

  public get icon(): string {
    return this.config.icon;
  }

  public toObject(): MenuItemType {
    return {
      id: this.id,
      title: this.title,
      poster: this.poster || this.icon,
      icon: this.icon,
    };
  }
}