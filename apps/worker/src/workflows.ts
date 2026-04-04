import { proxyActivities, defineSignal, setHandler } from "@temporalio/workflow";
import type * as activities from "./activities";
import type { AlertPayload, RCAReport } from "@flarevision/shared-types";

const { triageAlertActivity, analyzeLogsActivity, correlateDeployActivity, generateRCAActivity } =
  proxyActivities<typeof activities>({
    startToCloseTimeout: "10 minutes",
    retry: {
      maximumAttempts: 3,
    },
  });

export const cancelSignal = defineSignal("cancel");

const earlyExitRCA: RCAReport = {
  rootCause: "Workflow cancelled before completion",
  timeline: [],
  recommendedFix: "",
  preventiveActions: [],
};

export async function rcaWorkflow(alert: AlertPayload): Promise<RCAReport> {
  let cancelled = false;
  setHandler(cancelSignal, () => {
    cancelled = true;
  });

  const [triage, logAnalysis, deployCorrelation] = await Promise.all([
    triageAlertActivity(alert),
    analyzeLogsActivity(alert.incidentId),
    correlateDeployActivity(alert.service, alert.triggeredAt),
  ]);

  if (cancelled) return earlyExitRCA;

  return generateRCAActivity(triage, logAnalysis, deployCorrelation);
}
