import { z } from "zod";
import { AnalysisRequestSchema, AnalysisResultSchema } from "./schemas";

export type AnalysisRequest = z.infer<typeof AnalysisRequestSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

export type Detection = AnalysisResult["detections"][number];
export type DetectionType = Detection["type"];
export type AnalysisStatus = AnalysisResult["status"];
