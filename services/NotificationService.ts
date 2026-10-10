import { Queue } from "../interfaces/Queue";
import { NotificationJob, NotificationType } from "../models/NotificationJob";

export class NotificationService {
  constructor(
    private readonly queue: Queue<NotificationJob>
  ) {}

  async notify(
    type: NotificationType,
    recipient: string,
    message: string
  ): Promise<void> {
    const job: NotificationJob = {
      id: crypto.randomUUID(),
      type,
      recipient,
      message,
      attempts: 0,
      maxRetries: 3,
    };

    await this.queue.enqueue(job);

    console.log(`Job ${job.id} added to queue`);
  }
}