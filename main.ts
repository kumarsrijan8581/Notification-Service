import { InMemoryQueue } from "./queue/InMemoryQueue";
import { NotificationJob } from "./models/NotificationJob";
import { NotificationService } from "./services/NotificationService";
import { JobStatusTracker } from "./services/JobStatusTracker";
import { NotificationProviderFactory } from "./factory/NotificationProviderFactory";
import { NotificationWorker } from "./workers/NotificationWorker";

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const queue = new InMemoryQueue<NotificationJob>();
  const tracker = new JobStatusTracker();

  const service = new NotificationService(queue, tracker);

  // Simulate two initial email failures.
  const factory = new NotificationProviderFactory(2);

  const worker = new NotificationWorker(queue, factory, tracker);

  const workerPromise = worker.start();

  const emailJobId = await service.notify(
    "EMAIL",
    "mate@example.com",
    "Welcome to our platform!"
  );

  const smsJobId = await service.notify(
    "SMS",
    "9876543210",
    "Your OTP is 123456"
  );

  // Demo convenience: allow retries to finish.
  await sleep(3000);

  console.log("\nFinal job statuses:");
  console.log(emailJobId, tracker.getStatus(emailJobId));
  console.log(smsJobId, tracker.getStatus(smsJobId));

  console.log("\nAll tracked jobs:");
  console.log(tracker.getAll());

  worker.stop();
  await workerPromise;
}

main().catch(console.error);