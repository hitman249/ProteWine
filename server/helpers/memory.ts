import _ from 'lodash';
import Utils from './utils';

export default class Memory {
  private memory: Object = {};
  private context: any;

  public setContext(instance: any): this {
    this.context = instance;
    return this;
  }

  public get(key: string): any {
    return _.get(this.memory, key, undefined);
  }

  public set(key: string, value: any): any {
    _.set(this.memory, key, value);
    return value;
  }

  public has(key: string): boolean {
    return _.has(this.memory, key);
  }

  public unset(key: string): void {
    _.unset(this.memory, key);
  }

  public clear(): void {
    this.memory = {};
  }

  public toObject(): Object {
    return this.memory;
  }

  public toJson(): string {
    return Utils.jsonEncode(this.memory);
  }

  public setState(state: Object): this {
    this.memory = state || {};
    return this;
  }

  public isEmpty(): boolean {
    return Utils.isEmpty(this.memory);
  }

  /**
   * Declare Getters and Setters variables to context.
   */
  public declareVariables(...fields: string[]): void {
    if (!this.context) {
      return;
    }

    for (const field of fields) {
      const descriptor: PropertyDescriptor = Object.getOwnPropertyDescriptor(this.context, field);

      if (!descriptor || !descriptor.get) {
        Object.defineProperty(this.context, field, {
          get: () => this.get(field),
          set: (value: any) => this.set(field, value),
        });
      }
    }
  }
}