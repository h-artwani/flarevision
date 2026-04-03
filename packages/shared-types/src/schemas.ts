import { z } from "zod";

export const AnalysisRequestSchema = z.object({
  id: z.string().uuid(),
  videoUrl: z.string().url(),
  requestedAt: z.string().datetime(),
  options: z
    .object({
      detectFire: z.boolean().default(true),
      detectSmoke: z.boolean().default(true),
    })
    .optional(),
});

export const AnalysisResultSchema = z.object({
  id: z.string().uuid(),
  requestId: z.string().uuid(),
  status: z.enum(["pending", "processing", "completed", "failed"]),
  detections: z
    .array(
      z.object({
        type: z.enum(["fire", "smoke"]),
        confidence: z.number().min(0).max(1),
        timestamp: z.number(),
        boundingBox: z
          .object({
            x: z.number(),
            y: z.number(),
            width: z.number(),
            height: z.number(),
          })
          .optional(),
      })
    )
    .default([]),
  completedAt: z.string().datetime().optional(),
  error: z.string().optional(),
});
