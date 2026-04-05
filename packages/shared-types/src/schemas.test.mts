import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  AlertPayloadSchema,
  TriageResultSchema,
  LogAnalysisResultSchema,
  DeployCorrelationResultSchema,
  RCAReportSchema,
} from "./schemas.ts";

describe("AlertPayloadSchema", () => {
  const valid = {
    incidentId: "inc-001",
    service: "payments-api",
    errorRate: 12.5,
    baseline: 0.3,
    region: "us-east-1",
    triggeredAt: "2026-04-04T10:00:00Z",
  };

  it("accepts a valid payload", () => {
    const result = AlertPayloadSchema.safeParse(valid);
    assert.ok(result.success);
  });

  it("rejects missing required fields", () => {
    const { incidentId: _, ...missing } = valid;
    const result = AlertPayloadSchema.safeParse(missing);
    assert.ok(!result.success);
  });

  it("rejects non-numeric errorRate", () => {
    const result = AlertPayloadSchema.safeParse({ ...valid, errorRate: "high" });
    assert.ok(!result.success);
  });
});

describe("TriageResultSchema", () => {
  const valid = {
    severity: "P1",
    type: "latency-spike",
    affectedService: "payments-api",
    estimatedImpact: "~40% of checkout transactions failing",
    recommendedActions: ["page on-call", "check recent deploys"],
  };

  it("accepts a valid triage result", () => {
    const result = TriageResultSchema.safeParse(valid);
    assert.ok(result.success);
  });

  it("rejects an invalid severity value", () => {
    const result = TriageResultSchema.safeParse({ ...valid, severity: "P0" });
    assert.ok(!result.success);
  });

  it("rejects recommendedActions that is not an array", () => {
    const result = TriageResultSchema.safeParse({ ...valid, recommendedActions: "page on-call" });
    assert.ok(!result.success);
  });
});

describe("LogAnalysisResultSchema", () => {
  it("accepts a result with correlatedWith present", () => {
    const result = LogAnalysisResultSchema.safeParse({
      anomaly: "NullPointerException in PaymentProcessor",
      frequency: 847,
      firstSeen: "2026-04-04T09:52:00Z",
      correlatedWith: "deploy-sha-abc123",
    });
    assert.ok(result.success);
  });

  it("accepts a result without correlatedWith (optional)", () => {
    const result = LogAnalysisResultSchema.safeParse({
      anomaly: "ConnectionTimeoutError",
      frequency: 12,
      firstSeen: "2026-04-04T09:55:00Z",
    });
    assert.ok(result.success);
  });

  it("rejects a negative frequency", () => {
    const result = LogAnalysisResultSchema.safeParse({
      anomaly: "error",
      frequency: -1,
      firstSeen: "2026-04-04T09:55:00Z",
    });
    assert.ok(!result.success);
  });

  it("rejects a float frequency", () => {
    const result = LogAnalysisResultSchema.safeParse({
      anomaly: "error",
      frequency: 3.5,
      firstSeen: "2026-04-04T09:55:00Z",
    });
    assert.ok(!result.success);
  });
});

describe("DeployCorrelationResultSchema", () => {
  it("accepts a result with correlation found", () => {
    const result = DeployCorrelationResultSchema.safeParse({
      recentDeploy: "v2.4.1",
      deployedAt: "2026-04-04T09:45:00Z",
      changedFiles: ["src/payment/processor.ts", "src/payment/retry.ts"],
      correlationFound: true,
      correlationSummary: "Deploy v2.4.1 modified PaymentProcessor 7 minutes before incident",
    });
    assert.ok(result.success);
  });

  it("accepts a result with no correlation (optional deploy fields absent)", () => {
    const result = DeployCorrelationResultSchema.safeParse({
      changedFiles: [],
      correlationFound: false,
      correlationSummary: "No deploys in the 2 hours preceding the incident",
    });
    assert.ok(result.success);
  });

  it("rejects missing correlationFound", () => {
    const result = DeployCorrelationResultSchema.safeParse({
      correlationSummary: "some summary",
      changedFiles: [],
    });
    assert.ok(!result.success);
  });
});

describe("RCAReportSchema", () => {
  const valid = {
    rootCause: "Memory leak in PaymentProcessor introduced in v2.4.1",
    timeline: [
      "09:45 — v2.4.1 deployed to production",
      "09:52 — error rate begins climbing",
      "10:00 — alert triggered",
    ],
    recommendedFix: "Revert v2.4.1 or patch retry loop memory leak",
    preventiveActions: ["add load test to CI", "set memory alert threshold"],
  };

  it("accepts a valid RCA report", () => {
    const result = RCAReportSchema.safeParse(valid);
    assert.ok(result.success);
  });

  it("rejects non-array timeline", () => {
    const result = RCAReportSchema.safeParse({ ...valid, timeline: "single event" });
    assert.ok(!result.success);
  });

  it("rejects missing rootCause", () => {
    const { rootCause: _, ...missing } = valid;
    const result = RCAReportSchema.safeParse(missing);
    assert.ok(!result.success);
  });
});