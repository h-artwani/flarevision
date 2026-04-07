import { NextResponse } from "next/server";
import { AlertPayloadSchema } from "@flarevision/shared-types";
import { getTemporalClient } from "@/lib/temporal";

export async function POST(request: Request) {
  const body = await request.json();

  const parsed = AlertPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const alert = parsed.data;
  const workflowId = `rca-${alert.incidentId}-${Date.now()}`;

  const { client, connection } = await getTemporalClient();
  try {
    await client.workflow.start("rcaWorkflow", {
      taskQueue: "flarevision-incidents",
      workflowId,
      args: [alert],
    });

    return NextResponse.json({ workflowId, incidentId: alert.incidentId }, { status: 202 });
  } finally {
    await connection.close();
  }
}
