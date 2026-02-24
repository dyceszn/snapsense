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
        <!-- Row 1 Col 1: Input box -->

        <div
          class="w-full h-[90%] overflow-x-hidden md:w-[68.5%] md:h-full relative rounded-3xl bg-[var(--tertiary)]"
        >
          <img
            :src="imageUrl1"
            alt="Preview"
            class="object-cover w-full h-full cursor-pointer md:max-w-full"
            @click="triggerFileInput('imageUpload1')"
          />
          <Tag :pic="ai" prop="Artificial Intelligence" />
          <input
            type="file"
            ref="imageUpload1"
            accept="image/*"
            class="hidden"
            @change="handleFileChange('imageUpload1', $event)"
          />
        </div>

        <!-- Row 1 Col 2: Header, Input box -->

        <div
          class="w-full h-[10%] flex flex-col justify-between md:w-[28.5%] md:h-full"
        >
          <!-- Col 2 Row 1 -->

          <div class="w-full md:h-[45%] md:overflow-scroll">
            <h1 class="pb-8 font-semibold">SnapSense</h1>
            <p class="hidden md:block">
              Where creativity meets cutting-edge tech. Discover how your photos
              come alive with AI-powered insights!<br /><br />
              &copy; 2024 dycelabs. All rights reserved.
            </p>
          </div>

          <!-- Col 2 Row 2 -->

          <div
            class="w-full h-[90%] hidden overflow-hidden md:h-[50%] md:block relative rounded-3xl bg-[var(--tertiary)]"
          >
            <img
              :src="imageUrl2"
              alt="Preview"
              class="w-full h-auto max-w-full cursor-pointer"
              @click="triggerFileInput('imageUpload2')"
            />
            <Tag :pic="camera" prop="See the vision" />
            <input
              type="file"
              ref="imageUpload2"
              accept="image/*"
              class="hidden"
              @change="handleFileChange('imageUpload2', $event)"
            />
          </div>
        </div>
      </div>

      <!-- Row 2: Select and Button -->

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

  <!-- Section 2: Lower Container -->

  <section
    v-if="isAvailable"
    class="w-[75%] h-[20%] p-8 flex bg-[var(--primary)] rounded-xl justify-between"
  >
    <div
      class="w-[75%] md:w-[85%] flex flex-col justify-center items-center text-center"
    >
      <p class="overflow-y-scroll whitespace-pre-wrap text-left w-full">
        {{ resultText }}
      </p>
    </div>
    <div
      class="w-[10%] flex flex-col items-center md:items-end md:flex-row md:w-[12%] justify-between"
    >
      <button class="small-btn size-8" type="button">
        <img :src="copy" alt="" @click="copyToClipboard(resultText)" />
      </button>
      <button class="small-btn size-8"><img :src="like" alt="" /></button>
      <button class="small-btn size-8"><img :src="dislike" alt="" /></button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import { image1, image2, camera, ai, like, dislike, copy } from "./assets";
import Tag from "./components/Tag.vue";
import { analyzeImage } from "./apis/imageAnalysisApi";
import { copyToClipboard } from "./apis/copyToClipApi";
import { appConfig } from "./config/env";
import type { ImageDetectionResponse } from "./types/aiDetection";

const isAvailable = ref<boolean>(false);
const isSubmitting = ref<boolean>(false);
const resultText = ref<string>("");
const statusText = computed(() => {
  if (isSubmitting.value) {
    return "Running AI-origin detection with Hugging Face...";
  }

  return "Upload one or two images, then run AI-origin detection.";
});

// References to the file input elements
const imageUpload1 = ref<HTMLInputElement | null>(null);
const imageUpload2 = ref<HTMLInputElement | null>(null);

const imageUrl1 = ref<string>(image2);
const imageUrl2 = ref<string>(image1);
const imageFile1 = ref<File | null>(null);
const imageFile2 = ref<File | null>(null);

// Function to trigger file input click
const triggerFileInput = (inputRef: "imageUpload1" | "imageUpload2") => {
  if (inputRef === "imageUpload1") {
    imageUpload1.value?.click();
  } else {
    imageUpload2.value?.click();
  }
};

const handleFileChange = (
  inputRef: "imageUpload1" | "imageUpload2",
  event: Event,
) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
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

    const previewUrl = URL.createObjectURL(file);
    if (inputRef === "imageUpload1") {
      cleanupBlobUrl(imageUrl1.value);
      imageUrl1.value = previewUrl;
      imageFile1.value = file;
    } else {
      cleanupBlobUrl(imageUrl2.value);
      imageUrl2.value = previewUrl;
      imageFile2.value = file;
    }
  }
};

const cleanupBlobUrl = (url: string) => {
  if (url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
};

type ImageSlot = "image1" | "image2";

const formatPrediction = (
  slot: ImageSlot,
  prediction: ImageDetectionResponse,
) => {
  return [
    `${slot}:`,
    JSON.stringify(prediction, null, 2),
    `classification: ${prediction.isAIGenerated ? "AI-generated" : "Human-created"}`,
    "",
  ].join("\n");
};

const handleSubmit = async (event: Event) => {
  event.preventDefault();

  if (!imageFile1.value && !imageFile2.value) {
    resultText.value = "Upload at least one image before analyzing.";
    isAvailable.value = true;
    return;
  }

  isSubmitting.value = true;

  try {
    const requests: Array<
      Promise<{ slot: ImageSlot; result: ImageDetectionResponse }>
    > = [];

    if (imageFile1.value) {
      requests.push(
        analyzeImage(imageFile1.value).then((result) => ({
          slot: "image1",
          result,
        })),
      );
    }

    if (imageFile2.value) {
      requests.push(
        analyzeImage(imageFile2.value).then((result) => ({
          slot: "image2",
          result,
        })),
      );
    }

    const analyses = await Promise.all(requests);
    resultText.value = analyses
      .map((analysis) => formatPrediction(analysis.slot, analysis.result))
      .join("\n");
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
  cleanupBlobUrl(imageUrl1.value);
  cleanupBlobUrl(imageUrl2.value);
});
</script>
