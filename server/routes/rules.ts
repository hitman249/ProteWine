export enum ApiKernel {
  VERSION = 'kernel:version',
}

export enum ApiFileSystem {
  LS = 'fs:ls',
  STORAGES = 'fs:storages',
}

export default {
  invoke: [
    ApiKernel.VERSION,
    ApiFileSystem.LS,
    ApiFileSystem.STORAGES,
  ] as string[],
  send: [

  ] as string[],
  receive: [

  ] as string[],
};