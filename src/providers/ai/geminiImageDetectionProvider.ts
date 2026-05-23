import type { AIProvider } from "./imageDetectionProvider";
import type { PredictionResult } from "../../types/aiDetection";

const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const PROMPT = `Analyze this image and determine whether it was AI-generated or captured/created by a human.

Look for signs of AI generation: unnatural textures, impossible lighting, warped geometry, hyper-perfect features, artifacts, repeated patterns, or uncanny skin/hair.

Respond with a JSON object ONLY — no markdown, no extra text — in exactly this format:
{"isAIGenerated": true, "confidence": 0.87, "reasoning": "brief explanation"}`;

export class GeminiImageDetectionProvider implements AIProvider {
  constructor(private readonly apiKey: string) {}

  async analyzeImage(image: File): Promise<PredictionResult> {
    if (!this.apiKey) {
      throw new Error(
        "Gemini API key is not configured. Set VITE_GEMINI_API_KEY in your .env file.",
      );
    }

    const base64Data = await this.fileToBase64(image);

    const response = await fetch(`${GEMINI_URL}?key=${this.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: image.type || "image/jpeg",
                  data: base64Data,
                },
              },
              { text: PROMPT },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 256,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({})) as { error?: { message?: string } };
      throw new Error(
        err?.error?.message ?? `Gemini API error: ${response.status}`,
      );
    }

    const data = await response.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

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
          model: GEMINI_MODEL,
        };
      } catch {
        // fall through to heuristic
      }
    }

    // Fallback: keyword heuristic on plain-text response
    const lower = text.toLowerCase();
    const aiSignals = ["ai-generated", "ai generated", "artificial", "synthetic", "machine-generated"];
    const humanSignals = ["human", "real photo", "natural", "authentic", "photograph"];
    const looksAI = aiSignals.some((s) => lower.includes(s));
    const looksHuman = humanSignals.some((s) => lower.includes(s));

    return {
      isAIGenerated: looksAI && !looksHuman,
      confidence: 0.6,
      model: GEMINI_MODEL,
    };
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]); // strip data URL prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
