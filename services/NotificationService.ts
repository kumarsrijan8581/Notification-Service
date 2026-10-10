import { Queue } from "../interfaces/Queue";
import { NotificationJob, NotificationType } from "../models/NotificationJob";
import { JobStatusTracker } from "./JobStatusTracker";

export class NotificationService {
  constructor(
    private queue: Queue<NotificationJob>,
    private tracker: JobStatusTracker
  ) {}

  async notify(
    type: NotificationType,
    recipient: string,
    message: string
  ): Promise<string> {
    const job: NotificationJob = {
      id: crypto.randomUUID(),
      type,
      recipient,
      message,
      attempts: 0,
      maxRetries: 3,
      status: "PENDING",
    };

    this.tracker.register(job.id, "PENDING");

    await this.queue.enqueue(job);

    console.log(`Notification job queued: ${job.id}`);

    return job.id;
  }
}