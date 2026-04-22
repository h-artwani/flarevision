import "dotenv/config";
import { NativeConnection, Worker } from "@temporalio/worker";
import * as activities from "./activities";

const TASK_QUEUE = "flarevision-incidents";

async function main() {
  const isCloud = !!process.env.TEMPORAL_API_KEY;

  const connection = await NativeConnection.connect(
    isCloud
      ? {
          address: process.env.TEMPORAL_ADDRESS!,
          tls: true,
          metadata: { "temporal-namespace": process.env.TEMPORAL_NAMESPACE! },
          apiKey: process.env.TEMPORAL_API_KEY!,
        }
      : { address: "localhost:7233" }
  );

  const worker = await Worker.create({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE ?? "default",
    taskQueue: TASK_QUEUE,
    workflowsPath: require.resolve("./workflows"),
    activities,
  });

  console.log(`Worker started on task queue: ${TASK_QUEUE}`);
  await worker.run();
}

main().catch((err) => {
  console.error("Worker failed:", err);
  process.exit(1);
});
