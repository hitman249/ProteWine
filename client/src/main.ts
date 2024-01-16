import './less/app.less';
import App from './App.svelte';
import Keyboard from './modules/keyboard';

export class Application {
  private readonly KEYBOARD: Keyboard = new Keyboard();

  public getKeyboard(): Keyboard {
    return this.KEYBOARD;
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
