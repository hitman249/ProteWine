import type {ChildProcessWithoutNullStreams} from 'child_process';
import EventListener from './event-listener';
import Utils from './utils';

type ResolveType = (text: string) => void;
type RejectType = (err: Error) => void;

export enum WatchProcessEvent {
  STDOUT = 'stdout',
  STDERR = 'stderr',
}

export default class WatchProcess extends EventListener {
  private readonly promise: Promise<string>;
  private resolve: ResolveType;
  private reject: RejectType;

  private pid: number;
  private gid: number;

  private readonly watch: ChildProcessWithoutNullStreams;

  private outChunks: string[] = [];
  private errorChunks: string[] = [];

  constructor(watch: ChildProcessWithoutNullStreams) {
    super();

    this.onStdout = this.onStdout.bind(this);
    this.onStderr = this.onStderr.bind(this);

    this.pid = watch.pid;
    this.gid = -watch.pid;

    this.promise = new Promise((resolve: ResolveType, reject: RejectType): void => {
      this.resolve = resolve;
      this.reject = reject;
    });

    this.watch = watch;

    watch.stdout.on('data', this.onStdout);
    watch.stderr.on('data', this.onStderr);

    watch.on('close', this.resolve);
    watch.on('exit', this.resolve);
    watch.on('error', this.reject);
  }

  public getPID(): number {
    return this.pid;
  }

  public getGID(): number {
    return this.gid;
  }

  private onStdout(data: Buffer): void {
    const line: string =  Utils.normalize(data);
    this.outChunks.push(line);
    this.fireEvent(WatchProcessEvent.STDOUT, line);
  }

  private onStderr(data: Buffer): void {
    const line: string =  Utils.normalize(data);
    this.errorChunks.push(line);
    this.fireEvent(WatchProcessEvent.STDERR, line);
  }

  public kill(): void {
    this.watch.kill('SIGKILL');
  }

  public async wait(): Promise<void> {
    return this.promise.then(() => undefined);
  }

  public async text(): Promise<string> {
    return this.promise.then(() => this.outChunks.join('\n'));
  }

  public async error(): Promise<string> {
    return this.promise.then(() => this.errorChunks.join('\n'));
  }
}