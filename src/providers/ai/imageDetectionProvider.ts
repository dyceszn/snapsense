import type { PredictionResult } from "../../types/aiDetection";

export interface AIProvider {
  analyzeImage(image: File): Promise<PredictionResult>;
}
