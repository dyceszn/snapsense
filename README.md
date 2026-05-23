# SnapSense

SnapSense is a Vue 3 + TypeScript web app that analyzes an uploaded image and predicts whether it is AI-generated or human-created. The current runtime path uses a Groq-hosted vision-capable model via a Vite server proxy, then returns a structured result with verdict, confidence, and model name.

## What This Project Solves

The app provides a lightweight frontend workflow for image-origin checks:

- Upload one image through the main preview card.
- Run AI-origin analysis with a single action.
- View a clear result summary in the UI.

This is useful for fast authenticity screening, demos, and product experiments where a full backend service is not required.

## Tech Stack

- Vue 3 with Composition API and TypeScript
- Vite for development server and proxying
- Tailwind CSS for styling and layout utilities
- Lucide Vue for action icons
- Fetch and Axios (Axios is present for provider variants)

## Current Runtime Architecture

The active analysis flow is:

1. UI collects one image in `App.vue`.
2. API adapter `apis/imageAnalysisApi.ts` forwards the file.
3. Service `services/imageDetectionService.ts` calls the provider.
4. Factory `services/aiServiceFactory.ts` currently instantiates `GroqImageDetectionProvider`.
5. Provider sends a multimodal request to Groq through `/api/groq/...` (configured in Vite proxy).
6. Provider parses model output into a typed result:

```json
{
  "isAIGenerated": true,
  "confidence": 0.87,
  "model": "meta-llama/llama-4-scout-17b-16e-instruct"
}
```

If structured JSON is not returned by the model, the provider applies a keyword heuristic fallback to still produce a result.

## Project Structure

```text
src/
	App.vue                         Main UI: upload, submit, result rendering
	main.ts                         Vue app bootstrap
	style.css                       Global styles and Tailwind directives

	apis/
		imageAnalysisApi.ts           Thin app-facing analysis adapter
		copyToClipApi.ts              Clipboard helper for result text

	services/
		aiServiceFactory.ts           Wires and caches active AI provider
		imageDetectionService.ts      Service layer over provider contract

	providers/
		ai/
			imageDetectionProvider.ts   Shared provider interface
			groqImageDetectionProvider.ts      Active provider
			geminiImageDetectionProvider.ts    Alternative provider implementation
			huggingFaceImageDetectionProvider.ts Legacy/alternative provider implementation

	config/
		env.ts                        Runtime config (for example max upload size)
		aiModelRegistry.ts            Model registry utility used by provider variants

	types/
		aiDetection.ts                Shared detection types/contracts

	components/
		Tag.vue                       Reusable image card tag component

	assets/                         Icons and placeholder/preview images
```

## UX and Behavior Notes

- Only one upload input is active (the large primary card).
- The secondary card is decorative/non-interactive.
- File validation checks image MIME type and file size before inference.
- Result panel includes copy, like, and dislike interactions.
- Blob URL cleanup is handled on component teardown to prevent browser memory leaks.

## Configuration

Use the existing `.env.example` as a baseline:

```bash
# Required for the current provider path
GROQ_API_KEY=your_groq_api_key_here

# Optional
VITE_MAX_UPLOAD_BYTES=8388608
```

Notes:

- The Groq key is read by Vite proxy config (`vite.config.ts`) and attached server-side to proxied requests.
- The key intentionally does not require a `VITE_` prefix for the default setup shown in `.env.example`.

## Local Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## How Detection Output Is Displayed

The UI formats the returned typed response into three lines:

- Verdict (`AI-Generated` or `Human-Created`)
- Confidence percentage
- Model identifier used for inference

## License

This project is licensed under the MIT License. See `LICENSE`.
