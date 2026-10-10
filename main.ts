
import { InMemoryQueue } from "./queue/InMemoryQueue";
import { NotificationJob } from "./models/NotificationJob";
import { NotificationService } from "./services/NotificationService";
import { NotificationProviderFactory } from "./factory/NotificationProviderFactory";
import { NotificationWorker } from "./workers/NotificationWorker";

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

async function main() {
  const queue = new InMemoryQueue<NotificationJob>();

  const notificationService =
    new NotificationService(queue);

  // Simulate the first two email attempts failing.
  const factory = new NotificationProviderFactory(2);

  const worker = new NotificationWorker(queue, factory);

  // Start consuming before adding jobs.
  const workerPromise = worker.start();

  await notificationService.notify(
    "EMAIL",
    "user@example.com",
    "Your order has been confirmed!"
  );

  await notificationService.notify(
    "SMS",
    "+911234567890",
    "Your order has been confirmed!"
  );

  // Demo only: allow the initial attempts and retries to finish.
  await sleep(3000);

  worker.stop();
  await workerPromise;

  console.log("Demo finished");
}

main().catch(console.error);