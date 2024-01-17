import EventListener from '../../../server/helpers/event-listener';
import Helpers from './helpers';

type MenuItemType = {
  id: string,
  icon: string,
  title: string,
  click?: () => void,
  items?: MenuItemType[],
};

export class MenuItem {
  private currentIndex: number = 0;
  public readonly parent: Menu | MenuItem;

  public readonly index: number;

  public readonly id: string;
  public readonly icon: string;
  public readonly title: string;
  public readonly items?: MenuItem[] = [];
  public readonly click?: () => void = () => undefined;

  constructor(params: MenuItemType, parent: Menu | MenuItem, index: number) {
    this.parent = parent;

    this.index = index;
    this.id = params.id;
    this.icon = params.icon;
    this.title = params.title;
    this.click = params.click;
    this.items = (params?.items || []).map((item: MenuItemType, index: number) => new MenuItem(item, this, index));
  }

  public getId(): string {
    return this.id;
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
  public static ROOT_ITEM_WIDTH: number = 200;
  
  public static ITEM_HEIGHT: number = 110;

  private readonly dummySymbol: Symbol = Symbol('dummy');

  private currentIndex: number = 0;

  protected readonly root: MenuItem[] = [
    {
      id: 'games',
      icon: 'gamepad',
      title: 'Games',
      items: [
        {
          id: 'games',
          icon: 'gamepad',
          title: 'Games',
          items: [],
        },
        {
          id: 'prefix',
          icon: 'prefix',
          title: 'Prefix',
          items: [],
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
      items: [
        {
          id: 'prefix',
          icon: 'prefix',
          title: 'Prefix',
          items: [],
        },
        {
          id: 'layouts',
          icon: 'layouts',
          title: 'Layouts',
          items: [],
        },
        {
          id: 'updates',
          icon: 'updates',
          title: 'Updates',
          items: [],
        },
        {
          id: 'database',
          icon: 'database',
          title: 'Database',
          items: [],
        },
      ],
    },
    {
      id: 'layouts',
      icon: 'layouts',
      title: 'Layouts',
      items: [
        {
          id: 'layouts',
          icon: 'layouts',
          title: 'Layouts',
          items: [],
        },
        {
          id: 'updates',
          icon: 'updates',
          title: 'Updates',
          items: [],
        },
        {
          id: 'database',
          icon: 'database',
          title: 'Database',
          items: [],
        },
        {
          id: 'settings',
          icon: 'settings',
          title: 'Settings',
          items: [],
        },
        {
          id: 'build',
          icon: 'build',
          title: 'Build',
          items: [],
        },
      ],
    },
    {
      id: 'updates',
      icon: 'updates',
      title: 'Updates',
      items: [

        {
          id: 'updates',
          icon: 'updates',
          title: 'Updates',
          items: [],
        },
        {
          id: 'layouts',
          icon: 'layouts',
          title: 'Layouts',
          items: [],
        },
        {
          id: 'database',
          icon: 'database',
          title: 'Database',
          items: [],
        },
      ],
    },
    {
      id: 'database',
      icon: 'database',
      title: 'Database',
      items: [],
    },
    {
      id: 'settings',
      icon: 'settings',
      title: 'Settings',
      items: [],
    },
    {
      id: 'build',
      icon: 'build',
      title: 'Build',
      items: [],
    },
  ].map((item: MenuItemType, index: number) => new MenuItem(item, this, index));

  public setCurrentIndex(index: number): void {
    this.currentIndex = index;
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public getRoot(): MenuItem[] {
    return this.root;
  }

  public getCategories(): MenuItem[] {
    const count: number = 3;
    const startIndex: number = this.currentIndex;
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
}