export interface Queue<T> {
    enqueue(item: T): Promise<void>;
    dequeue(): Promise<T | undefined>;
  }