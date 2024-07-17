export enum TaskType {
  ARCHIVER = 'archiver',
  KERNEL = 'kernel',
  WATCH_PROCESS = 'watch-process',
  CALLBACK = 'callback',
  FILE_SYSTEM = 'fs',
  REPOSITORIES = 'repositories',
  PLUGINS = 'plugins',
  UPDATES = 'updates',
  LAYERS = 'layers',
}

export type BodyBus = {
  module: string,
  event: string,
  value: any,
  date?: string,
}