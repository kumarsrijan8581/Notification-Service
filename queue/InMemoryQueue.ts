import { Queue } from "../interfaces/Queue";

type Waiter<T> = {
  resolve: (item: T | undefined) => void;
  signal?: AbortSignal;
  onAbort?: () => void;
};

export class InMemoryQueue<T> implements Queue<T> {
  private readonly items: T[] = [];
  private readonly waiters: Waiter<T>[] = [];

  async enqueue(item: T): Promise<void> {
    while (this.waiters.length > 0) {
      const waiter = this.waiters.shift()!;

      if (waiter.signal?.aborted) {
        continue;
      }

      if (waiter.signal && waiter.onAbort) {
        waiter.signal.removeEventListener(
          "abort",
          waiter.onAbort
        );
      }

      waiter.resolve(item);
      return;
    }

    this.items.push(item);
  }

  async dequeue(
    signal?: AbortSignal
  ): Promise<T | undefined> {
    if (signal?.aborted) {
      return undefined;
    }

    const item = this.items.shift();

    if (item !== undefined) {
      return item;
    }

    return new Promise<T | undefined>((resolve) => {
      const waiter: Waiter<T> = {
        resolve,
        signal,
      };

      if (signal) {
        waiter.onAbort = () => {
          const index = this.waiters.indexOf(waiter);

          if (index !== -1) {
            this.waiters.splice(index, 1);
          }

          resolve(undefined);
        };

        signal.addEventListener(
          "abort",
          waiter.onAbort,
          { once: true }
        );
      }

      this.waiters.push(waiter);
    });
  }
}