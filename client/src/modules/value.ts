import {FsrModes, FsrSharpening} from '../../../server/modules/plugins/types';

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
  GAME = 'game',
  MANAGE = 'manage',
  FILE_MANAGER = 'fileManager',
  FSR_MODE = 'fsrMode',
  FSR_STRENGTH = 'fsrStrength',
}

export enum ValueTypes {
  SELECT = 'select',
  BOOLEAN = 'boolean',
}

export default class Value {
  private static COLLECTS: {[type in ValueLabels]: ValueType[]} = {
    boolean: [
      {
        value: false,
        title: 'Disable',
      },
      {
        value: true,
        title: 'Enable',
      },
    ],
    game: [
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
    manage: [
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
        value: 'remove-game',
        title: 'Remove',
      },
    ],
    install: [
      {
        value: false,
        title: 'Install',
      },
      {
        value: true,
        title: 'Uninstall',
      },
    ],
    winver: [
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
    yesno: [
      {
        value: false,
        title: 'No',
      },
      {
        value: true,
        title: 'Yes',
      },
    ],
    fsrMode: [
      {
        value: FsrModes.DISABLE,
        title: 'Disable',
      },
      {
        value: FsrModes.ULTRA,
        title: 'Ultra',
      },
      {
        value: FsrModes.QUALITY,
        title: 'Quality',
      },
      {
        value: FsrModes.BALANCED,
        title: 'Balanced',
      },
      {
        value: FsrModes.PERFORMANCE,
        title: 'Performance',
      },
    ],
    fsrStrength: [
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
    fileManager: [
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