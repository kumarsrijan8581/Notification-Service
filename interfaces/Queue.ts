export interface Queue<T> {
  enqueue(item: T): Promise<void>;
  dequeue(signal?: AbortSignal): Promise<T | undefined>;
}
