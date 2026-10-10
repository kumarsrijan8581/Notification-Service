import { NotificationProvider } from "../interfaces/NotificationProvider";

export class EmailProvider implements NotificationProvider {
  async send(
    recipient: string,
    message: string
  ): Promise<void> {
    console.log(`Sending EMAIL to ${recipient}`);
    console.log(`Message: ${message}`);
  }
}