type ValueData = string | boolean | number;

export type ValueParams = {
  value: ValueData,
  labels: ValueLabels,
  type: ValueTypes,
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
}

export enum ValueTypes {
  SELECT = 'select',
  BOOLEAN = 'boolean',
}

export default class Value {
  private static TYPES: {[type in ValueLabels]: ValueType[]} = {
    boolean: [
      {
        value: true,
        title: 'Enable',
      },
      {
        value: false,
        title: 'Disable',
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
      {
        value: 'win2k',
        title: 'Windows 2000',
      },
    ],
    yesno: [
      {
        value: true,
        title: 'Yes',
      },
      {
        value: false,
        title: 'No',
      },
    ],
  };

  private value: ValueData;
  private readonly type: ValueLabels;

  constructor(params: ValueParams) {
    this.type = params.labels;
    this.value = params.value;
  }

  public getValue(): ValueData {
    return this.value;
  }

  public setValue(value: ValueData): void {
    this.value = value;
  }

  public getList(): ValueType[] {
    return Value.TYPES[this.type];
  }
}