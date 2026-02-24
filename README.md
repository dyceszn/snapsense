# SnapSense

SnapSense is focused on **AI image-origin detection** (AI-generated vs human-created) using a **free Hugging Face provider with model failover**.

## What Changed

- Removed mixed provider architecture (Google Vision + Hugging Face).
- Introduced a clean AI detection stack with typed boundaries.
- Replaced deprecated model selection with an actively maintained model registry.
- Migrated inference traffic to the current Hugging Face router endpoint.
- Added structured detection output:

```json
{
  "isAIGenerated": true,
  "confidence": 0.9471,
  "model": "dima806/ai_vs_human_generated_image_detection"
}
```

## Model Selection

Default primary/fallback models:

- `dima806/ai_vs_human_generated_image_detection` (primary)
- `dima806/deepfake_vs_real_image_detection` (fallback #1)
- `capcheck/ai-human-generated-image-detection` (fallback #2)

Why this model set:

- All are public, non-gated, non-disabled `image-classification` models.
- Metadata shows active maintenance in recent periods and endpoint compatibility tags.
- Fallback ordering avoids single-model lock-in when any model becomes unavailable.

You can replace the entire ordered model registry via environment variables with no code changes.

## Architecture (Clean Layers)

Updated structure:

```text
src/
	apis/
		imageAnalysisApi.ts           # Thin endpoint adapter (no business logic)
		copyToClipApi.ts
	config/
		env.ts                        # Centralized environment config
		aiModelRegistry.ts            # Ordered model registry + rationale
	providers/
		ai/
			imageDetectionProvider.ts   # Provider contract (AIProvider)
			huggingFaceImageDetectionProvider.ts
	services/
		aiServiceFactory.ts           # Dependency wiring
		imageDetectionService.ts      # App-level orchestration
	types/
		aiDetection.ts                # Shared typed contracts + structured errors
	App.vue
```

Design principles implemented:

- Separation of concerns.
- Provider/application logic isolation.
- Strong TypeScript typing.
- Async error handling and centralized configuration.
- Automatic model availability validation and fallback.
- Easily extensible provider/model strategy.

## Environment Setup

Copy `.env.example` to `.env` and set:

```bash
VITE_HUGGING_FACE_API_KEY=hf_your_token_here
VITE_HUGGING_FACE_IMAGE_DETECTION_MODELS=dima806/ai_vs_human_generated_image_detection,dima806/deepfake_vs_real_image_detection,capcheck/ai-human-generated-image-detection
VITE_MAX_UPLOAD_BYTES=8388608
VITE_MODEL_VALIDATION_TIMEOUT_MS=6000
VITE_MODEL_INFERENCE_TIMEOUT_MS=30000
```

## API Usage Example

Internal endpoint adapter used by UI:

```ts
import { analyzeImage } from "./apis/imageAnalysisApi";

const file = input.files?.[0];
if (file) {
  const result = await analyzeImage(file);
  console.log(result);
}
```

Example response:

```json
{
  "isAIGenerated": false,
  "confidence": 0.8842,
  "model": "dima806/deepfake_vs_real_image_detection"
}
```

## Performance/UX Notes

- Uses binary file upload to inference API (avoids base64 inflation).
- Validates image type and size before request.
- Validates model metadata before inference requests.
- Uses automatic ordered failover across configured models.
- Uses parallel analysis when two images are uploaded.
- Returns clean, structured output for easy UI/analytics integration.

## Run

```bash
npm install
npm run dev
```

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE).
