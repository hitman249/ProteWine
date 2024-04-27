import {ApiKernel, ApiKernelEvent} from './modules/kernel';
import {ApiFileSystem} from './modules/file-system';

export default {
  invoke: [
    ApiKernel.VERSION,
    ApiFileSystem.LS,
    ApiFileSystem.STORAGES,
  ] as string[],
  send: [
    ApiKernelEvent.LOG,
  ] as string[],
  receive: [
    ApiKernelEvent.LOG,
  ] as string[],
};