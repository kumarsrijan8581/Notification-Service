import { Queue } from "../interfaces/Queue";
import { NotificationJob } from "../models/NotificationJob";
import { DeadLetterQueue } from "../queue/DeadLetterQueue";
import { JobStatusTracker } from "./JobStatusTracker";

export class DeadLetterService {
  constructor(
    private deadLetterQueue: DeadLetterQueue,
    private queue: Queue<NotificationJob>,
    private tracker: JobStatusTracker
  ) {}

  listFailedJobs(): NotificationJob[] {
    return this.deadLetterQueue.getAll();
  }

  async retryJob(jobId: string): Promise<boolean> {
    const job = this.deadLetterQueue.getById(jobId);

    if (!job) {
      console.log(`Job ${jobId} was not found in the DLQ`);
      return false;
    }

    // Remove it from the DLQ before scheduling another attempt.
    this.deadLetterQueue.removeById(jobId);

    // Start a fresh retry cycle.
    job.attempts = 0;
    job.lastError = undefined;
    job.status = "PENDING";

    this.tracker.updateStatus(job.id, "PENDING");

    await this.queue.enqueue(job);

    console.log(`Job ${job.id} has been queued for manual retry`);

    return true;
  }
}