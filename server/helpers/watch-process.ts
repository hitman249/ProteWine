import type {ChildProcessWithoutNullStreams} from 'child_process';
import EventListener from './event-listener';

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

  private readonly watch: ChildProcessWithoutNullStreams;

  private outChunks: string[] = [];
  private errorChunks: string[] = [];

  constructor(watch: ChildProcessWithoutNullStreams) {
    super();

    this.onStdout = this.onStdout.bind(this);
    this.onStderr = this.onStderr.bind(this);

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

  private onStdout(data: Buffer): void {
    this.outChunks.push(data.toString());
    this.fireEvent(WatchProcessEvent.STDOUT, data.toString());
  }

  private onStderr(data: Buffer): void {
    this.errorChunks.push(data.toString());
    this.fireEvent(WatchProcessEvent.STDERR, data.toString());
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