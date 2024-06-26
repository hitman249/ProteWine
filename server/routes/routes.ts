import PluginsRoutes from './modules/plugins';

export enum RoutesKernel {
  VERSION = 'kernel:version',
  RUN = 'kernel:run',
  INSTALL = 'kernel:install',
  WINETRICKS = 'kernel:winetricks',
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
  CREATE = 'games:create',
  DEBUG = 'games:debug',
  FIND_LINKS = 'games:find-links',
  KILL = 'games:kill',
  LIST = 'games:list',
  REMOVE = 'games:remove',
  RUN = 'games:run',
  INFO = 'games:info',
  RUNNING_GAME = 'games:running-game',
  SAVE = 'games:save',
  UPDATE_ARGUMENTS = 'games:update-arguments',
  UPDATE_TITLE = 'games:update-title',
  UPDATE_EXE = 'games:update-exe',
  UPDATE_IMAGE = 'games:update-image',
  UPDATE_CONFIG = 'games:update-config',
}

export enum RoutesIso {
  MOUNT = 'iso:mount',
  UNMOUNT = 'iso:unmount',
}

export enum RoutesAppFolders {
  GAMES = 'app-folders:games',
}

export enum RoutesGallery {
  PORTRAITS = 'gallery:find-portraits',
  ICONS = 'gallery:find-icons',
}

export enum RoutesSettings {
  LIST = 'settings:list',
  SAVE = 'settings:save',
}

export enum RoutesWineTricks {
  LIST = 'winetricks:list',
}

export enum RoutesRepositories {
  LIST = 'repositories:list',
  LIST_BY_NAME = 'repositories:list-by-name',
  INSTALL = 'repositories:install',
}

export enum RoutesPrefix {
  EXIST = 'prefix:exist',
  CREATE = 'prefix:create',
  REFRESH = 'prefix:refresh',
  PROCESSED = 'prefix:processed',
  PROGRESS = 'prefix:progress',
}

export enum RoutesPlugins {
  INSTALL = 'plugins:install',
  LIST = 'plugins:list',
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
    RoutesKernel.WINETRICKS,
    RoutesFileSystem.LS,
    RoutesFileSystem.STORAGES,
    RoutesFileSystem.COPY,
    RoutesFileSystem.MOVE,
    RoutesFileSystem.SYMLINK,
    RoutesFileSystem.BASENAME,
    RoutesFileSystem.DIRNAME,
    RoutesGames.CREATE,
    RoutesGames.DEBUG,
    RoutesGames.FIND_LINKS,
    RoutesGames.KILL,
    RoutesGames.LIST,
    RoutesGames.REMOVE,
    RoutesGames.RUN,
    RoutesGames.INFO,
    RoutesGames.RUNNING_GAME,
    RoutesGames.UPDATE_ARGUMENTS,
    RoutesGames.UPDATE_TITLE,
    RoutesGames.UPDATE_EXE,
    RoutesGames.UPDATE_IMAGE,
    RoutesGames.UPDATE_CONFIG,
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
    RoutesPlugins.INSTALL,
    RoutesPlugins.LIST,
    RoutesAppFolders.GAMES,
    RoutesGallery.PORTRAITS,
    RoutesGallery.ICONS,
    RoutesSettings.LIST,
    RoutesSettings.SAVE,
    RoutesWineTricks.LIST,
    RoutesRepositories.LIST,
    RoutesRepositories.LIST_BY_NAME,
    RoutesRepositories.INSTALL,
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