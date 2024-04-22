export enum GameOperation {
  INSTALL_FILE = 'install-file',
  INSTALL_IMAGE = 'install-image',
  COPY_GAME = 'copy-game',
  MOVE_GAME = 'move-game',
  SYMLINK_GAME = 'symlink-game',
  IMPORT_LINK = 'IMPORT_LINK',
}

export default class NewGame {
  public operation: GameOperation;
  public path: string;
}