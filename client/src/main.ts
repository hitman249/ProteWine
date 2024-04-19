import './less/app.less';
import App from './App.svelte';
import Keyboard from './modules/keyboard';
import Popup from './modules/popup';
import Api from './modules/api';

export class Application {
  private readonly KEYBOARD: Keyboard = new Keyboard();
  private readonly POPUP: Popup = new Popup();
  private readonly API: Api = new Api();

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

window.$app = $app;

export {$app};

const app: App = new App({
  target: document.getElementById('app') as HTMLElement,
});

export default app;
