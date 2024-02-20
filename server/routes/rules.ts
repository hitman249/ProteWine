export enum ApiKernel {
  VERSION = 'kernel:version',
}

export default {
  invoke: [
    ApiKernel.VERSION,
  ] as string[],
  send: [

  ] as string[],
  receive: [

  ] as string[],
};