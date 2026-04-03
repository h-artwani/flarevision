import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisRequest, AnalysisResult } from "@flarevision/shared-types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeVideoActivity(request: AnalysisRequest): Promise<AnalysisResult> {
  const resultId = crypto.randomUUID();

  try {
    const message = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze the following video URL for fire and smoke detection.
Video URL: ${request.videoUrl}
Options: detectFire=${request.options?.detectFire ?? true}, detectSmoke=${request.options?.detectSmoke ?? true}

Respond in JSON format with an array of detections, each containing:
- type: "fire" | "smoke"
- confidence: number between 0 and 1
- timestamp: frame timestamp in seconds

Return only valid JSON like: { "detections": [...] }`,
            },
          ],
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    const parsed = JSON.parse(content.text) as { detections: AnalysisResult["detections"] };

    return {
      id: resultId,
      requestId: request.id,
      status: "completed",
      detections: parsed.detections ?? [],
      completedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      id: resultId,
      requestId: request.id,
      status: "failed",
      detections: [],
      error: error instanceof Error ? error.message : "Unknown error",
      completedAt: new Date().toISOString(),
    };
  }
}
