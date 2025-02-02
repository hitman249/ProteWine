import {BiasModes, FsrModes, FsrSharpening, MouseOverrideAcceleration} from '../../../server/modules/plugins/types';

type ValueData = string | boolean | number;

export type ValueParams = {
  value: ValueData,
  labels: ValueLabels,
  type: ValueTypes,
  hidden?: boolean,
};

export type ValueType = {
  value: ValueData,
  title: string,
};

export enum ValueLabels {
  BOOLEAN = 'boolean',
  INSTALL = 'install',
  WINVER = 'winver',
  YESNO = 'yesno',
  LAYERS = 'layers',
  LAYER = 'layer',
  DB_LAYERS = 'dbLayers',
  GAME = 'game',
  MANAGE = 'manage',
  CONTAINER = 'container',
  OPERATION = 'operation',
  FILE_MANAGER = 'fileManager',
  FSR_MODE = 'fsrMode',
  FSR_STRENGTH = 'fsrStrength',
  BIAS_MODE = 'biasMode',
  MOUSE_OVERRIDE_ACCELERATION = 'mouseOverrideAcceleration',
}

export enum ValueTypes {
  SELECT = 'select',
  BOOLEAN = 'boolean',
}

export default class Value {
  private static COLLECTS: { [type in ValueLabels]: ValueType[] } = {
    [ValueLabels.BOOLEAN]: [
      {
        value: false,
        title: 'Disable',
      },
      {
        value: true,
        title: 'Enable',
      },
    ],
    [ValueLabels.GAME]: [
      {
        value: 'run',
        title: 'Play',
      },
      {
        value: 'debug',
        title: 'Debug',
      },
      {
        value: 'info',
        title: 'Info',
      },
    ],
    [ValueLabels.MANAGE]: [
      {
        value: 'settings',
        title: 'Settings',
      },
      {
        value: 'change-poster',
        title: 'Change poster',
      },
      {
        value: 'change-icon',
        title: 'Change icon',
      },
      {
        value: 'change-exe',
        title: 'Change exe',
      },
      {
        value: 'change-arguments',
        title: 'Change arguments',
      },
      {
        value: 'change-title',
        title: 'Change title',
      },
      {
        value: 'desktop-link',
        title: 'Create desktop link',
      },
      {
        value: 'remove-desktop-link',
        title: 'Remove desktop link',
      },
      {
        value: 'menu-link',
        title: 'Create menu link',
      },
      {
        value: 'remove-menu-link',
        title: 'Remove menu link',
      },
      {
        value: 'steam-link',
        title: 'Create Steam link',
      },
      {
        value: 'remove-steam-link',
        title: 'Remove Steam link',
      },
      {
        value: 'remove-game',
        title: 'Remove',
      },
    ],
    [ValueLabels.INSTALL]: [
      {
        value: false,
        title: 'Install',
      },
      {
        value: true,
        title: 'Uninstall',
      },
    ],
    [ValueLabels.WINVER]: [
      {
        value: 'win10',
        title: 'Windows 10',
      },
      {
        value: 'win7',
        title: 'Windows 7',
      },
      {
        value: 'winxp',
        title: 'Windows XP',
      },
    ],
    [ValueLabels.YESNO]: [
      {
        value: false,
        title: 'No',
      },
      {
        value: true,
        title: 'Yes',
      },
    ],
    [ValueLabels.LAYERS]: [
      {
        value: 'create',
        title: 'Start session',
      },
      {
        value: 'save',
        title: 'Save session',
      },
      {
        value: 'cancel',
        title: 'Cancel',
      },
    ],
    [ValueLabels.DB_LAYERS]: [
      {
        value: 'add-layers',
        title: 'Add to layers',
      },
      {
        value: 'remove-layers',
        title: 'Remove from layers',
      },
      {
        value: 'db-remove',
        title: 'Remove',
      },
    ],
    [ValueLabels.LAYER]: [
      {
        value: 'title',
        title: 'Change title',
      },
      {
        value: 'enable',
        title: 'Enable',
      },
      {
        value: 'disable',
        title: 'Disable',
      },
      {
        value: 'add-db',
        title: 'Add to database',
      },
      {
        value: 'remove-db',
        title: 'Remove from database',
      },
      {
        value: 'remove',
        title: 'Remove',
      },
    ],
    [ValueLabels.FSR_MODE]: [
      {
        value: FsrModes.DISABLE,
        title: 'Disable',
      },
      {
        value: FsrModes.ULTRA,
        title: 'Ultra (1.3x scaling)',
      },
      {
        value: FsrModes.QUALITY,
        title: 'Quality (1.5x scaling)',
      },
      {
        value: FsrModes.BALANCED,
        title: 'Balanced (1.7x scaling)',
      },
      {
        value: FsrModes.PERFORMANCE,
        title: 'Performance (2x scaling)',
      },
    ],
    [ValueLabels.BIAS_MODE]: [
      {
        value: BiasModes.DISABLE,
        title: 'Disable',
      },
      {
        value: BiasModes.ULTRA,
        title: 'Ultra',
      },
      {
        value: BiasModes.QUALITY,
        title: 'Quality',
      },
      {
        value: BiasModes.BALANCED,
        title: 'Balanced',
      },
      {
        value: BiasModes.PERFORMANCE,
        title: 'Performance',
      },
    ],
    [ValueLabels.MOUSE_OVERRIDE_ACCELERATION]: [
      {
        value: MouseOverrideAcceleration.ENABLE,
        title: 'Enable (Default)',
      },
      {
        value: MouseOverrideAcceleration.DISABLE,
        title: 'Disable',
      },
      {
        value: MouseOverrideAcceleration.FORCE,
        title: 'Force',
      },
    ],
    [ValueLabels.FSR_STRENGTH]: [
      {
        value: FsrSharpening.SHARP,
        title: 'Level 0 (Sharp)',
      },
      {
        value: FsrSharpening.LEVEL1,
        title: 'Level 1',
      },
      {
        value: FsrSharpening.DEFAULT,
        title: 'Level 2 (Default)',
      },
      {
        value: FsrSharpening.LEVEL3,
        title: 'Level 3',
      },
      {
        value: FsrSharpening.LEVEL4,
        title: 'Level 4',
      },
      {
        value: FsrSharpening.BLUR,
        title: 'Level 5 (Blur)',
      },
    ],
    [ValueLabels.FILE_MANAGER]: [
      {
        value: 'mount',
        title: 'Mount',
      },
      {
        value: 'execute',
        title: 'Execute',
      },
      {
        value: 'move',
        title: 'Move',
      },
      {
        value: 'copy',
        title: 'Copy',
      },
      {
        value: 'symlink',
        title: 'Create symlink',
      },
      {
        value: 'import',
        title: 'Import',
      },
      {
        value: 'select',
        title: 'Select',
      },
      {
        value: 'install',
        title: 'Install',
      },
    ],
    [ValueLabels.OPERATION]: [],
    [ValueLabels.CONTAINER]: [
      {
        value: 'default',
        title: 'Set default',
      },
      {
        value: 'remove',
        title: 'Remove',
      },
    ],
  };

  private value: ValueData;
  private readonly hidden: boolean;
  private readonly type: ValueLabels;

  constructor(params: ValueParams) {
    this.type = params.labels;
    this.value = params.value;
    this.hidden = Boolean(params.hidden);
  }

  public isVisible(): boolean {
    return !this.hidden;
  }

  public getValue(): ValueData {
    return this.value;
  }

  public getValueFormatted(): string {
    const list: ValueType[] = this.getList();

    for (const value of list) {
      if (value.value === this.value) {
        return value.title;
      }
    }

    return String(this.value);
  }

  public getIndexValue(): number {
    const list: ValueType[] = this.getList();

    for (let i: number = 0, max: number = list.length; i < max; i++) {
      if (list[i].value === this.value) {
        return i;
      }
    }

    return 0;
  }

  public setValue(value: ValueData): void {
    this.value = value;
  }

  public getList(): ValueType[] {
    return Value.COLLECTS[this.type];
  }
}