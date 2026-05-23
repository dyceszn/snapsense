<template>
  <section class="w-[75%] h-[60%] shadow-lg rounded-xl bg-[var(--primary)]">
    <form
      action=""
      class="flex flex-col justify-between w-full h-full p-8"
      @submit="handleSubmit"
    >
      <!-- Row 1 -->

      <div
        class="w-full h-[75%] flex flex-col-reverse justify-between md:flex-row md:h-[82.5%]"
      >
        <!-- Row 1 Col 1: Primary upload card -->

        <div
          class="w-full h-[90%] overflow-x-hidden md:w-[68.5%] md:h-full relative rounded-3xl bg-[var(--tertiary)]"
        >
          <img
            :src="imageUrl"
            alt="Preview"
            class="object-cover w-full h-full cursor-pointer md:max-w-full"
            @click="triggerFileInput"
          />
          <Tag :pic="ai" prop="Artificial Intelligence" />
          <input
            type="file"
            ref="imageUploadRef"
            accept="image/*"
            class="hidden"
            @change="handleFileChange"
          />
        </div>

        <!-- Row 1 Col 2: Header + decorative card -->

        <div
          class="w-full h-[10%] flex flex-col justify-between md:w-[28.5%] md:h-full"
        >
          <!-- Col 2 Row 1 -->

          <div class="w-full md:h-[45%] md:overflow-scroll">
            <h1 class="pb-8 font-semibold">SnapSense</h1>
            <p class="hidden md:block">
              Where creativity meets cutting-edge tech. Discover whether your
              photos are real or AI.<br /><br />
              &copy; 2024 dycelabs. All rights reserved.
            </p>
          </div>

          <!-- Col 2 Row 2: Decorative card (non-functional) -->

          <div
            class="w-full h-[90%] hidden overflow-hidden md:h-[50%] md:block relative rounded-3xl bg-[var(--tertiary)]"
          >
            <img
              :src="decorativeImage"
              alt="Sample"
              class="w-full h-auto max-w-full"
            />
            <Tag :pic="camera" prop="See the vision" />
          </div>
        </div>
      </div>

      <!-- Row 2: Status and Button -->

      <div
        class="w-full h-[20%] flex flex-col justify-between md:h-[12.5%] md:flex-row"
      >
        <div
          class="bg-[var(--secondary)] w-full h-[45%] px-4 rounded-3xl flex items-center md:w-[53%] md:h-full md:px-8"
        >
          <p class="truncate">
            {{ statusText }}
          </p>
        </div>

        <button
          :disabled="isSubmitting"
          class="main-btn bg-[var(--secondary)] rounded-3xl w-full h-[45%] md:w-[45%] md:h-full"
          type="submit"
        >
          {{ isSubmitting ? "Analyzing..." : "Analyze image origin" }}
        </button>
      </div>
    </form>
  </section>
  <hr class="w-[65%] border-[var(--primary)]" />

  <!-- Section 2: Result -->

  <section
    v-if="isAvailable"
    class="w-[75%] h-[20%] p-8 flex bg-[var(--primary)] rounded-xl justify-between"
  >
    <div
      class="w-[75%] md:w-[85%] flex flex-col justify-center items-center text-center"
    >
      <p class="w-full overflow-y-scroll text-left whitespace-pre-wrap">
        {{ resultText }}
      </p>
    </div>
    <div class="w-[10%] flex lg:items-end lg:w-[12%]">
      <div
        class="flex flex-col flex-wrap items-center justify-center w-full gap-6 lg:flex-row"
      >
        <!-- Like Button -->
        <button
          class="flex items-center justify-center transition-colors small-btn size-8"
          type="button"
          @click="toggleLike"
        >
          <ThumbsUp
            class="transition-colors size-6"
            :class="
              isLiked
                ? 'text-blue-500 fill-blue-500'
                : 'text-black hover:text-white'
            "
          />
        </button>

        <!-- Dislike Button -->
        <button
          class="flex items-center justify-center transition-colors small-btn size-8"
          type="button"
          @click="toggleDislike"
        >
          <ThumbsDown
            class="transition-colors size-6"
            :class="
              isDisliked
                ? 'text-red-500 fill-red-500'
                : 'text-black hover:text-white'
            "
          />
        </button>
        <button
          class="flex items-center justify-center transition-colors small-btn size-8"
          type="button"
          @click="copyToClipboardWithFeedback(resultText)"
        >
          <!-- Switches icon based on copy state -->
          <Check v-if="isCopied" class="text-green-500 size-6" />
          <Copy v-else class="text-black size-6 hover:text-white" />
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import { image1, image2, camera, ai } from "./assets";
import Tag from "./components/Tag.vue";
import { analyzeImage } from "./apis/imageAnalysisApi";
import { copyToClipboard } from "./apis/copyToClipApi";
import { appConfig } from "./config/env";
import type { ImageDetectionResponse } from "./types/aiDetection";
import { Copy, Check, ThumbsUp, ThumbsDown } from "@lucide/vue";

const isAvailable = ref<boolean>(false);
const isSubmitting = ref<boolean>(false);
const resultText = ref<string>("");
const isCopied = ref(false);
const isLiked = ref(false);
const isDisliked = ref(false);

const copyToClipboardWithFeedback = async (text: string) => {
  try {
    await copyToClipboard(text);
    isCopied.value = true;
    setTimeout(() => (isCopied.value = false), 2000); // Reset after 2 seconds
  } catch (error) {
    console.error("Copy failed:", error);
  }
};

const toggleLike = () => {
  isLiked.value = !isLiked.value;
  // Turning on 'like' turns off 'dislike'
  if (isLiked.value) isDisliked.value = false;
};

const toggleDislike = () => {
  isDisliked.value = !isDisliked.value;
  // Turning on 'dislike' turns off 'like'
  if (isDisliked.value) isLiked.value = false;
};

const statusText = computed(() => {
  if (isSubmitting.value) {
    return "Running AI-origin detection with Groq...";
  }
  return "Upload an image, then run AI-origin detection.";
});

// Single active upload
const imageUploadRef = ref<HTMLInputElement | null>(null);
const imageUrl = ref<string>(image2);
const imageFile = ref<File | null>(null);

// Decorative second card uses a static placeholder image
const decorativeImage = ref<string>(image1);

const triggerFileInput = () => {
  imageUploadRef.value?.click();
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files || !input.files[0]) return;

  const file = input.files[0];

  if (!file.type.startsWith("image/")) {
    resultText.value = "Please select a valid image file.";
    isAvailable.value = true;
    return;
  }

  if (file.size > appConfig.maxUploadBytes) {
    resultText.value = `File too large. Max supported size is ${Math.round(
      appConfig.maxUploadBytes / (1024 * 1024),
    )}MB.`;
    isAvailable.value = true;
    return;
  }

  cleanupBlobUrl(imageUrl.value);
  imageUrl.value = URL.createObjectURL(file);
  imageFile.value = file;
};

const cleanupBlobUrl = (url: string) => {
  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
};

const formatResult = (prediction: ImageDetectionResponse): string => {
  const verdict = prediction.isAIGenerated ? "AI-Generated" : "Human-Created";
  const pct = (prediction.confidence * 100).toFixed(1);
  return [
    `Verdict: ${verdict}`,
    `Confidence: ${pct}%`,
    `Model: ${prediction.model}`,
  ].join("\n");
};

const handleSubmit = async (event: Event) => {
  event.preventDefault();

  if (!imageFile.value) {
    resultText.value = "Upload an image before analyzing.";
    isAvailable.value = true;
    return;
  }

  isSubmitting.value = true;

  try {
    const result = await analyzeImage(imageFile.value);
    resultText.value = formatResult(result);
    isAvailable.value = true;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected detection error.";
    resultText.value = `Detection failed: ${message}`;
    isAvailable.value = true;
  } finally {
    isSubmitting.value = false;
  }
};

onBeforeUnmount(() => {
  cleanupBlobUrl(imageUrl.value);
});
</script>
