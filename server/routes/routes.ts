export enum RoutesKernel {
  VERSION = 'kernel:version',
  RUN = 'kernel:run',
  INSTALL = 'kernel:install',
  WINETRICKS = 'kernel:winetricks',
  CREATE_PREFIX = 'kernel:create-prefix',
  LAUNCHER = 'kernel:launcher',
  CONFIG = 'kernel:config',
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
  CREATE_ICON = 'games:create-icon',
  REMOVE_ICON = 'games:remove-icon',
  CREATE_STEAM_ICON = 'games:create-steam-icon',
  REMOVE_STEAM_ICON = 'games:remove-steam-icon',
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

export enum RoutesNativeKeyboard {
  OPEN = 'native-keyboard:open',
  CLOSE = 'native-keyboard:close',
}

export enum RoutesUpdate {
  APP_VERSION = 'update:app-version',
  LIST = 'update:list',
  UPDATE = 'update:update',
}

export enum RoutesLayers {
  BEFORE = 'layers:before',
  AFTER = 'layers:after',
  LIST = 'layers:list',
  IS_PROCESSED = 'layers:is-processed',
  CHANGE_TITLE = 'layers:change-title',
  CHANGE_ACTIVE = 'layers:change-active',
  REMOVE = 'layers:remove',
  CANCEL = 'layers:cancel',
  EXIST = 'layers:exist',

  DB_LIST = 'layers:db-list',
  DB_EXIST = 'layers:db-exist',
  DB_ADD = 'layers:db-add',
  DB_REMOVE = 'layers:db-remove',
  LAYER_ADD = 'layers:layer-add',
  LAYER_REMOVE = 'layers:layer-remove',
}

export enum RoutesSettings {
  LIST = 'settings:list',
  SAVE = 'settings:save',
}

export enum RoutesSystem {
  APP_EXIT = 'system:app-exit',
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
    RoutesKernel.CONFIG,
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
    RoutesGames.CREATE_ICON,
    RoutesGames.REMOVE_ICON,
    RoutesGames.CREATE_STEAM_ICON,
    RoutesGames.REMOVE_STEAM_ICON,
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
    RoutesSystem.APP_EXIT,
    RoutesWineTricks.LIST,
    RoutesRepositories.LIST,
    RoutesRepositories.LIST_BY_NAME,
    RoutesRepositories.INSTALL,
    RoutesUpdate.APP_VERSION,
    RoutesUpdate.LIST,
    RoutesUpdate.UPDATE,
    RoutesNativeKeyboard.OPEN,
    RoutesNativeKeyboard.CLOSE,
    RoutesLayers.BEFORE,
    RoutesLayers.EXIST,
    RoutesLayers.AFTER,
    RoutesLayers.LIST,
    RoutesLayers.IS_PROCESSED,
    RoutesLayers.CHANGE_TITLE,
    RoutesLayers.CHANGE_ACTIVE,
    RoutesLayers.REMOVE,
    RoutesLayers.CANCEL,
    RoutesLayers.DB_LIST,
    RoutesLayers.DB_ADD,
    RoutesLayers.DB_REMOVE,
    RoutesLayers.DB_EXIST,
    RoutesLayers.LAYER_ADD,
    RoutesLayers.LAYER_REMOVE,
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