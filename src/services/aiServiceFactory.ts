import { GroqImageDetectionProvider } from "../providers/ai/groqImageDetectionProvider";
import { ImageDetectionService } from "./imageDetectionService";

let detectionService: ImageDetectionService | null = null;

export const getImageDetectionService = (): ImageDetectionService => {
  if (detectionService) {
    return detectionService;
  }

  const provider = new GroqImageDetectionProvider();
  detectionService = new ImageDetectionService(provider);
  return detectionService;
};
