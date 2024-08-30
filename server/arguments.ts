import process from 'process';

export type ArgumentsType = {[field: string]: string | string[]};

export default  class Arguments {
  private readonly params: ArgumentsType;

  constructor() {
    this.params = this.getArguments();
  }

  public getArguments(): ArgumentsType {
    const chunks: string[] = JSON.parse(JSON.stringify(process.argv));
    chunks.shift();

    let params: {[field: string]: string | string[]} = {};

    for (const chunk of chunks) {
      if (chunk.substring(0, 1) === '/' || '.' === chunk || '..' === chunk) {
        continue;
      }

      const start: number = chunk.substring(0, 2) === '--' ? 2 : (chunk.substring(0, 1) === '--' ? 1 : 0);
      const [field, ...value]: string[] = chunk.substring(start).split('=');

      if (undefined === params[field]) {
        params[field] = value.join('=');
      } else if (Array.isArray(params[field])) {
        (params[field] as string[]).push(value.join('='));
      } else {
        params[field] = [params[field] as string, value.join('=')];
      }
    }

    return params;
  }

  private isEnable(value: string | string[]): boolean {
    if (Array.isArray(value)) {
      return true;
    }

    return '1' === value || '' === value;
  }

  public isDebug(): boolean {
    return this.isEnable(this.params['debug']);
  }

  public isHeadless(): boolean {
    return this.isEnable(this.params['headless']);
  }

  public isFullscreen(): boolean {
    return this.isEnable(this.params['fullscreen']);
  }

  public getGameId(): string {
    return this.params['game'] as string;
  }
}