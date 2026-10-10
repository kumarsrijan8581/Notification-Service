import { NotificationJob } from "../models/NotificationJob";

export class DeadLetterQueue {
  private jobs: NotificationJob[] = [];

  add(job: NotificationJob): void {
    this.jobs.push(job);

    console.log(
      `Job ${job.id} moved to Dead-Letter Queue`
    );
  }

  getAll(): NotificationJob[] {
    return [...this.jobs];
  }

  getById(jobId: string): NotificationJob | undefined {
    return this.jobs.find((job) => job.id === jobId);
  }
}