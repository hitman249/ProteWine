import type {ImageType} from '../../../server/modules/gallery';

export default class Image {
  public readonly thumb: string;
  public readonly url: string;
  public readonly type: ImageType['type'];

  constructor(params: ImageType) {
    this.thumb = params.thumb;
    this.url = params.url;
    this.type = params.type || 'url';
  }

  public isFile(): boolean {
    return 'file' === this.type;
  }

  public toObject(): ImageType {
    return {
      type: this.type,
      thumb: this.thumb,
      url: this.url,
    };
  }
}