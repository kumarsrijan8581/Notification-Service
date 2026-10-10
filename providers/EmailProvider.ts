import { NotificationProvider } from "../interfaces/NotificationProvider";

export class EmailProvider implements NotificationProvider {
  constructor(
    private failuresRemaining = 0
  ) {}

  async send(
    recipient: string,
    message: string
  ): Promise<void> {
    console.log(`Attempting EMAIL to ${recipient}`);

    if (this.failuresRemaining > 0) {
      this.failuresRemaining--;

      throw new Error("Simulated email provider failure");
    }

    console.log(`EMAIL sent to ${recipient}`);
    console.log(`Message: ${message}`);
  }
}
