export enum RoutesKernel {
  VERSION = 'kernel:version',
  RUN = 'kernel:run',
}

export enum RoutesFileSystem {
  LS = 'fs:ls',
  STORAGES = 'fs:storages',
}

export enum RoutesTaskEvent {
  LOG = 'task:log',
  RUN = 'task:run',
  PROGRESS = 'task:progress',
  EXIT = 'task:exit',
}

export default {
  invoke: [
    RoutesKernel.RUN,
    RoutesKernel.VERSION,
    RoutesFileSystem.LS,
    RoutesFileSystem.STORAGES,
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