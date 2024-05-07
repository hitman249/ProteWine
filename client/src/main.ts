import './less/app.less';
import App from './App.svelte';
import Keyboard from './modules/keyboard';
import Popup from './modules/popup';
import Api from './modules/api';
import {AbstractModule} from '../../server/modules/abstract-module';

export class Application extends AbstractModule {
  public instance: App;

  private readonly KEYBOARD: Keyboard = new Keyboard();
  private readonly POPUP: Popup = new Popup();
  private readonly API: Api = new Api();

  private readonly modules: AbstractModule[] = [
    this.KEYBOARD,
    this.POPUP,
    this.API,
  ];

  public async init(): Promise<any> {
    for await (const module of this.modules) {
      await module.init();
    }
  }

  public getKeyboard(): Keyboard {
    return this.KEYBOARD;
  }
  public getPopup(): Popup {
    return this.POPUP;
  }

  public getApi(): Api {
    return this.API;
  }
}

declare global {
  interface Window {
    $app: Application;
  }
}

const $app: Application = window.$app || new Application();

// @ts-ignore
window.$app = $app;

export {$app};

$app.init().then(() => {
  $app.instance = new App({
    target: document.getElementById('app') as HTMLElement,
  });
});
