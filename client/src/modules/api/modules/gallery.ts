import {AbstractModule} from '../../../../../server/modules/abstract-module';
import {RoutesGallery} from '../../../../../server/routes/routes';
import type {ImageType} from '../../../../../server/modules/gallery';
import Image from '../../../models/image';

export default class Gallery extends AbstractModule {
  public async init(): Promise<void> {
  }

  public async findPortraits(name: string): Promise<ImageType[]> {
    return (await window.electronAPI.invoke(RoutesGallery.PORTRAITS, name)).map((image: ImageType) => new Image(image));
  }

  public async findIcons(name: string): Promise<ImageType[]> {
    return (await window.electronAPI.invoke(RoutesGallery.ICONS, name)).map((image: ImageType) => new Image(image));
  }
}