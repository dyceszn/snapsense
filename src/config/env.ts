import { buildAIModelRegistry } from "./aiModelRegistry";

const env = import.meta.env;

export const appConfig = {
  // Registry is centralized and can be replaced entirely from env without
  // touching provider or service code.
  imageDetectionModels: buildAIModelRegistry(
    (env.VITE_HUGGING_FACE_IMAGE_DETECTION_MODELS as string | undefined) ??
      (env.VITE_HUGGING_FACE_IMAGE_DETECTION_MODEL as string | undefined),
  ),
  maxUploadBytes: Number(env.VITE_MAX_UPLOAD_BYTES ?? 8 * 1024 * 1024),
  modelValidationTimeoutMs: Number(
    env.VITE_MODEL_VALIDATION_TIMEOUT_MS ?? 6_000,
  ),
  modelInferenceTimeoutMs: Number(
    env.VITE_MODEL_INFERENCE_TIMEOUT_MS ?? 30_000,
  ),
};
