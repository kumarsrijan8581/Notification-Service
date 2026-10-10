export type NotificationType = "EMAIL" | "SMS";

export type NotificationStatus =
  | "PENDING"
  | "PROCESSING"
  | "RETRYING"
  | "COMPLETED"
  | "FAILED"
  | "DEAD_LETTER";

export interface NotificationJob {
  id: string;
  type: NotificationType;
  recipient: string;
  message: string;
  attempts: number;
  maxRetries: number;
  status: NotificationStatus;
  lastError?: string;
}