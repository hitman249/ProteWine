type ValueData = string | boolean | number;

export type ValueParams = {
  value: ValueData,
  type: ValueTypes,
};

export type ValueType = {
  value: ValueData,
  title: string,
};

export enum ValueTypes {
  BOOLEAN = 'boolean',
  INSTALL = 'install',
}

export default class Value {
  private static TYPES: {[type in ValueTypes]: ValueType[]} = {
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
  };

  private value: ValueData;
  private readonly type: ValueTypes;

  constructor(params: ValueParams) {
    this.type = params.type;
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