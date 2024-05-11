export enum TaskType {
  ARCHIVER = 'archiver',
  KERNEL = 'kernel',
  WATCH_PROCESS = 'watch-process',
  CALLBACK = 'callback',
}

export type BodyBus = {
  module: string,
  event: string,
  value: any,
}