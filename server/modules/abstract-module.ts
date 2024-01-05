import EventListener from '../helpers/event-listener';

export abstract class AbstractModule extends EventListener {
  public abstract init(): Promise<any>;
}