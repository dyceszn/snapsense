import type { AIProvider } from "./imageDetectionProvider";
import type { PredictionResult } from "../../types/aiDetection";

// Proxied through Vite — see vite.config.ts
const GROQ_ENDPOINT = "/api/groq/openai/v1/chat/completions";
const MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const SYSTEM_PROMPT =
  "You are an expert image forensics analyst. Your only job is to determine whether an image was AI-generated or captured by a human photographer / created by a human artist.";

const USER_PROMPT =
  "Analyze the image carefully. Look for signs of AI generation: unnatural textures, impossible lighting, warped geometry, uncanny-valley faces, repeated background patterns, or artifacts typical of diffusion models and GANs.\n\nRespond with a JSON object ONLY — no markdown, no extra text:\n{\"isAIGenerated\": true, \"confidence\": 0.87, \"reasoning\": \"brief explanation\"}";

type GroqMessage = {
  role: "system" | "user";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;
};

type GroqResponse = {
  choices?: Array<{
    message?: { content?: string };
  }>;
  error?: { message?: string };
};

export class GroqImageDetectionProvider implements AIProvider {
  async analyzeImage(image: File): Promise<PredictionResult> {
    const dataUrl = await this.fileToDataUrl(image);

    const messages: GroqMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: dataUrl } },
          { type: "text", text: USER_PROMPT },
        ],
      },
    ];

    const response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.1,
        max_tokens: 256,
      }),
    });

    const data = (await response.json()) as GroqResponse;

    if (!response.ok) {
      throw new Error(
        data?.error?.message ?? `Groq API error: ${response.status}`,
      );
    }

    const text = data?.choices?.[0]?.message?.content ?? "";
    return this.parseResponse(text);
  }

  private parseResponse(text: string): PredictionResult {
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]) as {
          isAIGenerated?: unknown;
          confidence?: unknown;
        };
        return {
          isAIGenerated: Boolean(parsed.isAIGenerated),
          confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0.5)),
          model: MODEL,
        };
      } catch {
        // fall through
      }
    }

    // Keyword heuristic fallback
    const lower = text.toLowerCase();
    const aiWords = ["ai-generated", "ai generated", "artificial", "synthetic", "diffusion", "gan"];
    const humanWords = ["human", "real photo", "photograph", "authentic", "natural"];
    const looksAI = aiWords.some((w) => lower.includes(w));
    const looksHuman = humanWords.some((w) => lower.includes(w));

    return {
      isAIGenerated: looksAI && !looksHuman,
      confidence: 0.6,
      model: MODEL,
    };
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
