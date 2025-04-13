import { EventEmitter as EventEmitterBase } from "events";

export class EventEmitter<T extends { [K in keyof T]: (...args: any[]) => void }> {
  private emitter: EventEmitterBase;

  constructor() {
    this.emitter = new EventEmitterBase();
  }

  on<K extends keyof T>(event: K, listener: T[K]): this {
    this.emitter.on(event as string, listener);
    return this;
  }

  off<K extends keyof T>(event: K, listener: T[K]): this {
    this.emitter.off(event as string, listener);
    return this;
  }

  once<K extends keyof T>(event: K, listener: T[K]): this {
    this.emitter.once(event as string, listener);
    return this;
  }

  emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): boolean {
    return this.emitter.emit(event as string, ...args);
  }

  removeListener<K extends keyof T>(event: K, listener: T[K]): this {
    this.emitter.removeListener(event as string, listener);
    return this;
  }

  removeAllListeners<K extends keyof T>(event?: K): this {
    this.emitter.removeAllListeners(event as string);
    return this;
  }

  listenerCount<K extends keyof T>(event: K): number {
    return this.emitter.listenerCount(event as string);
  }

  listeners<K extends keyof T>(event: K): Function[] {
    return this.emitter.listeners(event as string);
  }
}
