import type {ChildProcessWithoutNullStreams} from 'child_process';
import EventListener from './event-listener';
import Utils from './utils';

type ResolveType = (text: string) => void;
type RejectType = (err: Error) => void;

export enum WatchProcessEvent {
  STDOUT = 'stdout',
  STDERR = 'stderr',
  LOG = 'log',
}

export default class WatchProcess extends EventListener {
  private finish: boolean = false;
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
      this.resolve = (text: string): void => {
        this.finish = true;
        resolve(text);
      };

      this.reject = (err: Error): void => {
        this.finish = true;
        reject(err);
      };
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
    const line: string[] = Utils.normalize(data).split('\n');
    this.outChunks.push(...line);

    for (const chunk of line) {
      this.fireEvent(WatchProcessEvent.STDOUT, chunk);
      this.fireEvent(WatchProcessEvent.LOG, chunk);
    }
  }

  private onStderr(data: Buffer): void {
    const line: string[] = Utils.normalize(data).split('\n');
    this.errorChunks.push(...line);

    for (const chunk of line) {
      this.fireEvent(WatchProcessEvent.STDERR, chunk);
      this.fireEvent(WatchProcessEvent.LOG, chunk);
    }
  }

  public kill(): void {
    this.finish = true;
    this.watch.kill('SIGKILL');
  }

  public async wait(): Promise<void> {
    return this.promise.then(() => undefined, () => undefined);
  }

  public async text(): Promise<string> {
    return this.promise.then(() => this.outChunks.join('\n'));
  }

  public async error(): Promise<string> {
    return this.promise.then(() => this.errorChunks.join('\n'));
  }

  public isFinish(): boolean {
    return this.finish;
  }
}