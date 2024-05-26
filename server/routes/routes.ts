import AppFoldersRoutes from './modules/app-folders';

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
  COPY = 'fs:copy',
  MOVE = 'fs:move',
  SYMLINK = 'fs:symlink',
  BASENAME = 'fs:basename',
  DIRNAME = 'fs:dirname',
}

export enum RoutesGames {
  LIST = 'games:list',
  FIND_LINKS = 'games:find-links',
  CREATE = 'games:create',
  REMOVE = 'games:remove',
  SAVE = 'games:save',
}

export enum RoutesIso {
  MOUNT = 'iso:mount',
  UNMOUNT = 'iso:unmount',
}

export enum RoutesAppFolders {
  GAMES = 'app-folders:games',
}

export enum RoutesPrefix {
  EXIST = 'prefix:exist',
  CREATE = 'prefix:create',
  REFRESH = 'prefix:refresh',
  PROCESSED = 'prefix:processed',
  PROGRESS = 'prefix:progress',
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
    RoutesFileSystem.COPY,
    RoutesFileSystem.MOVE,
    RoutesFileSystem.SYMLINK,
    RoutesFileSystem.BASENAME,
    RoutesFileSystem.DIRNAME,
    RoutesGames.LIST,
    RoutesGames.FIND_LINKS,
    RoutesGames.CREATE,
    RoutesTaskMethod.KILL,
    RoutesTaskMethod.TYPE,
    RoutesTaskMethod.FINISH,
    RoutesIso.MOUNT,
    RoutesIso.UNMOUNT,
    RoutesPrefix.EXIST,
    RoutesPrefix.CREATE,
    RoutesPrefix.REFRESH,
    RoutesPrefix.PROCESSED,
    RoutesPrefix.PROGRESS,
    RoutesAppFolders.GAMES,
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