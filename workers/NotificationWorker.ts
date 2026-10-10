
import { Queue } from "../interfaces/Queue";
import { NotificationJob } from "../models/NotificationJob";
import { NotificationProviderFactory } from "../factory/NotificationProviderFactory";
import { JobStatusTracker } from "../services/JobStatusTracker";

export class NotificationWorker {
  private readonly abortController = new AbortController();
  private running = false;

  constructor(
    private queue: Queue<NotificationJob>,
    private factory: NotificationProviderFactory,
    private tracker: JobStatusTracker
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

  private async processJob(job: NotificationJob): Promise<void> {
    this.tracker.updateStatus(job.id, "PROCESSING");
  
    try {
      const provider = this.factory.getProvider(job.type);
  
      await provider.send(job.recipient, job.message);
  
      this.tracker.updateStatus(job.id, "COMPLETED");
  
      console.log(`Notification sent successfully: ${job.id}`);
    } catch (error) {
      job.attempts++;
  
      job.lastError =
        error instanceof Error ? error.message : String(error);
  
      console.error(
        `Job ${job.id} failed on attempt ${job.attempts}:`,
        job.lastError
      );
  
      if (job.attempts <= job.maxRetries) {
        this.tracker.updateStatus(job.id, "RETRYING");
  
        const delayMs = 500 * 2 ** (job.attempts - 1);
  
        setTimeout(() => {
          void this.queue.enqueue(job);
        }, delayMs);
      } else {
        this.tracker.updateStatus(job.id, "FAILED");
  
        console.error(`Job permanently failed: ${job.id}`);
      }
    }
  }
}
