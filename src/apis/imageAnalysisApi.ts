import type { ImageDetectionResponse } from "../types/aiDetection";
import { getImageDetectionService } from "../services/aiServiceFactory";

export const analyzeImage = async (
  file: File,
): Promise<ImageDetectionResponse> => {
  const service = getImageDetectionService();
  return service.detect(file);
};
