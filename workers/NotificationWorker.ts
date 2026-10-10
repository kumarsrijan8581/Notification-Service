
import { Queue } from "../interfaces/Queue";
import { NotificationJob } from "../models/NotificationJob";
import { NotificationProviderFactory } from "../factory/NotificationProviderFactory";

export class NotificationWorker {
  private readonly abortController = new AbortController();
  private running = false;

  constructor(
    private readonly queue: Queue<NotificationJob>,
    private readonly factory: NotificationProviderFactory
  ) {}

  async start(): Promise<void> {
    if (this.running) {
      return;
    }

    this.running = true;
    console.log("Worker started");

    try {
      while (this.running) {
        const job = await this.queue.dequeue(
          this.abortController.signal
        );

        if (!job || !this.running) {
          break;
        }

        await this.processJob(job);
      }
    } finally {
      this.running = false;
      console.log("Worker stopped");
    }
  }

  stop(): void {
    this.running = false;
    this.abortController.abort();
  }

  private async processJob(
    job: NotificationJob
  ): Promise<void> {
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

      console.error(
        `Job ${job.id} failed on attempt ${job.attempts}:`,
        error
      );

      if (job.attempts <= job.maxRetries) {
        // Exponential backoff: 500ms, 1000ms, 2000ms...
        const delayMs =
          500 * 2 ** (job.attempts - 1);

        console.log(
          `Retrying job ${job.id} in ${delayMs}ms`
        );

        setTimeout(() => {
          void this.queue.enqueue(job);
        }, delayMs);
      } else {
        console.error(
          `Job ${job.id} exhausted its retries`
        );
      }
    }
  }
}
