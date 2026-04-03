import { proxyActivities, defineSignal, setHandler, condition } from "@temporalio/workflow";
import type * as activities from "./activities";
import type { AnalysisRequest, AnalysisResult } from "@flarevision/shared-types";

const { analyzeVideoActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: "10 minutes",
  retry: {
    maximumAttempts: 3,
  },
});

export const cancelSignal = defineSignal("cancel");

export async function analyzeVideoWorkflow(request: AnalysisRequest): Promise<AnalysisResult> {
  let cancelled = false;
  setHandler(cancelSignal, () => {
    cancelled = true;
  });

  if (cancelled) {
    return {
      id: crypto.randomUUID(),
      requestId: request.id,
      status: "failed",
      detections: [],
      error: "Workflow cancelled before start",
    };
  }

  const result = await analyzeVideoActivity(request);
  return result;
}
