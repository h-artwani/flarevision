import Anthropic from "@anthropic-ai/sdk";
import type {
  AlertPayload,
  TriageResult,
  LogAnalysisResult,
  DeployCorrelationResult,
  RCAReport,
} from "@flarevision/shared-types";
import { RCAReportSchema } from "@flarevision/shared-types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function triageAlertActivity(alert: AlertPayload): Promise<TriageResult> {
  const message = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Triage the following production alert and respond with JSON only.

Alert:
- Incident ID: ${alert.incidentId}
- Service: ${alert.service}
- Error rate: ${alert.errorRate} (baseline: ${alert.baseline})
- Region: ${alert.region}
- Triggered at: ${alert.triggeredAt}

Return JSON matching this shape exactly:
{
  "severity": "P1" | "P2" | "P3",
  "type": string,
  "affectedService": string,
  "estimatedImpact": string,
  "recommendedActions": string[]
}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type from Claude");
  return JSON.parse(content.text) as TriageResult;
}

export async function analyzeLogsActivity(incidentId: string): Promise<LogAnalysisResult> {
  const message = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Analyze logs for incident ${incidentId} and return JSON only.

Return JSON matching this shape exactly:
{
  "anomaly": string,
  "frequency": number,
  "firstSeen": string,
  "correlatedWith": string
}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type from Claude");
  return JSON.parse(content.text) as LogAnalysisResult;
}

export async function correlateDeployActivity(
  service: string,
  triggeredAt: string
): Promise<DeployCorrelationResult> {
  const message = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Check recent deploys for service "${service}" around ${triggeredAt} and return JSON only.

Return JSON matching this shape exactly:
{
  "recentDeploy": string,
  "deployedAt": string,
  "changedFiles": string[],
  "correlationFound": boolean,
  "correlationSummary": string
}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type from Claude");
  return JSON.parse(content.text) as DeployCorrelationResult;
}

export async function generateRCAActivity(
  triage: TriageResult,
  logAnalysis: LogAnalysisResult,
  deployCorrelation: DeployCorrelationResult
): Promise<RCAReport> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are an SRE. Synthesize the following investigation results into a complete root cause analysis report. Respond with JSON only.

Triage:
${JSON.stringify(triage, null, 2)}

Log Analysis:
${JSON.stringify(logAnalysis, null, 2)}

Deploy Correlation:
${JSON.stringify(deployCorrelation, null, 2)}

Return JSON matching this shape exactly:
{
  "rootCause": string,
  "timeline": string[],
  "recommendedFix": string,
  "preventiveActions": string[]
}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type from Claude");
  return RCAReportSchema.parse(JSON.parse(content.text));
}
