import EventListener from '../../../server/helpers/event-listener';
import Helpers from './helpers';
import Value, {ValueLabels, type ValueParams, ValueTypes} from './value';
import {PopupNames} from './popup';
import type Config from '../models/config';
import {GameOperation} from '../models/form-data';

export type MenuItemType = {
  id: string,
  title: string,
  icon?: string,
  poster?: string,
  description?: string,
  type?: string,
  template?: ValueLabels,
  click?: () => void,
  items?: () => Promise<MenuItemType[]>,
  value?: ValueParams,
  popup?: PopupNames,
  item?: any,
};

export class MenuItem {
  private currentIndex: number = 0;
  public readonly parent: Menu | MenuItem;

  public readonly index: number;

  public readonly id: string;
  public readonly icon: string;
  public readonly poster: string;
  public readonly title: string;
  public description: string;
  public readonly template: ValueLabels;
  public readonly value: Value;
  public readonly popup: PopupNames;
  public readonly item: any;

  private readonly fetchItems: MenuItemType['items'];
  public items: MenuItem[];

  public readonly click?: () => void = () => undefined;

  constructor(params: MenuItemType, parent: Menu | MenuItem, index: number) {
    this.parent = parent;

    this.index = index;
    this.id = params.id;
    this.icon = params.icon;
    this.poster = params.poster;
    this.title = params.title;
    this.description = params.description;
    this.template = params.template;
    this.value = params.value ? new Value(params.value) : undefined;
    this.click = params.click;
    this.fetchItems = params.items;
    this.popup = params.popup;
    this.item = params.item;

    if (!this.value && ValueLabels.GAME === params.template && !this.hasItems()) {
      const value: ValueParams = {
        value: 'start',
        type: ValueTypes.SELECT,
        labels: ValueLabels.GAME,
        hidden: true,
      };

      this.value = new Value(value);
    } else if (!this.value && ValueLabels.MANAGE === params.template && !this.hasItems()) {
      const value: ValueParams = {
        value: 'start',
        type: ValueTypes.SELECT,
        labels: ValueLabels.MANAGE,
        hidden: true,
      };

      this.value = new Value(value);
    }
  }

  public async load(): Promise<void> {
    if (this.isLoaded()) {
      return Promise.resolve();
    }

    this.items = [];

    return Promise.resolve(this.fetchItems?.()).then((items: MenuItemType[]) => {
      this.items = (items || []).map((item: MenuItemType, index: number) => {
        return new MenuItem(Object.assign({}, item, {template: item.template || this.template}), this, index);
      });
    });
  }

  public async reload(): Promise<void> {
    this.clear();
    await this.load();
  }

  public clear(): void {
    this.items = undefined;
  }

  public isLoaded(): boolean {
    return undefined !== this.items;
  }

  public getItems(): MenuItem[] {
    return this.items;
  }

  public hasItems(): boolean {
    return undefined !== this.fetchItems;
  }

  public getId(): string {
    return this.id;
  }

  public getIndex(): number {
    return this.index;
  }

  public getIcon(): string {
    return this.icon;
  }

  public getTitle(): string {
    return this.title;
  }

  public setDescription(value: string): void {
    this.description = value;
  }

  public setCurrentIndex(index: number): void {
    this.currentIndex = index;
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public getCurrentItem(): MenuItem {
    return this.items?.[this.currentIndex];
  }

  public isActive(activeIndex?: number): boolean {
    if (undefined !== activeIndex) {
      return activeIndex === this.index;
    }

    return this.parent?.getCurrentIndex() === this.index;
  }

  public getStackIndex(activeIndex?: number): number {
    const index: number = this.index - (undefined !== activeIndex ? activeIndex : this.parent?.getCurrentIndex());

    if (0 === index) {
      return 1;
    }

    if (-1 === index) {
      return 0;
    }

    if (1 === index) {
      return 2;
    }

    return 0;
  }

  public next(): MenuItem | undefined {
    const parent: Menu | MenuItem | undefined = this.parent;

    if (!parent || parent.items.length < this.index + 1) {
      return;
    }

    return parent.items[this.index + 1];
  }

  public prev(): MenuItem | undefined {
    const parent: Menu | MenuItem | undefined = this.parent;

    if (!parent || this.index - 1 < 0) {
      return;
    }

    return parent.items[this.index - 1];
  }

  public getMenu(): Menu {
    let parent: Menu | MenuItem = this;

    while (parent.parent) {
      parent = parent.parent;
    }

    return parent as Menu;
  }

  public getPath(): (Menu | MenuItem)[] {
    let parent: Menu | MenuItem = this;
    const path: (Menu | MenuItem)[] = [parent];

    while (parent.parent) {
      parent = parent.parent;
      path.push(parent);
    }

    return path.reverse();
  }

  public updateFocusedItem(): void {
    const path: (Menu | MenuItem)[] = this.getPath();
    const menu: Menu = this.getMenu();

    menu.setFocusedPath(path);
    menu.setFocusedItem(this);

    let parent: Menu | MenuItem = this;

    while (parent.parent) {
      const index: number = (parent as MenuItem).index;
      parent = parent.parent;
      parent.setCurrentIndex(index);
    }
  }
}

export default class Menu extends EventListener {
  declare public parent: Menu;
  private focusedItem: MenuItem;
  private focusedPath: (Menu | MenuItem)[];

  public static ROOT_ITEM_HEIGHT: number = 170;
  public static ROOT_ITEM_WIDTH: number = 170;

  public static ITEM_HEIGHT: number = 110;

  private currentIndex: number = 0;

  private async fetchGames(): Promise<MenuItemType[]> {
    return (await window.$app.getApi().getGames().getList()).map((config: Config) => config.toObject());
  }

  private async fetchPlugins(): Promise<MenuItemType[]> {
    return window.$app.getApi().getPlugins().getPlugins();
  }

  private async fetchSettings(): Promise<MenuItemType[]> {
    return window.$app.getApi().getPlugins().getSettings();
  }

  public readonly items: MenuItem[] = ([
    {
      id: 'games',
      icon: 'storage',
      title: 'Storage',
      items: async () => Promise.resolve([
        {
          id: 'games',
          icon: 'gamepad',
          title: 'Games',
          template: ValueLabels.GAME,
          items: this.fetchGames,
        },
        {
          id: 'manage',
          icon: 'manage',
          title: 'Manage',
          template: ValueLabels.MANAGE,
          items: this.fetchGames,
        },
        {
          id: 'add-game',
          icon: 'plus',
          title: 'Add game',
          template: ValueLabels.OPERATION,
          items: () => Promise.resolve([
            {
              id: GameOperation.INSTALL_FILE,
              title: 'Install file',
              icon: 'executable',
            },
            {
              id: GameOperation.IMPORT_LINK,
              title: 'Import game link from *.lnk files',
              icon: 'link',
            },
            {
              id: GameOperation.WINETRICKS,
              title: 'Winetricks',
              icon: 'wine',
            },
            {
              id: GameOperation.INSTALL_DISK_IMAGE,
              title: 'Install file from disk image',
              icon: 'disk-image',
            },
            {
              id: GameOperation.COPY_GAME,
              title: 'Copy existing game folder',
              icon: 'copy',
            },
            {
              id: GameOperation.MOVE_GAME,
              title: 'Move existing game folder',
              icon: 'move',
            },
            {
              id: GameOperation.SYMLINK_GAME,
              title: 'Symlink to existing game folder',
              icon: 'symlink',
            },
          ]),
        },
        {
          id: 'exit',
          icon: 'exit',
          title: 'Exit',
          description: `Version ${await window.$app.getApi().getUpdate().appVersion()}`,
          value: {
            hidden: true,
            value: false,
            labels: ValueLabels.YESNO,
            type: ValueTypes.SELECT,
          },
        },
      ]),
    },
    {
      id: 'prefix',
      icon: 'prefix',
      title: 'Prefix',
      items: () => Promise.resolve([
        {
          id: 'wine',
          icon: 'wine',
          title: 'Runner change',
          description: '',
          popup: PopupNames.RUNNER,
        },
        {
          id: 'reset',
          icon: 'reset',
          title: 'Prefix reset',
          value: {
            hidden: true,
            value: false,
            labels: ValueLabels.YESNO,
            type: ValueTypes.SELECT,
          },
        },
        {
          id: 'plugins',
          icon: 'settings',
          title: 'Plugins',
          items: this.fetchPlugins,
        },
        {
          id: 'settings',
          icon: 'settings',
          title: 'Settings',
          items: this.fetchSettings,
        },
      ]),
    },
    {
      id: 'layers',
      icon: 'layers',
      title: 'Layers',
      items: () => Promise.resolve([
        {
          id: 'layers-list',
          icon: 'layers-list',
          title: 'Layers',
        },
        {
          id: 'layers-add',
          icon: 'layers-add',
          title: 'New layer',
        },
      ]),
    },
    {
      id: 'updates',
      icon: 'updates',
      title: 'Updates',
      items: () => Promise.resolve([
        {
          id: 'update-self',
          icon: 'update-self',
          title: 'Update ProteWine',
        },
        {
          id: 'updates',
          icon: 'update-layer',
          title: 'DXVK',
        },
        {
          id: 'updates',
          icon: 'update-layer',
          title: 'VKD3D',
        },
      ]),
    },
    /*{
      id: 'build',
      icon: 'build',
      title: 'Build',
      items: () => Promise.resolve([
        {
          id: 'wine-unpack',
          icon: 'unpack',
          title: 'Unpack Runtime',
        },
        {
          id: 'wine-pack',
          icon: 'pack',
          title: 'Pack Runtime',
        },
        {
          id: 'build-game',
          icon: 'compile',
          title: 'Build portable',
        },
      ]),
    },*/
    /*{
      id: 'database',
      icon: 'database',
      title: 'Database',
      items: () => Promise.resolve([
        {
          id: 'layers-item',
          icon: 'layers-item',
          title: 'DXVK 2.3',
        },
        {
          id: 'layers-item',
          icon: 'layers-item',
          title: 'd3dcompiler',
        },
      ]),
    },*/
  ] as MenuItemType[]).map((item: MenuItemType, index: number) => new MenuItem(item, this, index));

  constructor() {
    super();
    this.items[this.currentIndex].updateFocusedItem();
  }

  public clearGames(): void {
    this.items?.[0]?.items?.[0]?.clear?.();
    this.items?.[0]?.items?.[1]?.clear?.();
  }

  public clearPrefixPlugins(): void {
    this.items?.[1]?.items?.[2]?.clear?.();
    this.items?.[1]?.items?.[3]?.clear?.();
  }

  public getPluginsKeys(): string[] {
    const result: string[] = [];

    const plugins: MenuItem = this.items?.[1]?.items?.[2];
    const settings: MenuItem = this.items?.[1]?.items?.[3];

    for (const group of [plugins, settings]) {
      if ((group?.getItems?.()?.length || 0) > 0) {
        for (const item of group.getItems()) {
          result.push(item.id);
        }
      }
    }

    return result;
  }

  public setWineVersion(version: string): void {
    this.items?.[1]?.items?.[0]?.setDescription(version);
  }

  public setFocusedItem(item: MenuItem): void {
    this.focusedItem = item;
  }

  public setFocusedPath(path: (Menu | MenuItem)[]): void {
    this.focusedPath = path;
  }

  public getFocusedLevel(level: number = 0): MenuItem | undefined {
    return this.focusedPath[level] as MenuItem;
  }

  public setCurrentIndex(index: number): void {
    this.currentIndex = index;
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public getItems(): MenuItem[] {
    return this.items;
  }

  public getCategories(currentIndex: number = this.currentIndex, direction?: boolean | undefined): MenuItem[] {
    const count: number = 3;
    let startIndex: number = currentIndex;

    if (true === direction) {
      if (startIndex > 0) {
        startIndex = startIndex - 1;
      }
    } else if (false === direction) {
      startIndex = startIndex + 1;
    }

    const endIndex: number = startIndex + count;

    return Helpers.shiftArray(
      Helpers.sliceArray(
        this.items,
        startIndex,
        endIndex,
        undefined,
        1,
      ),
      currentIndex % count,
    );
  }

  public getCategoryInstanceIndex(offset: number = 1): number {
    return (this.currentIndex + offset) % 3;
  }

  public getFocusedItem(): MenuItem {
    return this.focusedItem;
  }

  public getFocusedPath(): (Menu | MenuItem)[] {
    return this.focusedPath;
  }

  public backFocus(): boolean {
    if (this.focusedPath.length <= 3) {
      return false;
    }

    this.focusedPath.pop();

    this.setFocusedItem(this.focusedPath[this.focusedPath.length - 1] as MenuItem);

    return true;
  }
}