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
        <select
          name="platform"
          id=""
          v-model="selectedPlatform"
          class="bg-[var(--secondary)] w-full h-[45%] px-4 rounded-3xl appearance-none cursor-pointer md:w-[53%] md:h-full md:px-8"
        >
          <option value="" disabled selected>What's the vibe?</option>
          <option value="Gen-z Instagram">
            Insta - Captions that'll make your insta pop.
          </option>
          <option value="Twitter">
            X (Twitter) - Tweet-worthy captions that catch fire.
          </option>
          <option value="Friendly Facebook">
            Facebook - Friendly captions that spark engagements.
          </option>
          <option value="Professional Linkedin">
            LinkedIn - Professional captions that connect.
          </option>
          <option value="OCR">Optical Character Recognition</option>
        </select>

        <button
          class="main-btn bg-[var(--secondary)] rounded-3xl w-full h-[45%] md:w-[45%] md:h-full"
          type="submit"
        >
          Let's get you a caption
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
      <p class="overflow-y-scroll">
        {{ caption }}
      </p>
    </div>
    <div
      class="w-[10%] flex flex-col items-center md:items-end md:flex-row md:w-[12%] justify-between"
    >
      <button class="small-btn size-8">
        <img :src="copy" alt="" @click="copyToClipboard(caption)" />
      </button>
      <button class="small-btn size-8"><img :src="like" alt="" /></button>
      <button class="small-btn size-8"><img :src="dislike" alt="" /></button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { image1, image2, camera, ai, like, dislike, copy } from "./assets";
import Tag from "./components/Tag.vue";
import { detectImages } from "./apis/googleVisionApi";
import { detectTexts } from "./apis/textDetectionApi";
import { generateCaption } from "./apis/captionGenerationApi";
import { copyToClipboard } from "./apis/copyToClipApi";

const isAvailable = ref<boolean>(false);
const selectedPlatform = ref<string>("");
const caption = ref<string>("");

// References to the file input elements
const imageUpload1 = ref<HTMLInputElement | null>(null);
const imageUpload2 = ref<HTMLInputElement | null>(null);

// Base64 URLs for the preview images
const imageUrl1 = ref<string>(image2);
const imageUrl2 = ref<string>(image1);

// Store the base64 image strings for further processing
const base64Image1 = ref<string>("");
const base64Image2 = ref<string>("");

// Function to trigger file input click
const triggerFileInput = (inputRef: "imageUpload1" | "imageUpload2") => {
  if (inputRef === "imageUpload1") {
    imageUpload1.value?.click();
  } else {
    imageUpload2.value?.click();
  }
};

// Function to handle file selection and update the preview
const handleFileChange = (
  inputRef: "imageUpload1" | "imageUpload2",
  event: Event
) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (inputRef === "imageUpload1") {
        imageUrl1.value = e.target?.result as string;
        base64Image1.value = (e.target?.result as string).split(",")[1];
      } else {
        imageUrl2.value = e.target?.result as string;
        base64Image2.value = (e.target?.result as string).split(",")[1];
      }
    };

    reader.readAsDataURL(file);
  }
};

// Function to handle form submission
const handleSubmit = async (event: Event) => {
  event.preventDefault();
  const Images = {
    image1: base64Image1.value ? base64Image1.value : null,
    image2: base64Image2.value ? base64Image2.value : null,
  };

  if (selectedPlatform.value === "OCR") {
    const textResults = await detectTexts(Images);
    caption.value = textResults ?? "No text detected";
    isAvailable.value = true;
  } else {
    const context = await detectImages(Images);
    const textResults = await generateCaption(
      `Generate a ${selectedPlatform.value} post caption for my with this vision ai description: ${context}`
    );
    caption.value = textResults ?? "No caption generated";
    isAvailable.value = true;
  }
};
</script>
