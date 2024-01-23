import EventListener from '../../../server/helpers/event-listener';
import Helpers from './helpers';

type MenuItemType = {
  id: string,
  icon: string,
  title: string,
  description: string,
  click?: () => void,
  items?: () => MenuItemType[],
};

export class MenuItem {
  private currentIndex: number = 0;
  public readonly parent: Menu | MenuItem;

  public readonly index: number;

  public readonly id: string;
  public readonly icon: string;
  public readonly title: string;
  public readonly description: string;
  private readonly fetchItems: MenuItemType['items'];
  public items: MenuItem[];

  public readonly click?: () => void = () => undefined;

  constructor(params: MenuItemType, parent: Menu | MenuItem, index: number) {
    this.parent = parent;

    this.index = index;
    this.id = params.id;
    this.icon = params.icon;
    this.title = params.title;
    this.description = params.description || '';
    this.click = params.click;
    this.fetchItems = params.items;
  }

  public async load(): Promise<void> {
    if (this.isLoaded()) {
      return Promise.resolve();
    }

    this.items = [];

    return Promise.resolve(this.fetchItems?.()).then((items: MenuItemType[]) => {
      this.items = (items || []).map((item: MenuItemType, index: number) => new MenuItem(item, this, index));
    });
  }

  public isLoaded(): boolean {
    return undefined !== this.items;
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

  public setCurrentIndex(index: number): void {
    this.currentIndex = index;
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public isActive(): boolean {
    return this.parent?.getCurrentIndex() === this.index;
  }

  public getStackIndex(): number {
    const index: number = this.index - this.parent?.getCurrentIndex();

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
}

export default class Menu extends EventListener {
  public static ROOT_ITEM_HEIGHT: number = 170;
  public static ROOT_ITEM_WIDTH: number = 170;
  
  public static ITEM_HEIGHT: number = 110;

  private readonly dummySymbol: Symbol = Symbol('dummy');

  private currentIndex: number = 0;

  protected readonly root: MenuItem[] = ([
    {
      id: 'games',
      icon: 'gamepad',
      title: 'Games',
      items: () => [
        {
          id: 'games',
          icon: 'gamepad',
          title: 'Games',
        },
        {
          id: 'add-game',
          icon: 'plus',
          title: 'Add game',
        },
      ],
    },
    {
      id: 'prefix',
      icon: 'prefix',
      title: 'Prefix',
      items: () => [
        {
          id: 'wine',
          icon: 'wine',
          title: 'Runtime change',
          description: 'Wine 9.0',
        },
        {
          id: 'reset',
          icon: 'reset',
          title: 'Prefix reset',
        },
        {
          id: 'settings',
          icon: 'settings',
          title: 'Settings',
          items: () => [
            {
              id: 'wine-unpack',
              icon: 'settings',
              title: 'DXVK',
            },
            {
              id: 'wine-pack',
              icon: 'settings',
              title: 'VKD3D Proton',
            },
            {
              id: 'build-game',
              icon: 'settings',
              title: 'Media Foundation',
            },
          ],
        },
      ],
    },
    {
      id: 'layers',
      icon: 'layers',
      title: 'Layers',
      items: () => [
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
      ],
    },
    {
      id: 'updates',
      icon: 'updates',
      title: 'Updates',
      items: () => [
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
      ],
    },
    {
      id: 'settings',
      icon: 'settings',
      title: 'Settings',
      items: () => [],
    },
    {
      id: 'build',
      icon: 'build',
      title: 'Build',
      items: () => [
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
      ],
    },
    {
      id: 'database',
      icon: 'database',
      title: 'Database',
      items: () => [
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
      ],
    },
  ] as MenuItemType[]).map((item: MenuItemType, index: number) => new MenuItem(item, this, index));

  public setCurrentIndex(index: number): void {
    this.currentIndex = index;
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public getRoot(): MenuItem[] {
    return this.root;
  }

  public getCategory(index: number = this.currentIndex): MenuItem {
    return this.root[index];
  }

  public getCategories(direction?: boolean | undefined): MenuItem[] {
    const count: number = 3;
    let startIndex: number = this.currentIndex;

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
        this.root,
        startIndex,
        endIndex,
        undefined,
        1,
      ),
      this.currentIndex % count,
    );
  }

  public getCategoryInstanceIndex(offset: number = 1): number {
    return (this.currentIndex + offset) % 3;
  }

  public getFocusedItem(): MenuItem {
    const category: MenuItem = this.root[this.currentIndex];
    return category.items[category.getCurrentIndex()];
  }
}