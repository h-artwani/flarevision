import type { z } from "zod";
import {
  AlertPayloadSchema,
  TriageResultSchema,
  LogAnalysisResultSchema,
  DeployCorrelationResultSchema,
  RCAReportSchema,
} from "./schemas.js";

export type AlertPayload = z.infer<typeof AlertPayloadSchema>;
export type TriageResult = z.infer<typeof TriageResultSchema>;
export type LogAnalysisResult = z.infer<typeof LogAnalysisResultSchema>;
export type DeployCorrelationResult = z.infer<typeof DeployCorrelationResultSchema>;
export type RCAReport = z.infer<typeof RCAReportSchema>;
