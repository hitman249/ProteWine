export enum RoutesKernel {
  VERSION = 'kernel:version',
  RUN = 'kernel:run',
  INSTALL = 'kernel:install',
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

export enum RoutesTaskEvent {
  LOG = 'task:log',
  RUN = 'task:run',
  PROGRESS = 'task:progress',
  EXIT = 'task:exit',
  KILL = 'task:kill',
  TYPE = 'task:type',
  FINISH = 'task:finish',
}

export default {
  invoke: [
    RoutesKernel.RUN,
    RoutesKernel.INSTALL,
    RoutesKernel.VERSION,
    RoutesFileSystem.LS,
    RoutesFileSystem.STORAGES,
    RoutesGames.LIST,
    RoutesTaskEvent.KILL,
    RoutesTaskEvent.TYPE,
    RoutesTaskEvent.FINISH,
  ] as string[],
  send: [

  ] as string[],
  receive: [
    RoutesTaskEvent.RUN,
    RoutesTaskEvent.LOG,
    RoutesTaskEvent.PROGRESS,
    RoutesTaskEvent.EXIT,
  ] as string[],
};