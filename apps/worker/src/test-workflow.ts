import { Connection, Client } from "@temporalio/client";
import { rcaWorkflow } from "./workflows";
import type { AlertPayload } from "@flarevision/shared-types";

async function main() {
  const connection = await Connection.connect({ address: "localhost:7233" });
  const client = new Client({ connection });

  const alert: AlertPayload = {
    incidentId: "INC-0001",
    service: "payment-service",
    errorRate: 340,
    baseline: 0,
    region: "us-east-1",
    triggeredAt: new Date().toISOString(),
  };

  console.log("Starting rcaWorkflow with alert:", alert);

  const result = await client.workflow.execute(rcaWorkflow, {
    taskQueue: "flarevision-incidents",
    workflowId: `rca-${alert.incidentId}-${Date.now()}`,
    args: [alert],
  });

  console.log("\nRCA Report:");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
