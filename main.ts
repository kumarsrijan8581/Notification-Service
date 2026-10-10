import { InMemoryQueue } from "./queue/InMemoryQueue";
import { DeadLetterQueue } from "./queue/DeadLetterQueue";
import { NotificationJob } from "./models/NotificationJob";
import { NotificationService } from "./services/NotificationService";
import { JobStatusTracker } from "./services/JobStatusTracker";
import { NotificationProviderFactory } from "./factory/NotificationProviderFactory";
import { NotificationWorker } from "./workers/NotificationWorker";

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const queue = new InMemoryQueue<NotificationJob>();
  const deadLetterQueue = new DeadLetterQueue();
  const tracker = new JobStatusTracker();

  const service = new NotificationService(queue, tracker);

  // Five simulated failures; the job allows only four attempts.
  const factory = new NotificationProviderFactory(5);

  const worker = new NotificationWorker(
    queue,
    factory,
    tracker,
    deadLetterQueue
  );

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

  // Demo convenience, not a production completion mechanism.
  await sleep(5000);

  console.log("\nFinal statuses:");
  console.log(emailJobId, tracker.getStatus(emailJobId));
  console.log(smsJobId, tracker.getStatus(smsJobId));

  console.log("\nDead-Letter Queue contents:");
  console.dir(deadLetterQueue.getAll(), { depth: null });

  worker.stop();
  await workerPromise;
}

main().catch(console.error);