import { NotificationProvider } from "../interfaces/NotificationProvider";

export class SMSProvider implements NotificationProvider {
  async send(
    recipient: string,
    message: string
  ): Promise<void> {
    console.log(`Sending SMS to ${recipient}`);
    console.log(`Message: ${message}`);
  }
}