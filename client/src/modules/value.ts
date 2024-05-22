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
        value: 'run-debug',
        title: 'Debug',
      },
      {
        value: 'game-info',
        title: 'Info',
      },
    ],
    manage: [
      {
        value: 'create-icon',
        title: 'Create icon',
      },
      {
        value: 'create-icon',
        title: 'Remove icon',
      },
      {
        value: 'change-icon',
        title: 'Change icon',
      },
      {
        value: 'change-poster',
        title: 'Change poster',
      },
      {
        value: 'change-background',
        title: 'Change background',
      },
      {
        value: 'remove-game',
        title: 'Remove game',
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
        value: 'win11',
        title: 'Windows 11',
      },
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