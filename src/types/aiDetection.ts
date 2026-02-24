export interface ImageClassificationLabel {
  label: string;
  score: number;
}

export interface PredictionResult {
  isAIGenerated: boolean;
  confidence: number;
  model: string;
}

export interface ModelAttemptError {
  model: string;
  stage: "validation" | "inference";
  message: string;
  statusCode?: number;
}

export interface StructuredProviderError {
  code:
    | "NO_AVAILABLE_MODELS"
    | "MODEL_VALIDATION_FAILED"
    | "MODEL_INFERENCE_FAILED"
    | "MODEL_RESPONSE_INVALID";
  message: string;
  attempts: ModelAttemptError[];
}

export type ImageDetectionResponse = PredictionResult;
