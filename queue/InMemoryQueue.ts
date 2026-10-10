import { Queue } from "../interfaces/Queue";

export class InMemoryQueue<T> implements Queue<T> {
  private readonly items: T[] = [];

  async enqueue(item: T): Promise<void> {
    this.items.push(item);
  }

  async dequeue(): Promise<T | undefined> {
    return this.items.shift();
  }
}