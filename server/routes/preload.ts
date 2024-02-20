import {contextBridge, ipcRenderer} from 'electron';
import rules from './rules';

contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel: string, ...args: any[]) => {
    if (rules.send.includes(channel)) {
      ipcRenderer.send(channel, args);
    }
  },
  receive: (channel: string, listener: (...args: any[]) => void) => {
    if (rules.receive.includes(channel)) {
      ipcRenderer.on(channel, (event: Electron.IpcRendererEvent, ...args: any[]) => listener(...args));
    }
  },
  invoke: (channel: string, ...args: any[]): Promise<any> => {
    if (rules.invoke.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
  },
});
