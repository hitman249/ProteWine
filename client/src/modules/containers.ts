import Menu, {MenuItem, type MenuItemType} from './menu';
import {ValueLabels, ValueTypes} from './value';
import {PopupNames} from './popup';
import {GameOperation} from '../models/form-data';

export default class ContainersMenu extends Menu {
  public static ITEM_HEIGHT: number = 120;

  public static ROOT_ITEM_HEIGHT: number = 220;
  public static ROOT_ITEM_WIDTH: number = 220;


  public readonly items: MenuItem[] = ([
    {
      id: 'games',
      icon: 'containers',
      title: 'PC',
      items: async () => Promise.resolve([
        {
          id: 'containers',
          icon: 'container',
          title: 'Containers',
          template: ValueLabels.CONTAINER,
          items: async () => Promise.resolve([
            {
              id: '1',
              title: 'Project I.G.I.',
              poster: 'https://m.media-amazon.com/images/M/MV5BZTZhYTQ0YzAtYTIwMy00ZDJhLTllMmItODQ5MDEzNjRkMGJhXkEyXkFqcGc@._V1_.jpg',
              value: {
                hidden: true,
                value: 'default',
                labels: ValueLabels.CONTAINER,
                type: ValueTypes.SELECT,
              },
            },
            {
              id: '2',
              title: 'Kings Bounty',
              poster: 'https://www.digiseller.ru/preview/467960/p1_3073130_6e00d3bd.jpg',
              template: ValueLabels.CONTAINER,
            },
            {
              id: '3',
              title: 'Helldivers',
              poster: 'https://www.digiseller.ru/preview/232073/p1_3202808_5ba72db2.jpg',
              template: ValueLabels.CONTAINER,
            },
            {
              id: '4',
              title: 'Grand Theft Auto: Vice City',
              poster: 'https://pic.rutubelist.ru/video/ff/84/ff844ccb12d485003daf963c93e3c16e.jpg',
              template: ValueLabels.CONTAINER,
            },
            {
              id: '4',
              title: 'Spell Force 2',
              poster: 'https://shop.buka.ru/data/img_files/2233/additional750x580/ferrKPTHY5.jpg',
              template: ValueLabels.CONTAINER,
            },
            {
              id: '5',
              title: 'Stellaris Auatics',
              poster: 'https://shop.buka.ru/data/img_files/11290/additional750x580/rR42taIb0J.jpg',
              template: ValueLabels.CONTAINER,
            },
            {
              id: '6',
              title: 'Tyranny Portrait Pack',
              poster: 'https://img.xcomdb.ru/ee/0d/5e9809aee0dd8806914940_750.jpg',
              template: ValueLabels.CONTAINER,
            },
            {
              id: '7',
              title: 'Total War Warhammer: Rise of the Tomb Kings Total War Warhammer: Rise of the Tomb Kings',
              poster: 'https://www.digiseller.ru/preview/73392/p1_3224305_5aeccf32.jpg',
              template: ValueLabels.CONTAINER,
            },
          ]),
        },
        {
          id: 'manage',
          icon: 'manage',
          title: 'Manage',
          template: ValueLabels.CONTAINER,
          items: async () => Promise.resolve([
            {
              id: '1',
              title: 'Project I.G.I.',
              poster: 'https://m.media-amazon.com/images/M/MV5BZTZhYTQ0YzAtYTIwMy00ZDJhLTllMmItODQ5MDEzNjRkMGJhXkEyXkFqcGc@._V1_.jpg',
              template: ValueLabels.MANAGE,
            },
            {
              id: '2',
              title: 'Kings Bounty',
              poster: 'https://www.digiseller.ru/preview/467960/p1_3073130_6e00d3bd.jpg',
              template: ValueLabels.MANAGE,
            },
            {
              id: '3',
              title: 'Helldivers',
              poster: 'https://www.digiseller.ru/preview/232073/p1_3202808_5ba72db2.jpg',
              template: ValueLabels.MANAGE,
            },
            {
              id: '4',
              title: 'Grand Theft Auto: Vice City',
              poster: 'https://pic.rutubelist.ru/video/ff/84/ff844ccb12d485003daf963c93e3c16e.jpg',
              template: ValueLabels.MANAGE,
            },
            {
              id: '4',
              title: 'Spell Force 2',
              poster: 'https://shop.buka.ru/data/img_files/2233/additional750x580/ferrKPTHY5.jpg',
              template: ValueLabels.MANAGE,
            },
            {
              id: '5',
              title: 'Stellaris Auatics',
              poster: 'https://shop.buka.ru/data/img_files/11290/additional750x580/rR42taIb0J.jpg',
              template: ValueLabels.MANAGE,
            },
            {
              id: '6',
              title: 'Tyranny Portrait Pack',
              poster: 'https://img.xcomdb.ru/ee/0d/5e9809aee0dd8806914940_750.jpg',
              template: ValueLabels.MANAGE,
            },
            {
              id: '7',
              title: 'Total War Warhammer: Rise of the Tomb Kings Total War Warhammer: Rise of the Tomb Kings',
              poster: 'https://www.digiseller.ru/preview/73392/p1_3224305_5aeccf32.jpg',
              template: ValueLabels.MANAGE,
            },
          ]),
        },
        {
          id: 'add-container',
          icon: 'plus',
          title: 'New container',
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
              description: '.iso, .nrg, .mdf, .img',
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
      id: 'storages',
      icon: 'storages',
      title: 'Storage Devices',
      items: () => Promise.resolve([
        {
          id: 'nodes',
          icon: 'nodes',
          title: 'List of entry points',
          description: 'Path for storage folders',
          items: () => Promise.resolve([
            {
              id: 1,
              title: '/home/neiron/work/protewine/dist',
              icon: 'directory',
            },
            {
              id: 2,
              title: '/home/neiron/work/protewine/dist',
              icon: 'directory',
            },
            {
              id: 3,
              title: '/media/neiron/bda20cbd-bcba-452f-a158-4bd14b867e8e/Games',
              icon: 'directory',
            },
          ]),
        },
        {
          id: 'new-entrypoint',
          icon: 'plus',
          title: 'New entrypoint',
          popup: PopupNames.EXECUTING,
        },
      ]),
    },
  ] as MenuItemType[]).map((item: MenuItemType, index: number) => new MenuItem(item, this, index));
}