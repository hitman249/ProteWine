import AppFolders from './modules/app-folders';
import Command from './modules/command';
import FileSystem from './modules/file-system';

class App {
  private readonly COMMAND: Command;
  private readonly APP_FOLDERS: AppFolders;
  private readonly FILE_SYSTEM: FileSystem;

  constructor() {
    this.COMMAND = new Command();
    this.APP_FOLDERS = new AppFolders();
    this.FILE_SYSTEM = new FileSystem(this.APP_FOLDERS);
  }

  public getCommand(): Command {
    return this.COMMAND;
  }

  public getAppFolders(): AppFolders {
    return this.APP_FOLDERS;
  }

  public getFileSystem(): FileSystem {
    return this.FILE_SYSTEM;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var $app: App;
}

global.$app = new App();

export default global.$app;