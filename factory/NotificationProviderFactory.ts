import { NotificationProvider } from "../interfaces/NotificationProvider";
import { EmailProvider } from "../providers/EmailProvider";
import { SMSProvider } from "../providers/SMSProvider";
import { NotificationType } from "../models/NotificationJob";

export class NotificationProviderFactory {
  private readonly providers: Record<
    NotificationType,
    NotificationProvider
  >;

  constructor(emailFailuresToSimulate = 0) {
    this.providers = {
      EMAIL: new EmailProvider(emailFailuresToSimulate),
      SMS: new SMSProvider(),
    };
  }

  getProvider(
    type: NotificationType
  ): NotificationProvider {
    return this.providers[type];
  }
}
