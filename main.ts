import { InMemoryQueue } from "./queue/InMemoryQueue";
import { DeadLetterQueue } from "./queue/DeadLetterQueue";
import { NotificationJob } from "./models/NotificationJob";
import { NotificationService } from "./services/NotificationService";
import { JobStatusTracker } from "./services/JobStatusTracker";
import { DeadLetterService } from "./services/DeadLetterService";
import { NotificationProviderFactory } from "./factory/NotificationProviderFactory";
import { NotificationWorker } from "./workers/NotificationWorker";

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const queue = new InMemoryQueue<NotificationJob>();
  const deadLetterQueue = new DeadLetterQueue();
  const tracker = new JobStatusTracker();

  const notificationService = new NotificationService(queue, tracker);
  const deadLetterService = new DeadLetterService(
    deadLetterQueue,
    queue,
    tracker
  );

  // Simulate four failed email attempts.
  const factory = new NotificationProviderFactory(4);

  const worker = new NotificationWorker(
    queue,
    factory,
    tracker,
    deadLetterQueue
  );

  const workerPromise = worker.start();

  const emailJobId = await notificationService.notify(
    "EMAIL",
    "mate@example.com",
    "Welcome to our platform!"
  );

  await sleep(5000);

  console.log("\n--- Before manual retry ---");
  console.log("Status:", tracker.getStatus(emailJobId));
  console.log("DLQ jobs:", deadLetterService.listFailedJobs());

  const scheduled = await deadLetterService.retryJob(emailJobId);

  if (scheduled) {
    // Give the worker time to process the requeued job.
    await sleep(1000);
  }

  console.log("\n--- After manual retry ---");
  console.log("Status:", tracker.getStatus(emailJobId));
  console.log("DLQ jobs:", deadLetterService.listFailedJobs());

  worker.stop();
  await workerPromise;
}

main().catch(console.error);