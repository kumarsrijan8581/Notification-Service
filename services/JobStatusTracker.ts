import { NotificationStatus } from "../models/NotificationJob";

export class JobStatusTracker {
  private statuses = new Map<string, NotificationStatus>();

  register(jobId: string, status: NotificationStatus): void {
    this.statuses.set(jobId, status);
    console.log(`[Job ${jobId}] Status: ${status}`);
  }

  updateStatus(
    jobId: string,
    status: NotificationStatus
  ): void {
    this.statuses.set(jobId, status);
    console.log(`[Job ${jobId}] Status: ${status}`);
  }

  getStatus(jobId: string): NotificationStatus | undefined {
    return this.statuses.get(jobId);
  }

  getAll(): Array<{ jobId: string; status: NotificationStatus }> {
    return Array.from(this.statuses, ([jobId, status]) => ({
      jobId,
      status,
    }));
  }
}