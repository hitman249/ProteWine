export default class ItemsBucket {
  private static timeout: number;
  private static writes: Function[] = [];

  private static start(): void {
    if (ItemsBucket.timeout) {
      return;
    }

    ItemsBucket.timeout = setTimeout(() => {
      ItemsBucket.writes.forEach((callback: Function) => callback?.());
      ItemsBucket.writes = [];
      ItemsBucket.timeout = undefined;
    }, 200) as unknown as number;
  }

  public static mutate(callback: () => void): void {
    ItemsBucket.start();
    ItemsBucket.writes.push(callback);
  }
}
