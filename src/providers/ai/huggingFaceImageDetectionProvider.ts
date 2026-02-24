import axios from "axios";
import type { AIModelRegistryEntry } from "../../config/aiModelRegistry";
import type {
  ImageClassificationLabel,
  ModelAttemptError,
  PredictionResult,
  StructuredProviderError,
} from "../../types/aiDetection";
import type { AIProvider } from "./imageDetectionProvider";

const AI_MARKERS = [
  "ai",
  "synthetic",
  "generated",
  "fake",
  "deepfake",
  "gan",
  "diffusion",
];
const HUMAN_MARKERS = [
  "human",
  "real",
  "natural",
  "authentic",
  "photo",
  "photograph",
];

type HuggingFaceErrorResponse = {
  error?: string;
  message?: string;
  estimated_time?: number;
  warning?: string;
};

type HuggingFaceModelMetadata = {
  id?: string;
  private?: boolean;
  gated?: boolean | "auto" | "manual";
  disabled?: boolean;
  pipeline_tag?: string;
};

export class AIProviderError extends Error {
  constructor(public readonly details: StructuredProviderError) {
    super(details.message);
    this.name = "AIProviderError";
  }
}

export class HuggingFaceImageDetectionProvider implements AIProvider {
  constructor(
    private readonly models: AIModelRegistryEntry[],
    private readonly options: {
      validationTimeoutMs: number;
      inferenceTimeoutMs: number;
    },
  ) {}

  async analyzeImage(image: File): Promise<PredictionResult> {
    const attempts: ModelAttemptError[] = [];

    if (this.models.length === 0) {
      throw new AIProviderError({
        code: "NO_AVAILABLE_MODELS",
        message: "No image-detection models are configured.",
        attempts,
      });
    }

    for (const model of this.models) {
      const modelId = model.id;

      try {
        await this.validateModelAvailability(modelId);
      } catch (error) {
        attempts.push(this.toAttemptError(modelId, "validation", error));
        continue;
      }

      try {
        const labels = await this.inferLabels(modelId, image);
        const prediction = this.resolvePrediction(labels);

        return {
          ...prediction,
          confidence: Number(prediction.confidence.toFixed(4)),
          model: modelId,
        };
      } catch (error) {
        attempts.push(this.toAttemptError(modelId, "inference", error));
      }
    }

    throw new AIProviderError({
      code: "MODEL_INFERENCE_FAILED",
      message:
        "All configured image-detection models failed. Please retry later or change the model registry.",
      attempts,
    });
  }

  private async validateModelAvailability(modelId: string): Promise<void> {
    const encodedModelId = this.encodeModelId(modelId);

    const response = await axios.get<HuggingFaceModelMetadata>(
      `/api/huggingface-hub/api/models/${encodedModelId}`,
      {
        timeout: this.options.validationTimeoutMs,
      },
    );

    const metadata = response.data;

    if (!metadata || !metadata.id) {
      throw new Error("Model metadata could not be retrieved.");
    }

    if (metadata.private || metadata.gated) {
      throw new Error("Model is private or gated and cannot be used reliably.");
    }

    if (metadata.disabled) {
      throw new Error("Model is disabled.");
    }

    if (metadata.pipeline_tag !== "image-classification") {
      throw new Error("Model pipeline is not image-classification.");
    }
  }

  private async inferLabels(
    modelId: string,
    image: File,
  ): Promise<ImageClassificationLabel[]> {
    const encodedModelId = this.encodeModelId(modelId);

    const response = await axios.post<
      ImageClassificationLabel[] | HuggingFaceErrorResponse
    >(`/api/huggingface/models/${encodedModelId}`, image, {
      headers: {
        "Content-Type": image.type || "application/octet-stream",
      },
      timeout: this.options.inferenceTimeoutMs,
    });

    if (!Array.isArray(response.data)) {
      const providerError = response.data;
      throw new Error(
        providerError.error ??
          providerError.message ??
          providerError.warning ??
          "Unexpected response payload.",
      );
    }

    if (response.data.length === 0) {
      throw new Error("Model returned no labels.");
    }

    return response.data;
  }

  private resolvePrediction(labels: ImageClassificationLabel[]): {
    isAIGenerated: boolean;
    confidence: number;
  } {
    const aiLabel = this.findBestLabel(labels, AI_MARKERS);
    const humanLabel = this.findBestLabel(labels, HUMAN_MARKERS);

    if (!aiLabel && !humanLabel) {
      const highestScore =
        labels.sort((left, right) => right.score - left.score)[0]?.score ?? 0;

      return {
        isAIGenerated: false,
        confidence: highestScore,
      };
    }

    if (!humanLabel || (aiLabel && aiLabel.score >= humanLabel.score)) {
      return {
        isAIGenerated: true,
        confidence: aiLabel?.score ?? 0,
      };
    }

    return {
      isAIGenerated: false,
      confidence: humanLabel.score,
    };
  }

  private findBestLabel(
    labels: ImageClassificationLabel[],
    markers: string[],
  ): ImageClassificationLabel | undefined {
    return labels
      .filter((entry) => {
        const normalized = entry.label.toLowerCase();
        return markers.some((marker) => normalized.includes(marker));
      })
      .sort((left, right) => right.score - left.score)[0];
  }

  private toAttemptError(
    model: string,
    stage: ModelAttemptError["stage"],
    error: unknown,
  ): ModelAttemptError {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data as
        | HuggingFaceErrorResponse
        | undefined;

      return {
        model,
        stage,
        message:
          responseData?.error ??
          responseData?.message ??
          responseData?.warning ??
          error.message,
        statusCode: error.response?.status,
      };
    }

    return {
      model,
      stage,
      message:
        error instanceof Error ? error.message : "Unknown provider error",
    };
  }

  private encodeModelId(modelId: string): string {
    const [owner, name] = modelId.split("/");

    if (!owner || !name) {
      return encodeURIComponent(modelId);
    }

    return `${encodeURIComponent(owner)}/${encodeURIComponent(name)}`;
  }
}
