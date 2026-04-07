import { WorkflowNotFoundError } from "@temporalio/client";
import type { RCAReport } from "@flarevision/shared-types";
import { getTemporalClient } from "@/lib/temporal";

type WorkflowStatus = "running" | "completed" | "failed";

function mapStatus(temporalStatus: string): WorkflowStatus {
  if (temporalStatus === "COMPLETED") return "completed";
  if (temporalStatus === "RUNNING") return "running";
  return "failed";
}

const POLL_INTERVAL_MS = 2000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: workflowId } = await params;
  const encoder = new TextEncoder();

  const { client, connection } = await getTemporalClient();

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        const handle = client.workflow.getHandle(workflowId);

        while (true) {
          const description = await handle.describe();
          const status = mapStatus(description.status.name);

          let result: RCAReport | undefined;
          if (status === "completed") {
            result = await handle.result() as RCAReport;
          }

          send({ workflowId, status, result });

          if (status !== "running") break;

          await sleep(POLL_INTERVAL_MS);
        }
      } catch (err) {
        if (err instanceof WorkflowNotFoundError) {
          send({ workflowId, status: "failed", error: "Workflow not found" });
        } else {
          send({ workflowId, status: "failed", error: "An unexpected error occurred" });
        }
      } finally {
        controller.close();
      }
    },

    cancel() {
      connection.close().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
