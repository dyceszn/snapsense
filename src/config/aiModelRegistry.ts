export interface AIModelRegistryEntry {
  id: string;
  useCase: "ai-generated-image-detection" | "deepfake-detection";
  reasoning: string;
}

const parseModelListFromEnv = (value: string | undefined): string[] => {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((modelId) => modelId.trim())
    .filter((modelId) => modelId.length > 0);
};

const dedupeById = (
  entries: AIModelRegistryEntry[],
): AIModelRegistryEntry[] => {
  const seen = new Set<string>();

  return entries.filter((entry) => {
    if (seen.has(entry.id)) {
      return false;
    }

    seen.add(entry.id);
    return true;
  });
};

export const buildAIModelRegistry = (
  envValue: string | undefined,
): AIModelRegistryEntry[] => {
  const configuredModels = parseModelListFromEnv(envValue).map((id) => ({
    id,
    useCase: "ai-generated-image-detection" as const,
    reasoning:
      "Configured by environment for controlled rollout without code changes.",
  }));

  if (configuredModels.length > 0) {
    return dedupeById(configuredModels);
  }

  return dedupeById([
    {
      id: "dima806/ai_vs_human_generated_image_detection",
      useCase: "ai-generated-image-detection",
      reasoning:
        "Primary: explicit AI-vs-human image classification model, active in 2026 with recent updates and endpoints-compatible tags.",
    },
    {
      id: "dima806/deepfake_vs_real_image_detection",
      useCase: "deepfake-detection",
      reasoning:
        "Fallback: mature and heavily used deepfake-vs-real classifier with strong download history and active maintenance metadata.",
    },
    {
      id: "capcheck/ai-human-generated-image-detection",
      useCase: "ai-generated-image-detection",
      reasoning:
        "Fallback: recent derivative of AI-vs-human classifier kept as additional redundancy to reduce single-model dependency risk.",
    },
  ]);
};
