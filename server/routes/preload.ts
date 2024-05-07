import {contextBridge, ipcRenderer} from 'electron';
import routes from './routes';

contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel: string, ...args: any[]) => {
    if (routes.send.includes(channel)) {
      ipcRenderer.send(channel, args);
    }
  },
  receive: (channel: string, listener: (...args: any[]) => void) => {
    if (routes.receive.includes(channel)) {
      ipcRenderer.on(channel, (event: Electron.IpcRendererEvent, ...args: any[]) => listener(channel, ...args));
    }
  },
  invoke: (channel: string, ...args: any[]): Promise<any> => {
    if (routes.invoke.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
  },
});
