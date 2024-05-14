export enum RoutesKernel {
  VERSION = 'kernel:version',
  RUN = 'kernel:run',
  INSTALL = 'kernel:install',
  CREATE_PREFIX = 'kernel:create-prefix',
  LAUNCHER = 'kernel:launcher',
}

export enum RoutesFileSystem {
  LS = 'fs:ls',
  STORAGES = 'fs:storages',
}

export enum RoutesGames {
  LIST = 'games:list',
  CREATE = 'games:create',
  REMOVE = 'games:remove',
  SAVE = 'games:save',
}

export enum RoutesIso {
  MOUNT = 'iso:mount',
  UNMOUNT = 'iso:unmount',
}

export enum RoutesTaskEvent {
  RUN = 'task:run',
  LOG = 'task:log',
  ERROR = 'task:error',
  PROGRESS = 'task:progress',
  BUS = 'task:bus',
  EXIT = 'task:exit',
}

export enum RoutesTaskMethod {
  KILL = 'task:kill',
  TYPE = 'task:type',
  FINISH = 'task:finish',
}

export default {
  invoke: [
    RoutesKernel.RUN,
    RoutesKernel.LAUNCHER,
    RoutesKernel.INSTALL,
    RoutesKernel.CREATE_PREFIX,
    RoutesKernel.VERSION,
    RoutesFileSystem.LS,
    RoutesFileSystem.STORAGES,
    RoutesGames.LIST,
    RoutesTaskMethod.KILL,
    RoutesTaskMethod.TYPE,
    RoutesTaskMethod.FINISH,
    RoutesIso.MOUNT,
    RoutesIso.UNMOUNT,
  ] as string[],
  send: [] as string[],
  receive: [
    RoutesTaskEvent.RUN,
    RoutesTaskEvent.LOG,
    RoutesTaskEvent.ERROR,
    RoutesTaskEvent.BUS,
    RoutesTaskEvent.PROGRESS,
    RoutesTaskEvent.EXIT,
  ] as string[],
};