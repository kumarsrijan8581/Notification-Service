import { InMemoryQueue } from "./queue/InMemoryQueue";
import { NotificationJob } from "./models/NotificationJob";
import { NotificationService } from "./services/NotificationService";
import { NotificationProviderFactory } from "./factory/NotificationProviderFactory";
import { NotificationWorker } from "./workers/NotificationWorker";

async function main() {
  const queue = new InMemoryQueue<NotificationJob>();

  const notificationService =
    new NotificationService(queue);

  const factory =
    new NotificationProviderFactory();

  const worker =
    new NotificationWorker(queue, factory);

  // Producer: enqueue notifications
  await notificationService.notify(
    "EMAIL",
    "user@example.com",
    "Your order has been confirmed!"
  );

  await notificationService.notify(
    "SMS",
    "+911234567890",
    "Your OTP is 123456"
  );

  console.log("All jobs have been enqueued.");

  // Worker: process queued jobs
  while (await worker.processNext()) {
    // Continue until the queue is empty.
  }

  console.log("All queued jobs processed.");
}

main().catch(console.error);