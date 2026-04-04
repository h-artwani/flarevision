import { z } from "zod";

export const AlertPayloadSchema = z.object({
  incidentId: z.string(),
  service: z.string(),
  errorRate: z.number(),
  baseline: z.number(),
  region: z.string(),
  triggeredAt: z.string(),
});

export const TriageResultSchema = z.object({
  severity: z.enum(["P1", "P2", "P3"]),
  type: z.string(),
  affectedService: z.string(),
  estimatedImpact: z.string(),
  recommendedActions: z.array(z.string()),
});

export const LogAnalysisResultSchema = z.object({
  anomaly: z.string(),
  frequency: z.number().int().min(0),
  firstSeen: z.string(),
  correlatedWith: z.string().optional(),
});

export const DeployCorrelationResultSchema = z.object({
  recentDeploy: z.string().optional(),
  deployedAt: z.string().optional(),
  changedFiles: z.array(z.string()),
  correlationFound: z.boolean(),
  correlationSummary: z.string(),
});

export const RCAReportSchema = z.object({
  rootCause: z.string(),
  timeline: z.array(z.string()),
  recommendedFix: z.string(),
  preventiveActions: z.array(z.string()),
});
