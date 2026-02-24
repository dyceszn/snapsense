import type { ImageDetectionResponse } from "../types/aiDetection";
import type { AIProvider } from "../providers/ai/imageDetectionProvider";

export class ImageDetectionService {
  constructor(private readonly provider: AIProvider) {}

  async detect(file: File): Promise<ImageDetectionResponse> {
    return this.provider.analyzeImage(file);
  }
}
