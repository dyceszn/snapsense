<template>
  <div
    class="absolute z-10 flex items-center h-12 p-2 bg-white rounded-full tag w-fit bottom-3 left-3"
  >
    <img :src="pic" alt="" class="mr-2 size-8" />
    <p class="mr-3">{{ prop }}</p>
  </div>
</template>

<script lang="ts">
import { ai } from "../assets";
export default {
  name: "Tag",
  props: {
    prop: {
      type: String,
      required: true,
    },
    pic: {
      type: String,
      default: ai,
    },
  },
  data() {
    return {
      ai,
    };
  },
};
</script>
