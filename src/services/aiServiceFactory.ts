import { appConfig } from "../config/env";
import { HuggingFaceImageDetectionProvider } from "../providers/ai/huggingFaceImageDetectionProvider";
import { ImageDetectionService } from "./imageDetectionService";

let detectionService: ImageDetectionService | null = null;

export const getImageDetectionService = (): ImageDetectionService => {
  if (detectionService) {
    return detectionService;
  }

  const provider = new HuggingFaceImageDetectionProvider(
    appConfig.imageDetectionModels,
    {
      validationTimeoutMs: appConfig.modelValidationTimeoutMs,
      inferenceTimeoutMs: appConfig.modelInferenceTimeoutMs,
    },
  );

  detectionService = new ImageDetectionService(provider);
  return detectionService;
};
