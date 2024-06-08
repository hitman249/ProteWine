import type {ImageType} from '../../../server/modules/gallery';

export default class Image {
  public readonly thumb: string;
  public readonly url: string;
  public readonly type: ImageType['type'];
  private path: string;

  constructor(params: ImageType) {
    this.thumb = params.thumb;
    this.url = params.url;
    this.type = params.type || 'url';
  }

  public getPath(): string {
    return this.path;
  }

  public setPath(path: string): void {
    this.path = path;
  }

  public isFile(): boolean {
    return 'file' === this.type;
  }
}