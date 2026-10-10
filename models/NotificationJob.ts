export type NotificationType = "EMAIL" | "SMS";

export interface NotificationJob {
  id: string;
  type: NotificationType;
  recipient: string;
  message: string;
  attempts: number;
  maxRetries: number;
}