import { NextResponse } from "next/server";
import { WorkflowNotFoundError } from "@temporalio/client";
import type { RCAReport } from "@flarevision/shared-types";
import { getTemporalClient } from "@/lib/temporal";

type WorkflowStatus = "running" | "completed" | "failed";

function mapStatus(temporalStatus: string): WorkflowStatus {
  if (temporalStatus === "COMPLETED") return "completed";
  if (temporalStatus === "RUNNING") return "running";
  return "failed";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: workflowId } = await params;

  const { client, connection } = await getTemporalClient();
  try {
    const handle = client.workflow.getHandle(workflowId);
    const description = await handle.describe();
    const status = mapStatus(description.status.name);

    let result: RCAReport | undefined;
    if (status === "completed") {
      result = await handle.result() as RCAReport;
    }

    return NextResponse.json({ workflowId, status, result });
  } catch (err) {
    if (err instanceof WorkflowNotFoundError) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }
    throw err;
  } finally {
    await connection.close();
  }
}
