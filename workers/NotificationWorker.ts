import { Queue } from "../interfaces/Queue";
import { NotificationJob } from "../models/NotificationJob";
import { NotificationProviderFactory } from "../factory/NotificationProviderFactory";

export class NotificationWorker {
  constructor(
    private readonly queue: Queue<NotificationJob>,
    private readonly factory: NotificationProviderFactory
  ) {}

  async processNext(): Promise<boolean> {
    const job = await this.queue.dequeue();

    if (!job) {
      return false;
    }

    try {
      const provider =
        this.factory.getProvider(job.type);

      await provider.send(
        job.recipient,
        job.message
      );

      console.log(`Job ${job.id} completed`);
    } catch (error) {
      job.attempts++;

      if (job.attempts <= job.maxRetries) {
        console.log(
          `Retrying job ${job.id}, attempt ${job.attempts}`
        );

        await this.queue.enqueue(job);
      } else {
        console.log(
          `Job ${job.id} failed permanently`
        );
      }
    }

    return true;
  }
}