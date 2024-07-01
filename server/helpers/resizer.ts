import {NativeImage, ResizeOptions, Size, nativeImage} from 'electron';
import FileSystem from '../modules/file-system';

export default class Resizer {
  private readonly fs: FileSystem;
  private readonly src: string;
  private readonly dest: string;

  constructor(fs: FileSystem, src: string, dest: string) {
    this.fs = fs;
    this.src = src;
    this.dest = dest;
  }

  public static create(fs: FileSystem, src: string, dest: string): Resizer {
    return new Resizer(fs, src, dest);
  }

  public async resize(w?: number, h?: number): Promise<any> {
    const image: NativeImage = nativeImage.createFromPath(this.src);
    const size: Size = image.getSize();

    const options: ResizeOptions = {};

    if (w) {
      if (h) {
        options.width = w;
      } else {
        if (size.height > size.width) {
          options.height = w;
        } else {
          options.width = w;
        }
      }
    }

    if (h) {
      options.height = h;
    }


    if (size.width <= (w || h) && size.height <= (h || w)) {
      return await this.fs.filePutContents(this.dest, image.toPNG());
    }

    await this.fs.filePutContents(this.dest, image.resize(options).toPNG());
  }

  public async toJPEG(): Promise<void> {
    const image: NativeImage = nativeImage.createFromPath(this.src);
    return await this.fs.filePutContents(this.dest, image.toJPEG(80));
  }
}