/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HUGGING_FACE_IMAGE_DETECTION_MODEL?: string;
  readonly VITE_HUGGING_FACE_IMAGE_DETECTION_MODELS?: string;
  readonly VITE_MAX_UPLOAD_BYTES?: string;
  readonly VITE_MODEL_VALIDATION_TIMEOUT_MS?: string;
  readonly VITE_MODEL_INFERENCE_TIMEOUT_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
